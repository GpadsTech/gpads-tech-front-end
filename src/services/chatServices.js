import { httpClient } from './httpClient.js'
import { getEquipmentHistory } from './telemetryService.js'

const VARIAVEIS_POR_TIPO = {
  estacao: [
    { key: 'temperatura', nome: 'Temperatura', unidade: '°C' },
    { key: 'umidade', nome: 'Umidade', unidade: '%' },
    { key: 'pressao', nome: 'Pressão', unidade: '' },
    { key: 'vento', nome: 'Vento', unidade: '' },
    { key: 'rpm', nome: 'RPM', unidade: 'RPM' },
    { key: 'luz', nome: 'Luminosidade', unidade: '' },
    { key: 'ar', nome: 'Qualidade do ar', unidade: '' },
    { key: 'gas', nome: 'Gás', unidade: '' },
    { key: 'volt', nome: 'Tensão Elétrica', unidade: 'V' },
  ],
  boia: [
    { key: 'ph', nome: 'pH', unidade: '' },
    { key: 'turbidez_ntu', nome: 'Turbidez', unidade: 'NTU' },
    { key: 'sensor_uv_v', nome: 'Sensor UV', unidade: 'V' },
    { key: 'adc', nome: 'ADC', unidade: '' },
  ],
}

function formatarDataBR(dataISO) {
  if (!dataISO || !/^\d{4}-\d{2}-\d{2}$/.test(dataISO)) return dataISO || ''
  const [ano, mes, dia] = dataISO.split('-')
  return `${dia}/${mes}/${ano}`
}

export function montarRelatorioReal({ equipamento, dados, periodo }) {
  const series = Array.isArray(dados) ? dados : []
  const tipo = equipamento?.tipo?.toLowerCase() || ''
  const nomeEquipamento = equipamento?.nome || equipamento?.identificador || 'Equipamento'

  const kpis = [
    { label: 'Registros no período', valor: String(series.length) },
  ]

  if (series.length > 0) {
    const ultima = series[series.length - 1]
    if (ultima?.hora) {
      kpis.push({ label: 'Última leitura', valor: String(ultima.hora) })
    }

    // Calcula a média real da primeira variável disponível do tipo do equipamento
    const configs = VARIAVEIS_POR_TIPO[tipo] || []
    for (const cfg of configs) {
      const valores = series
        .map((item) => Number(item[cfg.key]))
        .filter((n) => Number.isFinite(n))

      if (valores.length > 0) {
        const media = valores.reduce((acc, v) => acc + v, 0) / valores.length
        const mediaFmt = media.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
        kpis.push({
          label: `Média ${cfg.nome}`,
          valor: cfg.unidade ? `${mediaFmt} ${cfg.unidade}` : mediaFmt,
        })
        break
      }
    }
  }

  return {
    titulo: `Resumo — ${nomeEquipamento}`,
    periodo:
      periodo?.inicio && periodo?.fim
        ? `${formatarDataBR(periodo.inicio)} até ${formatarDataBR(periodo.fim)}`
        : 'Período não especificado',
    tipo,
    kpis,
    series,
  }
}

export async function getRealReportData(identifier, periodo, historicoEmMemoria = null) {
  if (!identifier) {
    throw new Error('Selecione um equipamento antes de gerar o relatório.')
  }
  if (!periodo?.inicio || !periodo?.fim) {
    throw new Error('Pesquise um período (início e fim) antes de gerar o relatório.')
  }

  // Reaproveita o histórico já carregado no contexto para o mesmo equipamento/período, ou busca na API
  if (
    historicoEmMemoria?.equipamento?.identificador === String(identifier) &&
    Array.isArray(historicoEmMemoria.dados) &&
    historicoEmMemoria.dados.length > 0
  ) {
    return montarRelatorioReal({
      equipamento: historicoEmMemoria.equipamento,
      dados: historicoEmMemoria.dados,
      periodo,
    })
  }

  const params = new URLSearchParams()
  params.append('inicio', periodo.inicio)
  params.append('fim', periodo.fim)

  const resposta = await getEquipmentHistory(identifier, params)
  return montarRelatorioReal({
    equipamento: resposta.equipamento,
    dados: resposta.dados,
    periodo,
  })
}

export async function sendChatMessage(identifier, pergunta) {
  if (!identifier) {
    throw new Error('Selecione um equipamento para conversar com o assistente.')
  }

  const data = await httpClient.json(
    `/api/equipamentos/${encodeURIComponent(identifier)}/chatbot/`,
    {
      method: 'POST',
      body: { pergunta },
    }
  )

  if (typeof data.resposta !== 'string' || !data.resposta.trim()) {
    throw new Error('O assistente não retornou uma resposta válida.')
  }

  return { reply: data.resposta }
}

export { baixarHistoricoCSV, baixarRelatorioPDF } from './exportService.js'