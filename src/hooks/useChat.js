import { useRef, useState, useCallback } from 'react'
import { sendChatMessage, getRealReportData } from '../services/chatServices.js'

const createMessage = (sender, text, extra = {}) => ({
  id: crypto.randomUUID(),
  sender,
  text,
  timestamp: new Date().toLocaleTimeString(),
  ...extra,
})

function isPedidoDeResumo(texto) {
  const normalizado = texto.trim().toLowerCase()
  return (
    normalizado.includes('resumo') ||
    normalizado.includes('relatório') ||
    normalizado.includes('relatorio')
  )
}

export function useChat(equipmentId, periodoAplicado, historicoAplicado, sendMessage = sendChatMessage) {
  const [messages, setMessages] = useState(() => [
    createMessage('bot', 'Olá! Sou o assistente do Dashboard Morhinga. Como posso ajudar?'),
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const sending = useRef(false)

  const gerarRelatorioReal = useCallback(async () => {
    if (sending.current) return
    sending.current = true
    setMessages((previous) => [
      ...previous,
      createMessage('user', 'Gerar resumo do período aplicado'),
    ])
    setIsLoading(true)

    try {
      const report = await getRealReportData(equipmentId, periodoAplicado, historicoAplicado)
      setMessages((previous) => [
        ...previous,
        createMessage('bot', '', { isReport: true, report }),
      ])
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        createMessage('bot', error.message || 'Não foi possível gerar o resumo real.'),
      ])
    } finally {
      sending.current = false
      setIsLoading(false)
    }
  }, [equipmentId, periodoAplicado, historicoAplicado])

  async function handleSendMessage(event) {
    if (event) event.preventDefault()
    if (!input.trim() || sending.current) return

    const question = input
    setInput('')

    // Se o usuário pedir resumo/relatório no chat, usa o fluxo real em vez de demo
    if (isPedidoDeResumo(question)) {
      sending.current = true
      setMessages((previous) => [...previous, createMessage('user', question)])
      setIsLoading(true)
      try {
        const report = await getRealReportData(equipmentId, periodoAplicado, historicoAplicado)
        setMessages((previous) => [
          ...previous,
          createMessage('bot', '', { isReport: true, report }),
        ])
      } catch (error) {
        setMessages((previous) => [
          ...previous,
          createMessage('bot', error.message || 'Não foi possível gerar o resumo.'),
        ])
      } finally {
        sending.current = false
        setIsLoading(false)
      }
      return
    }

    sending.current = true
    setMessages((previous) => [...previous, createMessage('user', question)])
    setIsLoading(true)

    try {
      const response = await sendMessage(equipmentId, question)
      setMessages((previous) => [...previous, createMessage('bot', response.reply)])
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        createMessage('bot', error.message || 'Não foi possível obter a resposta.'),
      ])
    } finally {
      sending.current = false
      setIsLoading(false)
    }
  }

  return {
    messages,
    input,
    setInput,
    isLoading,
    handleSendMessage,
    gerarRelatorioReal,
  }
}