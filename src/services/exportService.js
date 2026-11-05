import { httpClient } from './httpClient.js'

async function baixarArquivo(url, options, nomePadrao) {

  const response = await httpClient.request(url, options)

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

    `/api/equipamentos/${equipamentoId}/historico/csv/?${params}`,

    { method: "GET" },

    "historico.csv"

  )

}

export async function baixarRelatorioPDF(equipamentoId, inicio, fim) {

  return baixarArquivo(

    `/api/equipamentos/${equipamentoId}/relatorio/`,

    {

      method: "POST",

      headers: { "Content-Type": "application/json" },

      body: { inicio, fim },

    },

    "relatorio.pdf"

  )

}