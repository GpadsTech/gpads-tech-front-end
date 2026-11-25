import { useState, useEffect, useRef, useCallback } from "react"
import { getResumoAnalise } from "../services/analiseService.js"

export function useAnaliseResumo(equipamentoId) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [semDados, setSemDados] = useState(false)

  const controllerRef = useRef(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    controllerRef.current?.abort()
    requestIdRef.current += 1

    setData(null)
    setError("")
    setSemDados(false)
    setLoading(false)

    return () => {
      controllerRef.current?.abort()
    }
  }, [equipamentoId])

  const buscarResumo = useCallback(
    async ({ variavel, inicio, fim }) => {
      controllerRef.current?.abort()
      const controller = new AbortController()
      controllerRef.current = controller

      const requestId = ++requestIdRef.current

      setLoading(true)
      setError("")
      setSemDados(false)

      try {
        if (!variavel) {
          throw new Error("Selecione uma variável para análise.")
        }
        if (!inicio || !fim) {
          throw new Error("Informe as datas inicial e final.")
        }
        if (inicio > fim) {
          throw new Error("A data inicial não pode ser posterior à data final.")
        }

        const resposta = await getResumoAnalise({
          equipamentoId,
          variavel,
          inicio,
          fim,
          signal: controller.signal
        })

        if (controller.signal.aborted || requestId !== requestIdRef.current) {
          return
        }

        const totalRegistros = resposta?.qualidade_dos_dados?.registros_analisados ?? 0
        const vazio = !resposta || !resposta.estatisticas || totalRegistros === 0

        if (vazio) {
          setData(null)
          setSemDados(true)
        } else {
          setData(resposta)
          setSemDados(false)
        }
      } catch (err) {
        if (err.name === "AbortError" || controller.signal.aborted) {
          return
        }

        if (requestId === requestIdRef.current) {
          setError(err.message || "Não foi possível gerar o resumo.")
          setData(null)
          setSemDados(false)
        }
      } finally {
        if (!controller.signal.aborted && requestId === requestIdRef.current) {
          setLoading(false)
        }
      }
    },
    [equipamentoId]
  )

  return {
    resumo: data,
    carregandoResumo: loading,
    erroResumo: error,
    semDadosResumo: semDados,
    buscarResumo
  }
}