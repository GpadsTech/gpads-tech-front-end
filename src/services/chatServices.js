// Versão MOCK: sem back-end. Troque o conteúdo de sendChatMessage por um fetch quando a API existir.

const respostasMock = {
  temperatura: "A temperatura atual da estação está em 24,2 °C (dado mockado).",
  umidade: "A umidade relativa está em 67% (dado mockado).",
  chuva: "Não há registro de chuva nas últimas leituras (dado mockado).",
  status: "Todos os equipamentos estão operando normalmente (dado mockado).",
};

export async function sendChatMessage(mensagem) {
  await new Promise((resolve) => setTimeout(resolve, 800)); // simula a espera da API

  const texto = mensagem.toLowerCase();
  const chave = Object.keys(respostasMock).find((k) => texto.includes(k));

  return {
    reply:
      respostasMock[chave] ??
      "Ainda estou em modo de demonstração. Tente perguntar sobre temperatura, umidade, chuva ou status.",
  };
}

export function exportHistoryToCSV(messages) {
  const escapar = (valor) => `"${String(valor).replace(/"/g, '""')}"`;
  const linhas = messages.map((m) =>
    [m.sender, m.text, m.timestamp].map(escapar).join(",")
  );
  const csv = ["autor,mensagem,hora", ...linhas].join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "historico-chat.csv";
  a.click();
  URL.revokeObjectURL(url);
}
export async function getReportData() {
  await new Promise((resolve) => setTimeout(resolve, 600));

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
  };
}