import { useState, useEffect, useRef, useCallback } from 'react'
import { getQualidadeEquipamento } from '../services/analiseService.js'

export function useQualidadeEquipamento(equipamentoId) {
  const [qualidade, setQualidade] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  const controllerRef = useRef(null)
  const requestIdRef = useRef(0)
  const inFlightRef = useRef(false)

  const buscarQualidade = useCallback(
    async ({ silencioso = false } = {}) => {
      if (!equipamentoId) return

      // Evita duplicar ação se o usuário clicar repetidamente no botão Atualizar
      if (inFlightRef.current) return

      inFlightRef.current = true
      controllerRef.current?.abort()
      const controller = new AbortController()
      controllerRef.current = controller
      const requestId = ++requestIdRef.current

      if (!silencioso) {
        setCarregando(true)
      }
      setErro('')

      try {
        const resposta = await getQualidadeEquipamento({
          equipamentoId,
          signal: controller.signal,
        })

        if (controller.signal.aborted || requestId !== requestIdRef.current) {
          return
        }

        setQualidade(resposta)
        setErro('')
      } catch (err) {
        if (err.name === 'AbortError' || controller.signal.aborted) {
          return
        }

        if (requestId === requestIdRef.current) {
          // Não apaga a última leitura válida (setQualidade não é resetado) — apenas explica o erro
          setErro(
            err.message ||
              'Erro ao consultar o estado de atualização na API. Exibindo últimos dados disponíveis.'
          )
        }
      } finally {
        if (requestId === requestIdRef.current) {
          inFlightRef.current = false
          if (!controller.signal.aborted) {
            setCarregando(false)
          }
        }
      }
    },
    [equipamentoId]
  )

  // Busca ao abrir / trocar de equipamento (sem polling)
  useEffect(() => {
    controllerRef.current?.abort()
    requestIdRef.current += 1
    inFlightRef.current = false

    setQualidade(null)
    setErro('')

    if (equipamentoId) {
      buscarQualidade()
    }

    return () => {
      controllerRef.current?.abort()
      inFlightRef.current = false
    }
  }, [equipamentoId, buscarQualidade])

  return {
    qualidade,
    carregandoQualidade: carregando,
    erroQualidade: erro,
    atualizarQualidade: () => buscarQualidade(),
  }
}