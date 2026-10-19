import React, { useState } from 'react';
import styles from './Chatbot.module.css';
import { sendChatMessage, exportHistoryToCSV, getReportData } from '../services/chatServices';
import RelatorioVisual from './RelatorioVisual.jsx';

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Olá! Sou o assistente do Dashboard Morhinga. Como posso ajudar?',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [reportStatus, setReportStatus] = useState('idle');

  // Enviar mensagem
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(currentInput);
      console.log("resposta:", response);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
  if (reportStatus === 'loading') return; // evita clique duplo
  setReportStatus('loading');

  try {
    const report = await getReportData();
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: 'bot',
        isReport: true,
        report,
        text: 'Relatório Executivo gerado.',
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
    setReportStatus('success');
    setTimeout(() => setReportStatus('idle'), 3000); // some depois de 3s
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    setReportStatus('error');
    setTimeout(() => setReportStatus('idle'), 4000);
  }
};

  // Perfumaria para o textarea/input
  const handleInput = (e) => {
    const textarea = e.target;
    // Reseta a altura para recalcular corretamente caso o usuário apague texto
    textarea.style.height = 'auto'; 
    // Define a nova altura com base no conteúdo total digitado
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  // Também perfumaria para o textarea/input
  const handleKeyDown = (e) => {
      // Se a tecla pressionada for 'Enter' E a tecla Shift NÃO estiver pressionada
      if (e.key === 'Enter' && !e.shiftKey) {
        handleSendMessage(e); // Dispara a ação de envio
    }
    // Nota: Se o usuário apertar Shift + Enter, ele vai quebrar a linha normalmente!
  };

  // Ação: Exportar CSV
  const handleExport = () => {
    exportHistoryToCSV(messages);
  };

    return (
    <div className={styles.chatbot}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.headerTitle}>Assistente Morhinga</h2>
          {/* <p className={styles.headerSub}>Suporte a Decisão & Telemetria</p> */}
        </div>
        <div className={styles.actions}>
          <button
           onClick={handleGenerateReport}
           disabled={reportStatus === 'loading'}
           className={styles.btnAction}
           >
            {reportStatus === 'loading' ? '⏳ Gerando...' : '📊 Relatório'}
          </button>
          <button onClick={handleExport} className={styles.btnAction}>
            📥 CSV
          </button>
        </div>
      </header>
      {reportStatus !== 'idle' && (
      <div className={`${styles.status} ${styles[`status_${reportStatus}`]}`}>
        {reportStatus === 'loading' && 'Gerando relatório...'}
        {reportStatus === 'success' && 'Relatório gerado!'}
        {reportStatus === 'error' && 'Erro ao gerar relatório.'}
    </div>
)}

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
                {/* Linha vertical (corpo da seta) */}
                <line x1="12" y1="19" x2="12" y2="5" />
                {/* Ponta da seta em formato de V invertido */}
                <polyline points="5 12 12 5 19 12" />
              </svg>
            {/* Enviar */}
          </button>
        </form>
      </div>

    </div>
  );
}