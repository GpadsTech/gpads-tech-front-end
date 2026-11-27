import { useState, useEffect, useRef } from 'react'
import { getAvisosOperacionais } from '../services/analiseService.js'

export function useAvisosOperacionais(equipamentoId) {
  const [dadosAvisos, setDadosAvisos] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  const controllerRef = useRef(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    const requestId = ++requestIdRef.current

    setDadosAvisos(null)
    setErro('')

    if (!equipamentoId) {
      setCarregando(false)
      return
    }

    setCarregando(true)

    getAvisosOperacionais({ equipamentoId, signal: controller.signal })
      .then((resposta) => {
        if (controller.signal.aborted || requestId !== requestIdRef.current) return

        const idResposta =
          resposta?.equipamento?.identificador ?? resposta?.identificador

        if (idResposta !== undefined && String(idResposta) !== String(equipamentoId)) {
          return
        }

        setDadosAvisos(resposta)
      })
      .catch((err) => {
        if (err.name === 'AbortError' || controller.signal.aborted) return
        if (requestId === requestIdRef.current) {
          setErro(err.message || 'Não foi possível carregar os avisos operacionais.')
        }
      })
      .finally(() => {
        if (!controller.signal.aborted && requestId === requestIdRef.current) {
          setCarregando(false)
        }
      })

    return () => {
      controller.abort()
    }
  }, [equipamentoId])

  return {
    dadosAvisos,
    carregandoAvisos: carregando,
    erroAvisos: erro,
  }
}