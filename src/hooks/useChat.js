import { useRef, useState } from 'react'
import { sendChatMessage } from '../services/chatServices.js'

const createMessage = (sender, text) => ({ id: crypto.randomUUID(), sender, text, timestamp: new Date().toLocaleTimeString() })

export function useChat(equipmentId, sendMessage = sendChatMessage) {
  const [messages, setMessages] = useState(() => [createMessage('bot', 'Olá! Sou o assistente do Dashboard Morhinga. Como posso ajudar?')])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const sending = useRef(false)
  async function handleSendMessage(event) {
    event.preventDefault()
    if (!input.trim() || sending.current) return
    const question = input
    sending.current = true
    setMessages(previous => [...previous, createMessage('user', question)])
    setInput('')
    setIsLoading(true)
    try {
      const response = await sendMessage(equipmentId, question)
      setMessages(previous => [...previous, createMessage('bot', response.reply)])
    } catch (error) {
      setMessages(previous => [...previous, createMessage('bot', error.message || 'Não foi possível obter a resposta.')])
    } finally {
      sending.current = false
      setIsLoading(false)
    }
  }
  return { messages, input, setInput, isLoading, handleSendMessage }
}
