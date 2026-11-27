import styles from './Dashboard.module.css'

const NOMES_VARIAVEIS = {
  temperatura: { nome: 'Temperatura', unidade: '°C' },
  umidade: { nome: 'Umidade', unidade: '%' },
  pressao: { nome: 'Pressão', unidade: 'hPa' },
  vento: { nome: 'Velocidade do Vento', unidade: 'm/s' },
  rpm: { nome: 'RPM', unidade: 'RPM' },
  luz: { nome: 'Luminosidade', unidade: 'lx' },
  ar: { nome: 'Qualidade do Ar', unidade: 'AQI' },
  gas: { nome: 'CO2 / Gás', unidade: 'ppm' },
  volt: { nome: 'Tensão Elétrica', unidade: 'V' },
  tensao_v: { nome: 'Tensão Elétrica', unidade: 'V' },
  chuva: { nome: 'Nível de Chuva', unidade: 'mm' },
  chuva_acumulada: { nome: 'Chuva Acumulada', unidade: 'mm' },
  ph: { nome: 'pH', unidade: '' },
  turbidez_ntu: { nome: 'Turbidez', unidade: 'NTU' },
  sensor_uv_v: { nome: 'Sensor UV', unidade: 'V' },
  adc: { nome: 'ADC', unidade: '' },
}

function formatarVariavel(chave, unidadeApi) {
  const info = NOMES_VARIAVEIS[chave?.toLowerCase()]
  const nome = info?.nome || chave || 'Variável'
  const unidade = unidadeApi ?? info?.unidade ?? ''
  return { nome, unidade }
}

function formatarNumero(valor) {
  if (valor === null || valor === undefined || !Number.isFinite(Number(valor))) {
    return null
  }
  return Number(valor).toLocaleString('pt-BR', { maximumFractionDigits: 2 })
}

function formatarValor(valor, unidade) {
  const num = formatarNumero(valor)
  if (num === null) return '—'
  return unidade ? `${num} ${unidade}` : num
}

function montarRegra(item, unidade) {
  if (item.regra?.trim()) return item.regra

  const inf = formatarNumero(item.limite_inferior)
  const sup = formatarNumero(item.limite_superior)
  const sufixo = unidade ? ` ${unidade}` : ''

  if (inf !== null && sup !== null) {
    return `Faixa operacional esperada entre ${inf}${sufixo} e ${sup}${sufixo}`
  }
  if (inf !== null) {
    return `Valor mínimo esperado de ${inf}${sufixo}`
  }
  if (sup !== null) {
    return `Valor máximo esperado de ${sup}${sufixo}`
  }
  return null
}

function montarOrientacao(item, nomeVariavel, unidade) {
  if (item.orientacao?.trim()) return item.orientacao

  const status = String(item.status || '').toUpperCase()
  const valor = Number(item.valor)
  const inf = item.limite_inferior !== null && item.limite_inferior !== undefined ? Number(item.limite_inferior) : null
  const sup = item.limite_superior !== null && item.limite_superior !== undefined ? Number(item.limite_superior) : null

  if (status === 'DESATUALIZADO') {
    return `A leitura de ${nomeVariavel} está antiga. Verifique a conectividade e o envio recente do equipamento antes de tomar decisões operacionais.`
  }

  if (status === 'SEM_REGRA' || status === 'REGRA_AUSENTE') {
    return `Nenhuma faixa limite configurada para ${nomeVariavel}. Cadastre os parâmetros de referência caso precise monitorar desvios.`
  }

  if (Number.isFinite(valor) && sup !== null && valor > sup) {
    return `${nomeVariavel} acima do limite superior (${formatarValor(sup, unidade)}). Inspecione as condições locais do equipamento.`
  }

  if (Number.isFinite(valor) && inf !== null && valor < inf) {
    return `${nomeVariavel} abaixo do limite inferior (${formatarValor(inf, unidade)}). Verifique o sensor e as condições ambientais.`
  }

  return `Parâmetro avaliado na última leitura. Acompanhe o histórico do equipamento para verificar a evolução de ${nomeVariavel}.`
}

export default function AvisosOperacionais({
  equipamentoId,
  dadosAvisos,
  carregando,
  erro,
  statusDados,
}) {
  if (!equipamentoId) return null

  const listaBruta = Array.isArray(dadosAvisos?.alertas)
    ? dadosAvisos.alertas
    : Array.isArray(dadosAvisos?.avisos)
    ? dadosAvisos.avisos
    : []

  // Garante que apenas itens de alerta reais (não 'NORMAL' / 'OK') sejam listados como avisos ativos
  const listaAvisos = listaBruta.filter((item) => {
    const st = String(item.status || '').toUpperCase()
    return st !== 'NORMAL' && st !== 'OK'
  })

  const todosSemRegra =
    listaBruta.length > 0 &&
    listaBruta.every((item) => {
      const st = String(item.status || '').toUpperCase()
      return st === 'SEM_REGRA' || st === 'REGRA_AUSENTE'
    })

  const regraAusenteGlobal =
    dadosAvisos?.status === 'regra_ausente' ||
    dadosAvisos?.status === 'SEM_REGRA' ||
    dadosAvisos?.regra_configurada === false ||
    todosSemRegra

  const temItemDesatualizado = listaBruta.some(
    (item) => String(item.status || '').toUpperCase() === 'DESATUALIZADO'
  )

  const dadosAntigos =
    statusDados === 'desatualizado' ||
    dadosAvisos?.dados_antigos === true ||
    temItemDesatualizado

  const semLeitura = statusDados === 'sem_dados' && listaBruta.length === 0

  return (
    <section
      aria-label="Avisos operacionais da última leitura"
      style={{
        margin: '1rem 0',
        padding: '1rem 1.25rem',
        borderRadius: '12px',
        background: 'rgba(3, 18, 36, 0.85)',
        border: '1px solid rgba(0, 229, 255, 0.25)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.65rem',
        }}
      >
        <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#00e5ff' }}>
          Avisos Operacionais (Última Leitura)
        </h3>
        {!carregando && !erro && listaAvisos.length > 0 && (
          <span
            style={{
              fontSize: '0.78rem',
              padding: '2px 8px',
              borderRadius: '999px',
              background: 'rgba(255, 170, 0, 0.15)',
              color: '#ffbe3d',
              border: '1px solid rgba(255, 170, 0, 0.4)',
            }}
          >
            {listaAvisos.length} {listaAvisos.length === 1 ? 'aviso' : 'avisos'}
          </span>
        )}
      </div>

      {carregando && (
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
          Verificando avisos operacionais da última leitura...
        </p>
      )}

      {!carregando && erro && (
        <div className={styles.errorBox} role="alert" style={{ margin: 0 }}>
          {erro}
        </div>
      )}

      {!carregando && !erro && (
        <>
          {dadosAntigos && (
            <p
              role="status"
              style={{
                margin: '0 0 0.65rem 0',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                background: 'rgba(224, 161, 26, 0.14)',
                border: '1px solid rgba(224, 161, 26, 0.45)',
                color: '#ffd166',
              }}
            >
              Dados antigos: a última leitura registrada está desatualizada e os avisos abaixo podem não refletir a condição atual do equipamento.
            </p>
          )}

          {regraAusenteGlobal ? (
            <p
              role="status"
              style={{
                margin: 0,
                fontSize: '0.85rem',
                color: 'rgba(255, 255, 255, 0.78)',
              }}
            >
              Regra ausente: nenhuma regra operacional foi configurada para avaliar as leituras deste equipamento.
            </p>
          ) : semLeitura ? (
            <p
              role="status"
              style={{
                margin: 0,
                fontSize: '0.85rem',
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              Sem leituras recentes disponíveis para avaliar avisos operacionais.
            </p>
          ) : listaAvisos.length === 0 ? (
            <p
              role="status"
              style={{
                margin: 0,
                fontSize: '0.85rem',
                color: '#7ee8fa',
              }}
            >
              Sem avisos: todos os parâmetros avaliados na última leitura estão dentro das regras operacionais.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '0.65rem' }}>
              {listaAvisos.map((aviso, index) => {
                const { nome, unidade } = formatarVariavel(aviso.variavel, aviso.unidade)
                const regraTexto = montarRegra(aviso, unidade)
                const orientacaoTexto = montarOrientacao(aviso, nome, unidade)

                return (
                  <article
                    key={aviso.id || `${equipamentoId}-${aviso.variavel}-${index}`}
                    style={{
                      padding: '0.75rem 0.9rem',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      borderLeft: '3px solid #ffbe3d',
                      display: 'grid',
                      gap: '0.3rem',
                      fontSize: '0.84rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                      }}
                    >
                      <strong style={{ color: '#fff' }}>
                        {nome}: {formatarValor(aviso.valor, unidade)}
                      </strong>
                      <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem' }}>
                        Horário: {aviso.horario || 'Não informado'}
                      </span>
                    </div>

                    <div style={{ color: '#ffd166', fontSize: '0.8rem' }}>
                      <strong>Regra:</strong>{' '}
                      {regraTexto || 'Regra ausente: nenhum limite configurado para esta variável.'}
                    </div>

                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.88)', lineHeight: 1.4 }}>
                      <strong>Orientação:</strong> {orientacaoTexto}
                    </p>
                  </article>
                )
              })}
            </div>
          )}
        </>
      )}
    </section>
  )
}