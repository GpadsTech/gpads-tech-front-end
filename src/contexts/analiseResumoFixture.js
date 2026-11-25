export const analiseResumoFixture = {
  equipamentoId: "EQ-1024",
  periodo: "2026-11",
  resumo: {
    disponibilidade: 98.4,
    horasOperacao: 710,
    alertasCriticos: 2,
    statusGeral: "OPERACIONAL"
  },
  ultimaAtualizacao: "2026-11-25T11:30:00Z"
};

export const simuleDelay = (ms = 600, signal) =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) {
      return reject(new DOMException("Aborted", "AbortError"));
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });