import { useState, useEffect, useRef } from 'react'
import { getAvisosOperacionais } from '../services/analiseService.js'

export function useAvisosOperacionais(equipamentoId) {
  const [estado, setEstado] = useState({
    equipamentoId: null,
    dados: null,
    erro: '',
    concluido: false,
  })

  const controllerRef = useRef(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    const requestId = ++requestIdRef.current

    if (!equipamentoId) return

    getAvisosOperacionais({ equipamentoId, signal: controller.signal })
      .then((resposta) => {
        if (controller.signal.aborted || requestId !== requestIdRef.current) return

        const idResposta =
          resposta?.equipamento?.identificador ?? resposta?.identificador

        if (idResposta !== undefined && String(idResposta) !== String(equipamentoId)) {
          return
        }

        setEstado({
          equipamentoId,
          dados: resposta,
          erro: '',
          concluido: true,
        })
      })
      .catch((err) => {
        if (err.name === 'AbortError' || controller.signal.aborted) return
        if (requestId === requestIdRef.current) {
          setEstado({
            equipamentoId,
            dados: null,
            erro: err.message || 'Não foi possível carregar os avisos operacionais.',
            concluido: true,
          })
        }
      })

    return () => {
      controller.abort()
    }
  }, [equipamentoId])

  const pertenceAoAtivo = Boolean(equipamentoId) && estado.equipamentoId === equipamentoId

  return {
    dadosAvisos: pertenceAoAtivo ? estado.dados : null,
    carregandoAvisos: Boolean(equipamentoId) && (!pertenceAoAtivo || !estado.concluido),
    erroAvisos: pertenceAoAtivo ? estado.erro : '',
  }
}