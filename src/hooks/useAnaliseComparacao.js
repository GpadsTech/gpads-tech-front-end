import { useState, useEffect, useRef, useCallback } from 'react'
import { getEquipmentHistory } from '../services/telemetryService.js'

const UNIDADES_VARIAVEIS = {
  temperatura: '°C',
  umidade: '%',
  pressao: 'hPa',
  vento: 'm/s',
  rpm: 'RPM',
  luz: 'lx',
  ar: 'AQI',
  gas: 'ppm',
  volt: 'V',
  ph: '',
  turbidez_ntu: 'NTU',
  sensor_uv_v: 'V',
  adc: '',
}

function calcularDuracaoDias(inicio, fim) {
  const dtInicio = new Date(`${inicio}T00:00:00`)
  const dtFim = new Date(`${fim}T00:00:00`)
  return Math.round((dtFim - dtInicio) / (1000 * 60 * 60 * 24))
}

function extrairSerieVariavel(dados, variavel) {
  if (!Array.isArray(dados)) return []
  return dados
    .filter((item) => item[variavel] !== undefined && item[variavel] !== null && Number.isFinite(Number(item[variavel])))
    .map((item, idx) => ({
      indice: idx + 1,
      hora: item.hora || '',
      valor: Number(item[variavel]),
      unidade: item.unidade ?? UNIDADES_VARIAVEIS[variavel] ?? '',
    }))
}

export function useAnaliseComparacao(equipamentoId) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const controllerRef = useRef(null)
  const requestIdRef = useRef(0)

  const limparComparacao = useCallback(() => {
    controllerRef.current?.abort()
    requestIdRef.current += 1
    setData(null)
    setError('')
    setLoading(false)
  }, [])

  useEffect(() => {
    limparComparacao()
    return () => {
      controllerRef.current?.abort()
    }
  }, [equipamentoId, limparComparacao])

  const buscarComparacao = useCallback(
    async ({ variavel, inicioAtual, fimAtual, inicioAnterior, fimAnterior }) => {
      controllerRef.current?.abort()
      const controller = new AbortController()
      controllerRef.current = controller
      const requestId = ++requestIdRef.current

      setLoading(true)
      setError('')

      try {
        if (!equipamentoId) {
          throw new Error('Selecione um equipamento antes de comparar períodos.')
        }
        if (!variavel) {
          throw new Error('Selecione uma variável para comparação.')
        }
        if (!inicioAtual || !fimAtual || !inicioAnterior || !fimAnterior) {
          throw new Error('Preencha todas as datas do período atual e do período anterior.')
        }
        if (inicioAtual > fimAtual || inicioAnterior > fimAnterior) {
          throw new Error('A data inicial não pode ser posterior à data final.')
        }

        const duracaoAtual = calcularDuracaoDias(inicioAtual, fimAtual)
        const duracaoAnterior = calcularDuracaoDias(inicioAnterior, fimAnterior)

        if (duracaoAtual !== duracaoAnterior) {
          throw new Error(
            `Os períodos devem ter a mesma duração (Atual: ${duracaoAtual + 1} dia(s), Anterior: ${duracaoAnterior + 1} dia(s)).`
          )
        }

        const paramsAtual = new URLSearchParams({ inicio: inicioAtual, fim: fimAtual })
        const paramsAnterior = new URLSearchParams({ inicio: inicioAnterior, fim: fimAnterior })

        const [respAtual, respAnterior] = await Promise.all([
          getEquipmentHistory(equipamentoId, paramsAtual, { signal: controller.signal }),
          getEquipmentHistory(equipamentoId, paramsAnterior, { signal: controller.signal }),
        ])

        // Descarta resposta atrasada caso o usuário tenha mudado equipamento/filtros
        if (controller.signal.aborted || requestId !== requestIdRef.current) {
          return
        }

        const serieAtual = extrairSerieVariavel(respAtual?.dados, variavel)
        const serieAnterior = extrairSerieVariavel(respAnterior?.dados, variavel)

        if (serieAtual.length === 0 && serieAnterior.length === 0) {
          throw new Error('Nenhum registro válido encontrado para esta variável em ambos os períodos.')
        }
        if (serieAtual.length === 0) {
          throw new Error('Sem dados válidos no período atual para a variável selecionada.')
        }
        if (serieAnterior.length === 0) {
          throw new Error('Sem dados válidos no período anterior para a variável selecionada.')
        }

        const unidadeAtual = serieAtual[0].unidade
        const unidadeAnterior = serieAnterior[0].unidade
        if (unidadeAtual && unidadeAnterior && unidadeAtual !== unidadeAnterior) {
          throw new Error(
            `Unidades incompatíveis entre os períodos (${unidadeAtual} vs. ${unidadeAnterior}).`
          )
        }

        const mediaAtual =
          serieAtual.reduce((acc, item) => acc + item.valor, 0) / serieAtual.length
        const mediaAnterior =
          serieAnterior.reduce((acc, item) => acc + item.valor, 0) / serieAnterior.length
        const diferencaAbsoluta = Math.abs(mediaAtual - mediaAnterior)

        // Alinha as duas séries ponto a ponto para exibir no gráfico comparativo
        const tamanhoMaximo = Math.max(serieAtual.length, serieAnterior.length)
        const seriesAlinhadas = Array.from({ length: tamanhoMaximo }, (_, i) => ({
          ponto: `#${i + 1}`,
          atual: serieAtual[i]?.valor ?? null,
          anterior: serieAnterior[i]?.valor ?? null,
          horaAtual: serieAtual[i]?.hora ?? '—',
          horaAnterior: serieAnterior[i]?.hora ?? '—',
        }))

        setData({
          variavel,
          unidade: unidadeAtual || UNIDADES_VARIAVEIS[variavel] || '',
          periodo_1: {
            inicio: inicioAtual,
            fim: fimAtual,
            media: mediaAtual,
            registros_validos: serieAtual.length,
          },
          periodo_2: {
            inicio: inicioAnterior,
            fim: fimAnterior,
            media: mediaAnterior,
            registros_validos: serieAnterior.length,
          },
          diferenca_absoluta: diferencaAbsoluta,
          seriesAlinhadas,
        })
      } catch (err) {
        if (err.name === 'AbortError' || controller.signal.aborted) {
          return
        }
        if (requestId === requestIdRef.current) {
          setError(err.message || 'Não foi possível comparar os períodos.')
          setData(null)
        }
      } finally {
        if (!controller.signal.aborted && requestId === requestIdRef.current) {
          setLoading(false)
        }
      }
    },
    [equipamentoId]
  )

  return {
    comparacao: data,
    carregandoComparacao: loading,
    erroComparacao: error,
    buscarComparacao,
    limparComparacao,
  }
}