import { getIdToken } from "../auth.js"

const API_URL = "http://127.0.0.1:8000"

export async function sendChatMessage(equipamentoId, pergunta) {
  const token = await getIdToken()

  const response = await fetch(
    `${API_URL}/api/equipamentos/${equipamentoId}/chatbot/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ pergunta }),
    }
  )

  const data = await response.json().catch(() => ({}))

  console.log("Status:", response.status)
  console.log("Resposta do backend:", data)

  if (!response.ok) {
    throw new Error(data.message || "Erro ao consultar o chatbot.")
  }
  console.log('@@@@@@@@',data);
  return { reply: data.resposta }
}

export async function getReportData() {
  await new Promise((resolve) => setTimeout(resolve, 600))

  return {
    titulo: "Relatório Executivo Morhinga",
    periodo: "Últimas 24h",
    kpis: [
      { label: "Equipamentos ativos", valor: "98%" },
      { label: "Temp. média", valor: "24,2 °C" },
      { label: "Umidade média", valor: "67%" },
      { label: "Alertas", valor: "0" },
    ],
    clima: [
      { hora: "00h", temperatura: 21, umidade: 82 },
      { hora: "04h", temperatura: 20, umidade: 85 },
      { hora: "08h", temperatura: 23, umidade: 74 },
      { hora: "12h", temperatura: 28, umidade: 58 },
      { hora: "16h", temperatura: 27, umidade: 61 },
      { hora: "20h", temperatura: 24, umidade: 70 },
    ],
    chuva: [
      { dia: "Seg", mm: 0 },
      { dia: "Ter", mm: 4 },
      { dia: "Qua", mm: 12 },
      { dia: "Qui", mm: 2 },
      { dia: "Sex", mm: 0 },
      { dia: "Sáb", mm: 7 },
      { dia: "Dom", mm: 1 },
    ],
  }
}

async function baixarArquivo(url, options, nomePadrao) {
  const token = await getIdToken()

  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options?.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.message || "Não foi possível gerar o arquivo.")
  }

  const disposition = response.headers.get("Content-Disposition") || ""
  const match = disposition.match(/filename="?([^"]+)"?/)
  const nome = match ? match[1] : nomePadrao

  const blob = await response.blob()
  const link = document.createElement("a")
  const blobUrl = URL.createObjectURL(blob)
  link.href = blobUrl
  link.download = nome
  link.click()
  URL.revokeObjectURL(blobUrl)
}

export async function baixarHistoricoCSV(equipamentoId, inicio, fim) {
  const params = new URLSearchParams()
  if (inicio) params.set("inicio", inicio)
  if (fim) params.set("fim", fim)

  return baixarArquivo(
    `${API_URL}/api/equipamentos/${equipamentoId}/historico/csv/?${params}`,
    { method: "GET" },
    "historico.csv"
  )
}

export async function baixarRelatorioPDF(equipamentoId, inicio, fim) {
  return baixarArquivo(
    `${API_URL}/api/equipamentos/${equipamentoId}/relatorio/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inicio, fim }),
    },
    "relatorio.pdf"
  )
}