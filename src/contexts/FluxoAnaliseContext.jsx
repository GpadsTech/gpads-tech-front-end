import { createContext, useContext, useState, useCallback } from 'react'

const PERIODO_VAZIO = { inicio: '', fim: '' }

function normalizarDataParaAPI(valor) {
  if (!valor) return ''
  if (typeof valor === 'string') {
    const trimmed = valor.trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
      const [dia, mes, ano] = trimmed.split('/')
      return `${ano}-${mes}-${dia}`
    }
  }
  const dt = new Date(valor)
  if (Number.isNaN(dt.getTime())) return ''
  return dt.toISOString().slice(0, 10)
}

function montarParametrosPeriodo({ inicio, fim }) {
  const inicioFmt = normalizarDataParaAPI(inicio)
  const fimFmt = normalizarDataParaAPI(fim)

  if (inicioFmt && fimFmt && inicioFmt > fimFmt) {
    throw new Error('A data inicial não pode ser posterior à data final.')
  }

  const params = new URLSearchParams()
  if (inicioFmt) params.append('inicio', inicioFmt)
  if (fimFmt) params.append('fim', fimFmt)

  return {
    inicio: inicioFmt,
    fim: fimFmt,
    searchParams: params
  }
}

const FluxoAnaliseContext = createContext(null)

export function FluxoAnaliseProvider({ children }) {
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState(null)
  const [periodoDraft, setPeriodoDraft] = useState(PERIODO_VAZIO)
  const [periodoAplicado, setPeriodoAplicado] = useState(PERIODO_VAZIO)
  const [historicoAplicado, setHistoricoAplicado] = useState({
    equipamento: null,
    dados: []
  })

  const selecionarEquipamento = useCallback((novoEquipamento) => {
    const novoId =
      typeof novoEquipamento === 'object' && novoEquipamento !== null
        ? String(novoEquipamento.identificador ?? novoEquipamento.id ?? '')
        : String(novoEquipamento ?? '')

    setEquipamentoSelecionado((anterior) => {
      const anteriorId =
        typeof anterior === 'object' && anterior !== null
          ? String(anterior.identificador ?? anterior.id ?? '')
          : String(anterior ?? '')

      if (anteriorId !== novoId) {
        setHistoricoAplicado({ equipamento: null, dados: [] })
        setPeriodoDraft(PERIODO_VAZIO)
        setPeriodoAplicado(PERIODO_VAZIO)
      }

      if (!novoId) return null
      return typeof novoEquipamento === 'object'
        ? novoEquipamento
        : { identificador: novoId }
    })
  }, [])

  const atualizarPeriodoDraft = useCallback((campo, valor) => {
    setPeriodoDraft((prev) => ({ ...prev, [campo]: valor }))
  }, [])

  const aplicarPesquisaPeriodo = useCallback(
    (periodoCustomizado) => {
      const alvo = periodoCustomizado ?? periodoDraft
      const normalizado = montarParametrosPeriodo(alvo)
      const novoAplicado = {
        inicio: normalizado.inicio,
        fim: normalizado.fim
      }

      setPeriodoDraft(novoAplicado)
      setPeriodoAplicado(novoAplicado)
      return normalizado
    },
    [periodoDraft]
  )

  return (
    <FluxoAnaliseContext.Provider
      value={{
        equipamentoSelecionado,
        equipamentoId: equipamentoSelecionado?.identificador ?? null,
        selecionarEquipamento,
        periodoDraft,
        setPeriodoDraft,
        atualizarPeriodoDraft,
        periodoAplicado,
        aplicarPesquisaPeriodo,
        historicoAplicado,
        setHistoricoAplicado
      }}
    >
      {children}
    </FluxoAnaliseContext.Provider>
  )
}
// eslint-disable-next-line react-refresh/only-export-components
export function useFluxoAnalise() {
  const ctx = useContext(FluxoAnaliseContext)
  if (!ctx) {
    throw new Error('useFluxoAnalise deve ser usado dentro de FluxoAnaliseProvider')
  }
  return ctx
}