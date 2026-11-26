import { getEquipmentHistory } from "../services/telemetryService.js"
import { useState, useEffect } from "react"
import styles from './Historico.module.css'
import { Link, useParams } from 'react-router-dom'
import { baixarHistoricoCSV } from '../services/chatServices'
import { useAnaliseResumo } from '../hooks/useAnaliseResumo'
import { useAnaliseComparacao } from '../hooks/useAnaliseComparacao'
import { useFluxoAnalise } from '../contexts/FluxoAnaliseContext'

import { useQualidadeEquipamento } from '../hooks/useQualidadeEquipamento'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const customNeonMarker = L.divIcon({
    className: 'custom-neon-pin',
    html: `
      <div style="position: relative; width: 36px; height: 46px; display: flex; align-items: center; justify-content: center;">
        <svg width="36" height="46" viewBox="0 0 36 46" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 0C8.06 0 0 8.06 0 18C0 29.5 18 46 18 46C18 46 36 29.5 36 18C36 8.06 27.94 0 18 0Z" fill="#00e5ff" />
          <circle cx="18" cy="18" r="7" fill="#03162b" />
        </svg>
        <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(0, 229, 255, 0.45); filter: blur(8px); z-index: -1;"></div>
      </div>
    `,
    iconSize: [36, 46],
    iconAnchor: [18, 46],
    popupAnchor: [0, -42]
})

function formatarHora(hora) {
    if (!hora) return ''
    const partes = hora.split(' ')
    if (partes.length < 2) return hora
    return partes[1].substring(0, 5)
}

function TooltipPersonalizado({ active, payload, label, unidade }) {
    if (!active || !payload || payload.length === 0) return null
    const valor = payload[0].value

    return (
        <div className={styles.customTooltip}>
            <p className={styles.tooltipLabel}>Horário: {formatarHora(label)}</p>
            <p className={styles.tooltipValue}>
                Valor: <strong>{valor} {unidade}</strong>
            </p>
        </div>
    )
}

function GraficoHistorico({ titulo, dados, dataKey, unidade = '', corLinha = "#00e5ff" }) {
    const dadosFormatados = dados
        .filter((item) => item[dataKey] !== undefined && item[dataKey] !== null)
        .map((item) => ({
            ...item,
            horaFormatada: formatarHora(item.hora)
        }))

    if (dadosFormatados.length === 0) return null

    return (
        <div className={styles.graficoCard}>
            <h3 className={styles.tituloGrafico}>{titulo}</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dadosFormatados} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
                    <XAxis
                        dataKey="horaFormatada"
                        tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.4)' }}
                        stroke="rgba(255, 255, 255, 0.2)"
                    />
                    <YAxis
                        tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.4)' }}
                        stroke="rgba(255, 255, 255, 0.2)"
                    />
                    <Tooltip content={<TooltipPersonalizado unidade={unidade} />} />
                    <Line
                        type="monotone"
                        dataKey={dataKey}
                        stroke={corLinha}
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: '#020713', stroke: corLinha, strokeWidth: 2 }}
                        activeDot={{ r: 5, fill: corLinha, stroke: '#fff' }}
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

function formatarNumero(valor) {
    if (valor === null || valor === undefined || !Number.isFinite(Number(valor))) {
        return "—"
    }

    return Number(valor).toLocaleString("pt-BR", {
        maximumFractionDigits: 2
    })
}

function GraficoFaixaEstatistica({ dados }) {
    const estatisticas = dados?.estatisticas

    if (!estatisticas) return null

    const media = Number(estatisticas.media)
    const minimo = Number(estatisticas.minimo)
    const maximo = Number(estatisticas.maximo)

    const valoresValidos = [
        media,
        minimo,
        maximo
    ].every(Number.isFinite)

    if (
        !valoresValidos ||
        minimo > maximo ||
        media < minimo ||
        media > maximo
    ) {
        return (
            <div className={styles.resumoGraficoCard}>
                <h4>Faixa dos valores</h4>
                <p role="status">
                    Não foi possível apresentar a distribuição
                    dos valores recebidos.
                </p>
            </div>
        )
    }

    const amplitude = maximo - minimo

    const posicaoMedia = amplitude === 0
        ? 50
        : ((media - minimo) / amplitude) * 100

    // pH não possui unidade física.
    const unidade = dados.variavel?.toLowerCase() === "ph"
        ? ""
        : dados.unidade || ""

    return (
        <div className={styles.resumoGraficoCard}>
            <h4 className={styles.analiseGraficoTitulo}>
                Faixa dos valores
            </h4>

            <p className={styles.analiseGraficoDescricao}>
                Distribuição da média entre o menor e o maior valor registrado.
            </p>

            <div
                className={styles.faixaGrafico}
                role="img"
                aria-label={
                    `Mínimo: ${formatarNumero(minimo)}. ` +
                    `Média: ${formatarNumero(media)}. ` +
                    `Máximo: ${formatarNumero(maximo)}.`
                }
            >
                <div className={styles.faixaTrilho}>
                    <span className={styles.faixaLinha} />

                    <span className={styles.faixaPontoMinimo} />

                    <span
                        className={styles.faixaMarcadorMedia}
                        style={{ left: `${posicaoMedia}%` }}
                    />

                    <span className={styles.faixaPontoMaximo} />
                </div>
            </div>

            <div className={styles.faixaValores}>
                <div>
                    <span>Mínimo</span>
                    <strong>
                        {formatarNumero(minimo)} {unidade}
                    </strong>
                </div>

                <div>
                    <span>Média</span>
                    <strong className={styles.valorMedia}>
                        {formatarNumero(media)} {unidade}
                    </strong>
                </div>

                <div>
                    <span>Máximo</span>
                    <strong>
                        {formatarNumero(maximo)} {unidade}
                    </strong>
                </div>
            </div>
        </div>
    )
}

function GraficoQualidadeRegistros({ dados }) {
    if (!dados) return null

    const total = Number(dados.registros_analisados)
    const validos = Number(dados.registros_validos)
    const nulos = Number(dados.registros_nulos)
    const invalidos = Number(dados.registros_invalidos)
    const utilizados = Number(dados.registros_utilizados)

    const contagensValidas = [
        total,
        validos,
        nulos,
        invalidos,
        utilizados
    ].every(valor => Number.isSafeInteger(valor) && valor >= 0)

    if (!contagensValidas) {
        return (
            <div className={styles.resumoGraficoCard}>
                <h4>Qualidade dos registros</h4>
                <p role="status">
                    As informações de qualidade recebidas são inválidas.
                </p>
            </div>
        )
    }

    const distribuicaoConsistente =
        total > 0 &&
        validos + nulos + invalidos === total

    function formatarPercentual(valor) {
        if (total === 0) return "0%"

        return `${((valor / total) * 100).toLocaleString("pt-BR", {
            maximumFractionDigits: 2
        })}%`
    }

    function calcularLargura(valor) {
        if (total === 0) return "0%"

        return `${(valor / total) * 100}%`
    }

    return (
        <div className={styles.resumoGraficoCard}>
            <h4 className={styles.analiseGraficoTitulo}>
                Qualidade dos registros
            </h4>

            <div className={styles.totalRegistros}>
                <strong>{formatarNumero(total)}</strong>
                <span>registros analisados</span>
            </div>

            {total === 0 ? (
                <p className={styles.qualidadeSemDados}>
                    Nenhum registro foi encontrado no período selecionado.
                </p>
            ) : distribuicaoConsistente ? (
                <>
                    <div
                        className={styles.qualidadeBarra}
                        role="img"
                        aria-label={
                            `${validos} registros válidos, ` +
                            `${nulos} nulos e ${invalidos} inválidos, ` +
                            `de um total de ${total}.`
                        }
                    >
                        {validos > 0 && (
                            <span
                                className={styles.segmentoValido}
                                style={{ width: calcularLargura(validos) }}
                            />
                        )}

                        {nulos > 0 && (
                            <span
                                className={styles.segmentoNulo}
                                style={{ width: calcularLargura(nulos) }}
                            />
                        )}

                        {invalidos > 0 && (
                            <span
                                className={styles.segmentoInvalido}
                                style={{ width: calcularLargura(invalidos) }}
                            />
                        )}
                    </div>

                    <div className={styles.qualidadeLegenda}>
                        <div className={styles.qualidadeLegendaItem}>
                            <span className={styles.legendaValido} />

                            <span>Válidos</span>

                            <strong>{formatarNumero(validos)}</strong>

                            <small>{formatarPercentual(validos)}</small>
                        </div>

                        <div className={styles.qualidadeLegendaItem}>
                            <span className={styles.legendaNulo} />

                            <span>Nulos</span>

                            <strong>{formatarNumero(nulos)}</strong>

                            <small>{formatarPercentual(nulos)}</small>
                        </div>

                        <div className={styles.qualidadeLegendaItem}>
                            <span className={styles.legendaInvalido} />

                            <span>Inválidos</span>

                            <strong>{formatarNumero(invalidos)}</strong>

                            <small>{formatarPercentual(invalidos)}</small>
                        </div>
                    </div>
                </>
            ) : (
                <p className={styles.qualidadeAviso}>
                    A soma das categorias não corresponde
                    ao total de registros analisados.
                </p>
            )}

            <div className={styles.registrosUtilizados}>
                <span>Registros utilizados no cálculo</span>

                <strong>{formatarNumero(utilizados)}</strong>
            </div>
        </div>
    )
}

function AlertasConsulta({
    carregando,
    erro,
    mensagemCarregamento
}) {
    return (
        <>
            {carregando && (
                <div
                    className={styles.loadingBox}
                    role="status"
                    aria-live="polite"
                >
                    <div className={styles.spinner}></div>
                    <p>{mensagemCarregamento}</p>
                </div>
            )}

            {erro && (
                <div
                    className={styles.errorBox}
                    role="alert"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>

                    {erro}
                </div>
            )}
        </>
    )
}

function formatarDataComparacao(data) {
    if (!data) return "Não informada"

    const partes = data.split("-")

    if (partes.length !== 3) return data

    const [ano, mes, dia] = partes.map(Number)

    const dataFormatada = new Date(ano, mes - 1, dia)

    // Evita datas inválidas, como 32/13/2026.
    if (
        dataFormatada.getFullYear() !== ano ||
        dataFormatada.getMonth() !== mes - 1 ||
        dataFormatada.getDate() !== dia
    ) {
        return data
    }

    return dataFormatada.toLocaleDateString("pt-BR")
}

function formatarNomeVariavel(variavel) {
    if (!variavel) return "Variável"

    if (variavel.toLowerCase() === "ph") return "pH"
    if (variavel === "turbidez_ntu") return "Turbidez"
    if (variavel === "sensor_uv_v") return "Sensor UV"
    if (variavel === "adc") return "ADC"
    if (variavel === "rpm") return "RPM"
    if (variavel === "ar") return "Qualidade do ar"
    if (variavel === "gas") return "Gás"
    if (variavel === "luz") return "Luminosidade"
    if (variavel === "pressao") return "Pressão"
    if (variavel === "volt") return "Tensão Elétrica"

    return variavel.charAt(0).toUpperCase() + variavel.slice(1)
}

function KPIComparacao({ titulo, periodo, unidade, classe }) {
    const mediaValida =
        periodo?.media !== null &&
        periodo?.media !== undefined &&
        periodo?.media !== "" &&
        Number.isFinite(Number(periodo.media))

    const registrosValidos =
        periodo?.registros_validos !== null &&
        periodo?.registros_validos !== undefined &&
        Number.isSafeInteger(Number(periodo.registros_validos)) &&
        Number(periodo.registros_validos) >= 0

    return (
        <div className={`${styles.kpiComparacaoCard} ${classe}`}>
            <div className={styles.kpiCabecalho}>
                <span>{titulo}</span>
            </div>

            <div className={styles.kpiDatas}>
                <span>
                    {formatarDataComparacao(periodo?.inicio)}
                </span>

                <span className={styles.kpiSeparador}>
                    até
                </span>

                <span>
                    {formatarDataComparacao(periodo?.fim)}
                </span>
            </div>

            <div className={styles.kpiValorContainer}>
                <strong className={styles.kpiValor}>
                    {mediaValida
                        ? formatarNumero(periodo.media)
                        : "—"}
                </strong>

                {unidade && (
                    <span className={styles.kpiUnidade}>
                        {unidade}
                    </span>
                )}
            </div>

            <span className={styles.kpiDescricao}>
                Média registrada
            </span>

            <div className={styles.kpiRegistros}>
                <span>Registros válidos</span>

                <strong>
                    {registrosValidos
                        ? formatarNumero(periodo.registros_validos)
                        : "—"}
                </strong>
            </div>
        </div>
    )
}

function KPIDiferenca({ valor, unidade }) {
    const diferencaValida =
        valor !== null &&
        valor !== undefined &&
        valor !== "" &&
        Number.isFinite(Number(valor)) &&
        Number(valor) >= 0

    return (
        <div className={`${styles.kpiComparacaoCard} ${styles.kpiDiferencaCard}`}>
            <div className={styles.kpiCabecalho}>
                <span>Diferença absoluta</span>
            </div>

            <div className={styles.kpiValorContainer}>
                <strong className={styles.kpiDiferencaValor}>
                    {diferencaValida
                        ? formatarNumero(valor)
                        : "—"}
                </strong>

                {unidade && (
                    <span className={styles.kpiUnidade}>
                        {unidade}
                    </span>
                )}
            </div>

            <span className={styles.kpiDescricao}>
                Diferença entre as médias dos períodos
            </span>
        </div>
    )
}

function ResultadoComparacao({ dados }) {
    if (!dados?.periodo_1 || !dados?.periodo_2) {
        return (
            <p className={styles.qualidadeAviso} role="status">
                Os dados recebidos não possuem os dois períodos
                necessários para a comparação.
            </p>
        )
    }

    const unidade = dados.unidade || ""
    const variavel = formatarNomeVariavel(dados.variavel)
    const labelUnidade = unidade ? ` (${unidade})` : ""

    return (
        <div className={styles.resultadoComparacao}>
            <div className={styles.resultadoComparacaoCabecalho}>
                <h4>Comparação de {variavel}{labelUnidade}</h4>

                <p>
                    Médias e séries registradas nos períodos atual e anterior.
                </p>
            </div>

            <div className={styles.comparacaoKPIGrid}>
                <KPIComparacao
                    titulo="Período Atual"
                    periodo={dados.periodo_1}
                    unidade={unidade}
                    classe={styles.kpiPeriodo1}
                />

                <KPIComparacao
                    titulo="Período Anterior"
                    periodo={dados.periodo_2}
                    unidade={unidade}
                    classe={styles.kpiPeriodo2}
                />

                <KPIDiferenca
                    valor={dados.diferenca_absoluta}
                    unidade={unidade}
                />
            </div>

            {Array.isArray(dados.seriesAlinhadas) && dados.seriesAlinhadas.length > 0 && (
                <div className={styles.graficoCard} style={{ marginTop: '1rem' }}>
                    <h4 className={styles.tituloGrafico}>
                        Série Comparativa — {variavel}{labelUnidade}
                    </h4>
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart
                            data={dados.seriesAlinhadas}
                            margin={{ top: 10, right: 16, left: -10, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" />
                            <XAxis
                                dataKey="ponto"
                                tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.5)' }}
                                stroke="rgba(255, 255, 255, 0.2)"
                            />
                            <YAxis
                                unit={unidade ? ` ${unidade}` : ''}
                                tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.5)' }}
                                stroke="rgba(255, 255, 255, 0.2)"
                            />
                            <Tooltip
                                formatter={(value, name) => [
                                    value !== null ? `${formatarNumero(value)} ${unidade}` : 'Sem leitura',
                                    name,
                                ]}
                                contentStyle={{
                                    backgroundColor: 'rgba(3, 14, 30, 0.95)',
                                    border: '1px solid rgba(0, 217, 235, 0.5)',
                                    borderRadius: '8px',
                                    color: '#fff',
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="atual"
                                name={`Período Atual${labelUnidade}`}
                                stroke="#00e5ff"
                                strokeWidth={2.5}
                                dot={false}
                                connectNulls={false}
                                isAnimationActive={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="anterior"
                                name={`Período Anterior${labelUnidade}`}
                                stroke="#a259f7"
                                strokeWidth={2.5}
                                dot={false}
                                connectNulls={false}
                                isAnimationActive={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    )
}

function Historico() {
    const { identifier } = useParams()
    const {
        equipamentoId,
        selecionarEquipamento,
        periodoDraft,
        atualizarPeriodoDraft,
        periodoAplicado,
        aplicarPesquisaPeriodo,
        historicoAplicado,
        setHistoricoAplicado
    } = useFluxoAnalise()

    const equipamento = historicoAplicado.equipamento
    const dados = historicoAplicado.dados

    const {
        resumo: resultadoResumo,
        carregandoResumo,
        erroResumo,
        semDadosResumo,
        buscarResumo
    } = useAnaliseResumo(identifier)

    const {
        comparacao: resultadoComparacao,
        carregandoComparacao,
        erroComparacao,
        buscarComparacao,
        limparComparacao,
    } = useAnaliseComparacao(identifier)

    const {
    qualidade,
    carregandoQualidade,
    erroQualidade,
    atualizarQualidade,
    } = useQualidadeEquipamento(identifier)

    const [variavelResumo, setVariavelResumo] = useState('')
    const [variavelComparacao, setVariavelComparacao] = useState('')
    const [dataInicioR, setDatainicioR] = useState('')
    const [dataFinalR, setDataFinalR] = useState('')
    const [dataInicioP1, setDatainicioP1] = useState('')
    const [dataFinalP1, setDataFinalP1] = useState('')
    const [dataInicioP2, setDatainicioP2] = useState('')
    const [dataFinalP2, setDataFinalP2] = useState('')

    const [localizacaoSelecionada, setLocalizacaoSelecionada] = useState(null)

    const [carregandoPesquisa, setCarregandoPesquisa] = useState(false)
    const [erroPesquisa, setErroPesquisa] = useState('')
    const [carregandoCSV, setCarregandoCSV] = useState(false)
    const [erroCSV, setErroCSV] = useState('')

    const [abaAnalise, setAbaAnalise] = useState("resumo")

    // Sincroniza o equipamento da URL com o contexto e limpa estados locais ao trocar
    useEffect(() => {
        if (identifier && identifier !== equipamentoId) {
            selecionarEquipamento(identifier)
        }
        setVariavelResumo('')
        setVariavelComparacao('')
        setDatainicioR('')
        setDataFinalR('')
        setDatainicioP1('')
        setDataFinalP1('')
        setDatainicioP2('')
        setDataFinalP2('')
        setLocalizacaoSelecionada(null)
        limparComparacao()
        setErroPesquisa('')
        setErroCSV('')
    }, [identifier, equipamentoId, selecionarEquipamento, limparComparacao])

    const localizacoes = []
    dados.forEach((item) => {
        if (!item.localizacao) return
        const existe = localizacoes.some((loc) =>
            loc.latitude === item.localizacao.latitude &&
            loc.longitude === item.localizacao.longitude &&
            loc.inicio === item.localizacao.inicio &&
            loc.fim === item.localizacao.fim
        )
        if (!existe) localizacoes.push(item.localizacao)
    })

    const dadosDaLocalizacaoSelecionada = localizacaoSelecionada
        ? dados.filter((item) => {
            if (!item.localizacao) return false
            return (
                item.localizacao.latitude === localizacaoSelecionada.latitude &&
                item.localizacao.longitude === localizacaoSelecionada.longitude &&
                item.localizacao.inicio === localizacaoSelecionada.inicio &&
                item.localizacao.fim === localizacaoSelecionada.fim
            )
        }) : []

    const pesquisar = async () => {
        setCarregandoPesquisa(true)
        setErroPesquisa('')
        try {
            const { searchParams } = aplicarPesquisaPeriodo()
            const data = await getEquipmentHistory(identifier, searchParams)

            setHistoricoAplicado({
                equipamento: data.equipamento,
                dados: data.dados
            })
            setLocalizacaoSelecionada(null)
        } catch (error) {
            setErroPesquisa(error.message)
            setHistoricoAplicado({ equipamento: null, dados: [] })
        } finally {
            setCarregandoPesquisa(false)
        }
    }

    const temPeriodoAplicado = Boolean(periodoAplicado?.inicio && periodoAplicado?.fim)

    const handleExport = async () => {
        if (!temPeriodoAplicado) {
            setErroCSV('Pesquise um período antes de exportar o CSV.')
            return
        }

        setCarregandoCSV(true)
        setErroCSV('')
        try {
            const idAlvo = equipamento?.identificador || identifier
            await baixarHistoricoCSV(
                idAlvo,
                periodoAplicado.inicio,
                periodoAplicado.fim
            )
        } catch (error) {
            console.error("Erro ao exportar CSV:", error)
            setErroCSV(error?.message || "Não foi possível exportar o CSV.")
        } finally {
            setCarregandoCSV(false)
        }
    }

    // Fixtures sintéticas: utilizadas somente durante o desenvolvimento.
    const qualidadeMockadas = {
        atualizado: {
            equipamento_id: Number(identifier),
            ultima_medicao_valida: "2026-09-23 08:25:34",
            idade_minutos: 15,
            status: "atualizado",
            registros_nulos: 5,
            registros_invalidos: 2,
        },

        desatualizado: {
            equipamento_id: Number(identifier),
            ultima_medicao_valida: "2026-09-23 08:25:34",
            idade_minutos: 180,
            status: "desatualizado",
            registros_nulos: 5,
            registros_invalidos: 2,
        },

        sem_dados: {
            equipamento_id: Number(identifier),
            ultima_medicao_valida: null,
            idade_minutos: null,
            status: "sem_dados",
            registros_nulos: 0,
            registros_invalidos: 0,
        },

        indeterminado: {
            equipamento_id: Number(identifier),
            ultima_medicao_valida: null,
            idade_minutos: null,
            status: "indeterminado",
            registros_nulos: null,
            registros_invalidos: null,
        },
    }

    const qualidadeMockada = qualidadeMockadas.indeterminado

 const badgesStatusQualidade = {
    atualizado: {
        texto: "Atualizado",
        classe: styles.badgeAtualizado,
        descricao: "Medições dentro do intervalo esperado",
    },
    desatualizado: {
        texto: "Desatualizado",
        classe: styles.badgeDesatualizado,
        descricao: "Leitura antiga: última medição válida ultrapassou o intervalo esperado",
    },
    sem_dados: {
        texto: "Sem dados",
        classe: styles.badgeSemDados,
        descricao: "Ausência de dados: não existem medições registradas para este equipamento",
    },
    erro: {
        texto: "Erro na consulta",
        classe: styles.badgeInvalidos,
        descricao: "Falha ao consultar a API de qualidade",
    },
    indeterminado: {
        texto: "Indeterminado",
        classe: styles.badgeIndeterminado,
        descricao: "Não há informações suficientes para determinar a situação",
    },
}

const statusAtualQualidade = (() => {
    if (erroQualidade && !qualidade) return "erro"
    if (!qualidade) return "indeterminado"
    if (qualidade.status) return qualidade.status
    if (!qualidade.ultima_medicao_valida) return "sem_dados"
    return "indeterminado"
})()

const badgeStatus =
    badgesStatusQualidade[statusAtualQualidade] ??
    badgesStatusQualidade.indeterminado

function formatarIdadeMinutos(minutos) {
    if (minutos === null || minutos === undefined || !Number.isFinite(Number(minutos))) {
        return "Não disponível"
    }
    const total = Math.max(0, Math.round(Number(minutos)))
    if (total < 60) return `${total} minuto(s)`
    const horas = Math.floor(total / 60)
    const resto = total % 60
    return resto > 0 ? `${horas}h ${resto}min` : `${horas}h`
}
    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>

                {/* Header: Voltar e Título */}
                <div className={styles.header}>
                    <Link to="/" className={styles.voltar}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                        Voltar ao mapa
                    </Link>
                    <h2 className={styles.titulo}>Histórico do Equipamento</h2>
                </div>

                {/* Filtros: Pesquisa e CSV */}
                <div className={styles.filtrosCard}>
                    <div className={styles.filtrosInputs}>
                        <div className={styles.campo}>
                            <label className={styles.label} htmlFor="dataInicio">Data de Início</label>
                            <input
                                id="dataInicio"
                                className={styles.inputDate}
                                type="date"
                                value={periodoDraft.inicio}
                                onChange={(e) => atualizarPeriodoDraft('inicio', e.target.value)}
                            />
                        </div>
                        <div className={styles.campo}>
                            <label className={styles.label} htmlFor="dataFinal">Data Final</label>
                            <input
                                id="dataFinal"
                                className={styles.inputDate}
                                type="date"
                                value={periodoDraft.fim}
                                onChange={(e) => atualizarPeriodoDraft('fim', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className={styles.actions}>
                        <button
                            className={styles.btnPesquisar}
                            onClick={pesquisar}
                            disabled={carregandoPesquisa}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            {carregandoPesquisa ? "Buscando..." : "Pesquisar"}
                        </button>

                        <button
                            className={styles.btnGerarCSV}
                            onClick={handleExport}
                            disabled={carregandoCSV || !temPeriodoAplicado}
                            title={!temPeriodoAplicado ? "Pesquise um período primeiro" : "Exportar histórico em CSV"}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="8" y1="13" x2="16" y2="13" />
                                <line x1="8" y1="17" x2="16" y2="17" />
                            </svg>
                            {carregandoCSV ? "Gerando CSV..." : "Gerar CSV"}
                        </button>
                    </div>
                </div>

                {/* Alertas */}
                {carregandoPesquisa && (
                    <div className={styles.loadingBox}>
                        <div className={styles.spinner}></div>
                        <p>Carregando histórico...</p>
                    </div>
                )}

                {carregandoCSV && (
                    <div className={styles.loadingBox}>
                        <div className={styles.spinner}></div>
                        <p>Gerando CSV...</p>
                    </div>
                )}

                {erroPesquisa && (
                    <div className={styles.errorBox}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        {erroPesquisa}
                    </div>
                )}

                {erroCSV && (
                    <div className={styles.errorBox}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        {erroCSV}
                    </div>
                )}

                {/* Conteúdo: Mapa e Dados */}
                {equipamento && !carregandoPesquisa && (
                    <div className={styles.historicoContainer}>

                        <div className={styles.mapaCard}>
                            <h3 className={styles.subtituloSecao}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                                Histórico de Localizações
                            </h3>
                            <div className={styles.mapFrame}>
                                <MapContainer
                                    center={localizacoes.length > 0 ? [localizacoes[0].latitude, localizacoes[0].longitude] : [-8.0476, -34.877]}
                                    zoom={13}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' />
                                    <TileLayer url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}" />
                                    <TileLayer url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}" />

                                    {localizacoes.map((localizacao, index) => (
                                        <Marker
                                            key={index}
                                            position={[localizacao.latitude, localizacao.longitude]}
                                            icon={customNeonMarker}
                                            eventHandlers={{ click: () => setLocalizacaoSelecionada(localizacao) }}
                                        >
                                            <Popup className={styles.customPopup}>
                                                <div className={styles.popupContent}>
                                                    <strong>{equipamento.nome}</strong><br /><br />
                                                    Lat: {localizacao.latitude}<br />
                                                    Lng: {localizacao.longitude}<br /><br />
                                                    <strong>Início:</strong><br />
                                                    {localizacao.inicio ? new Date(localizacao.inicio).toLocaleString('pt-BR') : 'Não informado'}<br />
                                                    <strong>Fim:</strong><br />
                                                    {localizacao.fim ? new Date(localizacao.fim).toLocaleString('pt-BR') : 'Localização atual'}
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}
                                </MapContainer>
                            </div>
                        </div>

                        {localizacaoSelecionada && (
                            <div className={styles.infoLocalCard}>
                                <h3 className={styles.subtituloSecao}>Detalhes da Localização</h3>
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}><span>Latitude:</span> <strong>{localizacaoSelecionada.latitude}</strong></div>
                                    <div className={styles.infoItem}><span>Longitude:</span> <strong>{localizacaoSelecionada.longitude}</strong></div>
                                    <div className={styles.infoItem}>
                                        <span>Início:</span>
                                        <strong>{localizacaoSelecionada.inicio ? new Date(localizacaoSelecionada.inicio).toLocaleString('pt-BR') : 'Não informado'}</strong>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <span>Fim:</span>
                                        <strong>{localizacaoSelecionada.fim ? new Date(localizacaoSelecionada.fim).toLocaleString('pt-BR') : 'Localização atual'}</strong>
                                    </div>
                                    <div className={styles.infoItem}><span>Leituras encontradas:</span> <strong>{dadosDaLocalizacaoSelecionada.length}</strong></div>
                                </div>
                            </div>
                        )}

                        {dadosDaLocalizacaoSelecionada.length > 0 && (
                            <div className={styles.graficosGrid}>
                                {equipamento.tipo === 'estacao' && (
                                    <>
                                        <GraficoHistorico titulo="Temperatura" dados={dadosDaLocalizacaoSelecionada} dataKey="temperatura" unidade="°C" corLinha="#00e5ff" />
                                        <GraficoHistorico titulo="Umidade" dados={dadosDaLocalizacaoSelecionada} dataKey="umidade" unidade="%" corLinha="#00b9d6" />
                                        <GraficoHistorico titulo="Qualidade do ar" dados={dadosDaLocalizacaoSelecionada} dataKey="ar" unidade="" corLinha="#a259f7" />
                                        <GraficoHistorico titulo="Gás" dados={dadosDaLocalizacaoSelecionada} dataKey="gas" unidade="" corLinha="#a1c298" />
                                        <GraficoHistorico titulo="Luminosidade" dados={dadosDaLocalizacaoSelecionada} dataKey="luz" unidade="" corLinha="#f5a623" />
                                        <GraficoHistorico titulo="Pressão" dados={dadosDaLocalizacaoSelecionada} dataKey="pressao" unidade="" corLinha="#264653" />
                                        <GraficoHistorico titulo="RPM" dados={dadosDaLocalizacaoSelecionada} dataKey="rpm" unidade="RPM" corLinha="#8D99AE" />
                                        <GraficoHistorico titulo="Vento" dados={dadosDaLocalizacaoSelecionada} dataKey="vento" unidade="" corLinha="#2B6F6F" />
                                        <GraficoHistorico titulo="Tensão Elétrica" dados={dadosDaLocalizacaoSelecionada} dataKey="volt" unidade="V" corLinha="#a259f7" />
                                    </>
                                )}

                                {equipamento.tipo === 'boia' && (
                                    <>
                                        <GraficoHistorico titulo="pH" dados={dadosDaLocalizacaoSelecionada} dataKey="ph" unidade="" corLinha="#00e5ff" />
                                        <GraficoHistorico titulo="Turbidez" dados={dadosDaLocalizacaoSelecionada} dataKey="turbidez_ntu" unidade="" corLinha="#557db4" />
                                        <GraficoHistorico titulo="Sensor UV" dados={dadosDaLocalizacaoSelecionada} dataKey="sensor_uv_v" unidade="V" corLinha="#f5a623" />
                                        <GraficoHistorico titulo="ADC" dados={dadosDaLocalizacaoSelecionada} dataKey="adc" unidade="" corLinha="#9b6cbb" />
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <section className={styles.analiseSection}>

                    <h3 className={styles.subtituloSecao}>Análise das medições</h3>

                    <div className={styles.qualidadeCard}>
    <div className={styles.qualidadeCabecalho}>
        <div>
            <h4>Qualidade dos dados</h4>
            <p>Estado atual das medições do equipamento</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
                type="button"
                className={styles.btnPesquisar}
                onClick={atualizarQualidade}
                disabled={carregandoQualidade}
                title="Atualizar manualmente o estado de qualidade"
            >
                {carregandoQualidade ? "Atualizando..." : "Atualizar"}
            </button>

            <span
                className={`${styles.badgeStatus} ${badgeStatus.classe}`}
                role="status"
                title={badgeStatus.descricao}
            >
                {badgeStatus.texto}
            </span>
        </div>
    </div>

    {erroQualidade && (
        <div className={styles.errorBox} role="alert" style={{ marginTop: '0.75rem' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {erroQualidade}
        </div>
    )}

    {!erroQualidade && statusAtualQualidade === "sem_dados" && !carregandoQualidade && (
        <p className={styles.qualidadeSemDados} role="status" style={{ marginTop: '0.75rem' }}>
            Ausência de dados: nenhuma leitura válida foi registrada para este equipamento até o momento.
        </p>
    )}

    {statusAtualQualidade === "desatualizado" && (
        <p className={styles.qualidadeAviso} role="status" style={{ marginTop: '0.75rem' }}>
            Leitura antiga: a última medição válida ultrapassou o intervalo esperado de atualização.
        </p>
    )}

    <div className={styles.qualidadeInformacoes}>
        <div className={styles.qualidadeItem}>
            <span>Última medição válida</span>
            <strong>
                {qualidade?.ultima_medicao_valida ?? "Não disponível"}
            </strong>
        </div>

        <div className={styles.qualidadeItem}>
            <span>Tempo desde a última medição</span>
            <strong>
                {formatarIdadeMinutos(qualidade?.idade_minutos)}
            </strong>
        </div>
    </div>

    <div className={styles.qualidadeContagens}>
        <span className={`${styles.badgeContagem} ${styles.badgeNulos}`}>
            Nulos: {qualidade?.registros_nulos ?? "—"}
        </span>

        <span className={`${styles.badgeContagem} ${styles.badgeInvalidos}`}>
            Inválidos: {qualidade?.registros_invalidos ?? "—"}
        </span>
    </div>
</div>

                    <div className={styles.abas}>
                        <button
                            type="button"
                            className={`${styles.aba} ${abaAnalise === "resumo" ? styles.abaAtiva : ""}`}
                            onClick={() => setAbaAnalise("resumo")}
                        >
                            Resumo estatístico
                        </button>

                        <button
                            type="button"
                            className={`${styles.aba} ${abaAnalise === "comparacao" ? styles.abaAtiva : ""}`}
                            onClick={() => setAbaAnalise("comparacao")}
                        >
                            Comparação entre períodos
                        </button>
                    </div>

                    {abaAnalise === "resumo" && (
                        // Filtros: Resumo
                        <div className={styles.filtrosCard}>
                            <div className={styles.filtrosInputs}>
                                <div className={styles.campoVar}>
                                    <label className={styles.label} htmlFor="variavelResumo">Variável</label>
                                    <select
                                        id="variavelResumo"
                                        className={styles.inputDate}
                                        value={variavelResumo}
                                        onChange={(e) => setVariavelResumo(e.target.value)}
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="ph">pH</option>
                                        <option value="temperatura">Temperatura</option>
                                    </select>
                                </div>

                                <div className={styles.campo}>
                                    <label className={styles.label} htmlFor="dataInicioResumo">Data de Início</label>
                                    <input
                                        id="dataInicioResumo"
                                        className={styles.inputDate}
                                        type="date"
                                        value={dataInicioR}
                                        onChange={(e) => setDatainicioR(e.target.value)}
                                    />
                                </div>
                                <div className={styles.campo}>
                                    <label className={styles.label} htmlFor="dataFinalResumo">Data Final</label>
                                    <input
                                        id="dataFinalResumo"
                                        className={styles.inputDate}
                                        type="date"
                                        value={dataFinalR}
                                        onChange={(e) => setDataFinalR(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className={styles.actions}>
                                <button
                                    className={`${styles.btnPesquisar} ${styles.btnGerarResumo}`}
                                    onClick={() =>
                                        buscarResumo({
                                            variavel: variavelResumo,
                                            inicio: dataInicioR,
                                            fim: dataFinalR
                                        })
                                    }
                                    disabled={carregandoResumo}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                                        <line x1="9" y1="12" x2="15" y2="12" />
                                        <line x1="9" y1="16" x2="13" y2="16" />
                                    </svg>
                                    {carregandoResumo ? "Gerando resumo..." : "Gerar Resumo"}
                                </button>
                            </div>
                        </div>
                    )}

                    {abaAnalise === "comparacao" && (
                        // Filtros: Comparação
                        <div className={styles.filtrosGrid}>

                            <div className={styles.campoVar}>
                                <label className={styles.label} htmlFor="variavelComparacao">Variável</label>
                                <select
                                    id="variavelComparacao"
                                    className={styles.inputDate}
                                    value={variavelComparacao}
                                    onChange={(e) => {
                                        setVariavelComparacao(e.target.value)
                                        limparComparacao()
                                    }}
                                >
                                    <option value="">Selecione...</option>
                                    {equipamento?.tipo === 'boia' ? (
                                        <>
                                            <option value="ph">pH</option>
                                            <option value="turbidez_ntu">Turbidez (NTU)</option>
                                            <option value="sensor_uv_v">Sensor UV (V)</option>
                                            <option value="adc">ADC</option>
                                        </>
                                    ) : equipamento?.tipo === 'estacao' ? (
                                        <>
                                            <option value="temperatura">Temperatura (°C)</option>
                                            <option value="umidade">Umidade (%)</option>
                                            <option value="pressao">Pressão (hPa)</option>
                                            <option value="vento">Vento (m/s)</option>
                                            <option value="rpm">RPM</option>
                                            <option value="luz">Luminosidade (lx)</option>
                                            <option value="ar">Qualidade do ar (AQI)</option>
                                            <option value="gas">Gás (ppm)</option>
                                            <option value="volt">Tensão Elétrica (V)</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="temperatura">Temperatura (°C)</option>
                                            <option value="umidade">Umidade (%)</option>
                                            <option value="ph">pH</option>
                                            <option value="turbidez_ntu">Turbidez (NTU)</option>
                                        </>
                                    )}
                                </select>
                            </div>

                            <div className={styles.campo}>
                                <label className={styles.label} htmlFor="dataInicioComparacao1">Período Atual: Início</label>
                                <input
                                    id="dataInicioComparacao1"
                                    className={styles.inputDate}
                                    type="date"
                                    value={dataInicioP1}
                                    onChange={(e) => setDatainicioP1(e.target.value)}
                                />
                            </div>
                            <div className={styles.campo}>
                                <label className={styles.label} htmlFor="dataFinalComparacao1">Período Atual: Final</label>
                                <input
                                    id="dataFinalComparacao1"
                                    className={styles.inputDate}
                                    type="date"
                                    value={dataFinalP1}
                                    onChange={(e) => setDataFinalP1(e.target.value)}
                                />
                            </div>

                            <div className={`${styles.campo} ${styles.periodoInicial2}`}>
                                <label className={styles.label} htmlFor="dataInicialComparacao2">Período Anterior: Início</label>
                                <input
                                    id="dataInicialComparacao2"
                                    className={styles.inputDate}
                                    type="date"
                                    value={dataInicioP2}
                                    onChange={(e) => setDatainicioP2(e.target.value)}
                                />
                            </div>
                            <div className={`${styles.campo} ${styles.periodoFinal2}`}>
                                <label className={styles.label} htmlFor="dataFinalComparacao2">Período Anterior: Final</label>
                                <input
                                    id="dataFinalComparacao2"
                                    className={styles.inputDate}
                                    type="date"
                                    value={dataFinalP2}
                                    onChange={(e) => setDataFinalP2(e.target.value)}
                                />
                            </div>

                            <div className={`${styles.actions} ${styles.actionsComparacao}`}>
                                <button
                                    className={`${styles.btnPesquisar} ${styles.btnComparacao}`}
                                    onClick={() =>
                                        buscarComparacao({
                                            variavel: variavelComparacao,
                                            inicioAtual: dataInicioP1,
                                            fimAtual: dataFinalP1,
                                            inicioAnterior: dataInicioP2,
                                            fimAnterior: dataFinalP2,
                                        })
                                    }
                                    disabled={carregandoComparacao}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                                        <line x1="9" y1="12" x2="15" y2="12" />
                                        <line x1="9" y1="16" x2="13" y2="16" />
                                    </svg>
                                    {carregandoComparacao ? "Comparando..." : "Gerar Comparação"}
                                </button>
                            </div>
                        </div>
                    )}

                    {abaAnalise === "resumo" && (
                        <>
                            <AlertasConsulta
                                carregando={carregandoResumo}
                                erro={erroResumo}
                                mensagemCarregamento="Gerando resumo estatístico..."
                            />

                            {semDadosResumo && !carregandoResumo && !erroResumo && (
                                <p className={styles.qualidadeSemDados} role="status">
                                    Nenhum registro foi encontrado para a variável e o período selecionados.
                                </p>
                            )}

                            {resultadoResumo && !carregandoResumo && (
                                <div className={styles.resumoGraficosGrid}>
                                    <GraficoFaixaEstatistica
                                        dados={resultadoResumo}
                                    />

                                    <GraficoQualidadeRegistros
                                        dados={resultadoResumo.qualidade_dos_dados}
                                    />
                                </div>
                            )}
                        </>
                    )}

                    {abaAnalise === "comparacao" && (
                        <>
                            <AlertasConsulta
                                carregando={carregandoComparacao}
                                erro={erroComparacao}
                                mensagemCarregamento="Comparando períodos..."
                            />

                            {resultadoComparacao && !carregandoComparacao && (
                                <ResultadoComparacao
                                    dados={resultadoComparacao}
                                />
                            )}
                        </>
                    )}

                </section>

            </div>
        </div>
    )
}

export default Historico