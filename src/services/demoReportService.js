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
