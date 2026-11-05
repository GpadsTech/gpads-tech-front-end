import { httpClient } from './httpClient.js'
export async function sendChatMessage(identifier, pergunta) {
  const data = await httpClient.json(`/api/equipamentos/${encodeURIComponent(identifier)}/chatbot/`, { method: 'POST', body: { pergunta } })
  if (typeof data.resposta !== 'string' || !data.resposta.trim()) throw new Error('O assistente não retornou uma resposta válida.')
  return { reply: data.resposta }
}

export { getReportData } from './demoReportService.js'
export { baixarHistoricoCSV, baixarRelatorioPDF } from './exportService.js'
