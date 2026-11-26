import { httpClient } from './httpClient.js'

const USAR_FIXTURE = false // Mude para true se precisar voltar aos dados simulados

function simuleDelay(ms = 800, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      return reject(new DOMException('Aborted', 'AbortError'))
    }
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
}

function gerarFixtureResumo({ equipamentoId, variavel, inicio, fim }) {
  if (variavel === 'sem_dados') {
    return {
      equipamento_id: Number(equipamentoId),
      variavel,
      unidade: '',
      periodo: { inicio, fim },
      estatisticas: null,
      qualidade_dos_dados: {
        registros_analisados: 0,
        registros_validos: 0,
        registros_nulos: 0,
        registros_invalidos: 0,
        registros_utilizados: 0
      }
    }
  }

  const isPh = variavel?.toLowerCase() === 'ph'

  return {
    equipamento_id: Number(equipamentoId),
    variavel: variavel.toLowerCase(),
    unidade: isPh ? 'pH' : '°C',
    periodo: { inicio, fim },
    estatisticas: isPh
      ? { media: 5.61, minimo: 5.54, maximo: 5.82 }
      : { media: 24.8, minimo: 22.1, maximo: 27.4 },
    qualidade_dos_dados: {
      registros_analisados: 72,
      registros_validos: 50,
      registros_nulos: 10,
      registros_invalidos: 12,
      registros_utilizados: 50
    }
  }
}

export async function getResumoAnalise({ equipamentoId, variavel, inicio, fim, signal }) {
  if (USAR_FIXTURE) {
    await simuleDelay(800, signal)
    return gerarFixtureResumo({ equipamentoId, variavel, inicio, fim })
  }

  const params = new URLSearchParams({
    variavel,
    inicio,
    fim
  })

  // Usa o mesmo transporte comum, prefixo /api/ e barra final do telemetryService.js
  return httpClient.json(
    `/api/equipamentos/${encodeURIComponent(equipamentoId)}/analise/resumo/?${params.toString()}`,
    { authenticated: true, signal }
  )
}
export async function getQualidadeEquipamento({ equipamentoId, signal }) {
  if (!equipamentoId) {
    throw new Error('Identificador do equipamento não informado.')
  }

  return httpClient.json(
    `/api/equipamentos/${encodeURIComponent(equipamentoId)}/analise/qualidade/`,
    { authenticated: true, signal }
  )
}