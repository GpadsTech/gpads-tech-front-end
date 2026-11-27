import { useChat } from '../hooks/useChat.js';
import styles from './Chatbot.module.css';
import RelatorioVisual from './RelatorioVisual.jsx';
import { useFluxoAnalise } from '../contexts/FluxoAnaliseContext';
import { baixarHistoricoCSV, baixarRelatorioPDF } from '../services/chatServices';

export default function Chatbot({ equipamentoId: equipamentoIdProp }) {

  const {
    equipamentoId: equipamentoIdContexto,
    periodoAplicado,
    historicoAplicado,
  } = useFluxoAnalise();

  const equipamentoAtivo = equipamentoIdProp || equipamentoIdContexto;
  const temFiltroAplicado = Boolean(
    equipamentoAtivo && periodoAplicado?.inicio && periodoAplicado?.fim
  );

  const {
    messages,
    input,
    setInput,
    isLoading,
    handleSendMessage,
    gerarRelatorioReal,
  } = useChat(equipamentoAtivo, periodoAplicado, historicoAplicado);

  const handleInput = (e) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSendMessage(e);
    }
  };

  const handleExportarCSVClick = async () => {
    if (!temFiltroAplicado) return;
    await baixarHistoricoCSV(
      equipamentoAtivo,
      periodoAplicado.inicio,
      periodoAplicado.fim
    );
  };

  const handleExportarPDFClick = async () => {
    if (!temFiltroAplicado || typeof baixarRelatorioPDF !== 'function') return;
    await baixarRelatorioPDF(
      equipamentoAtivo,
      periodoAplicado.inicio,
      periodoAplicado.fim
    );
  };

  return (
    <div className={styles.chatbot}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.headerTitle}>Assistente Morhinga</h2>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            onClick={gerarRelatorioReal}
            disabled={isLoading || !temFiltroAplicado}
            title={
              temFiltroAplicado
                ? 'Gerar resumo com dados reais do período aplicado'
                : 'Selecione um equipamento e pesquise um período primeiro'
            }
          >
            Resumo
          </button>

          <button
            type="button"
            onClick={handleExportarCSVClick}
            disabled={isLoading || !temFiltroAplicado}
            title={
              temFiltroAplicado
                ? 'Exportar CSV do período aplicado'
                : 'Selecione um equipamento e pesquise um período primeiro'
            }
          >
            CSV
          </button>

          <button
            type="button"
            onClick={handleExportarPDFClick}
            disabled={isLoading || !temFiltroAplicado}
            title={
              temFiltroAplicado
                ? 'Exportar PDF do período aplicado'
                : 'Selecione um equipamento e pesquise um período primeiro'
            }
          >
            PDF
          </button>
        </div>
      </header>

      <div className={styles.messages}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`${styles.row} ${msg.sender === 'user' ? styles.rowUser : styles.rowBot}`}
          >
            <div
              className={`${styles.bubble} ${
                msg.sender === 'user' ? styles.bubbleUser : styles.bubbleBot
              } ${msg.isReport ? styles.bubbleReport : ''}`}
            >
              {msg.report ? (
                <RelatorioVisual dados={msg.report} />
              ) : (
                <p className={styles.text}>{msg.text}</p>
              )}
              <span className={styles.time}>{msg.timestamp}</span>
            </div>
          </div>
        ))}

        {isLoading && <div className={styles.loading}>Morhinga digitando...</div>}
      </div>

      <div className={styles.divForm}>
        <form onSubmit={handleSendMessage} className={styles.form}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte ao assistente..."
            className={styles.input}
            rows={1}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
          ></textarea>
          <button type="submit" disabled={isLoading} className={styles.btnSend}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}