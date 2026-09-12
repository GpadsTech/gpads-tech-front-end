import Gauge from './Gauge.jsx'
import styles from './Dashboard.module.css'
import { useEffect, useState } from 'react'
import { getIdToken } from '../auth.js'
import { Link } from 'react-router-dom'
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts'

const API_URL = "https://gpads-api-dados.onrender.com"

function SensorLineChart({
    titulo,
    dados,
    campo,
    unidade,
    cor,
    dominio = [0, 100],
    formatarY
}) {
    const historico = dados
        .filter(item =>
            item.hora &&
            item[campo] !== null &&
            item[campo] !== undefined
        )
        .slice(-20)
        .map(item => ({
            valor: Number(item[campo]),
            label: item.hora
        }))

    return (
        <div style={{ width: '100%' }}>
            <p className={styles.chartTitle}>{titulo}</p>
            <p className={styles.chartValue} style={{ color: cor }}>
                {historico.length > 0
                    ? historico[historico.length - 1].valor.toLocaleString('pt-BR')
                    : '—'
                }
                {' '}
                <span className={styles.chartUnit}>{unidade}</span>
            </p>

            <ResponsiveContainer width="100%" height={160}>
                <LineChart
                    data={historico}
                    margin={{ top: 4, right: 8, left: -10, bottom: 0 }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255, 255, 255, 0.08)"
                    />
                    <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10, fill: 'rgba(255, 255, 255, 0.4)' }}
                        interval="preserveStartEnd"
                        tickFormatter={(valor) => {
                            if (!valor) return ''
                            const partes = valor.split(' ')
                            return partes[1] || valor
                        }}
                    />
                    <YAxis
                        tick={{ fontSize: 10, fill: 'rgba(255, 255, 255, 0.4)' }}
                        tickFormatter={formatarY ?? (v => v)}
                        domain={dominio}
                    />
                    <Tooltip
                        formatter={(v) => [
                            `${Number(v).toLocaleString('pt-BR')} ${unidade}`,
                            titulo
                        ]}
                        labelFormatter={(label) => `Leitura: ${label}`}
                        labelStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}
                        contentStyle={{
                            backgroundColor: 'rgba(3, 14, 30, 0.95)',
                            border: '1px solid rgba(0, 217, 235, 0.5)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: 12,
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)'
                        }}
                        itemStyle={{ color: '#00e5ff', fontWeight: 600 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="valor"
                        stroke={cor}
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: '#020713', stroke: cor, strokeWidth: 2 }}
                        activeDot={{ r: 5, fill: cor, stroke: '#fff' }}
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

function formatarDataHora(hora) {
    if (!hora) return '—'
    const [data, horario] = hora.split(' ')
    if (!data || !horario) return hora
    const [ano, mes, dia] = data.split('-')
    return {
        data: `${dia}/${mes}/${ano}`,
        hora: horario
    }
}

function Dashboard({ equipamento, onFechar }) {
    const [leitura, setLeitura] = useState(null)
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState(null)
    const dataHoraLeitura = formatarDataHora(leitura?.hora)
    const [leituras, setLeituras] = useState([])
    const [statusDados, setStatusDados] = useState('carregando')

    useEffect(() => {
        if (!equipamento) return

        let ativo = true
        async function carregarDados() {
            try {
                setErro(null)
                setStatusDados('carregando')

                const token = await getIdToken()
                const response = await fetch(
                    `${API_URL}/api/equipamentos/${equipamento.identificador}/dados/`,
                    {
                        method: "GET",
                        headers: { Authorization: `Bearer ${token}` }
                    }
                )

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.message || "Não foi possível carregar os dados do equipamento.")
                }

                const dados = data.dados || {}
                const leiturasRecebidas = Object.values(dados)

                if (leiturasRecebidas.length === 0) {
                    if (ativo) {
                        setLeitura(null)
                        setLeituras([])
                        setStatusDados('sem_dados')
                    }
                    return
                }

                const leiturasComHora = leiturasRecebidas
                    .filter(item => item.hora)
                    .sort((a, b) => new Date(a.hora) - new Date(b.hora))

                const ultimaLeitura = leiturasComHora.length > 0
                    ? leiturasComHora[leiturasComHora.length - 1]
                    : leiturasRecebidas[leiturasRecebidas.length - 1]
                
                let novoStatus = 'atualizado'

                if (ultimaLeitura?.hora) {
                    const dataLeitura = new Date(ultimaLeitura.hora)
                    const agora = new Date()
                    const diferencaEmMinutos = (agora - dataLeitura) / (1000 * 60)
                    if (diferencaEmMinutos > 10) novoStatus = 'desatualizado'
                }

                if (ativo) {
                    setLeitura(ultimaLeitura)
                    setLeituras(leiturasComHora)
                    setStatusDados(novoStatus)
                }

            } catch (error) {
                console.error("Erro ao carregar dados do equipamento:", error)
                if (ativo) {
                    setErro(error.message)
                    setStatusDados('erro')
                }
            } finally {
                if (ativo) setCarregando(false)
            }
        }

        carregarDados()
        const intervalo = setInterval(() => { carregarDados() }, 60000)

        return () => {
            ativo = false
            clearInterval(intervalo)
        }
    }, [equipamento])

    if (!equipamento) return null

    const isBoia = equipamento.tipo === "boia"

    const valorTemperatura = leitura?.temperatura ?? 0
    const valorUmidade = leitura?.umidade ?? 0
    const chuvaAcumulada = leitura?.chuva_acumulada ?? 0
    const valorAr = leitura?.ar ?? 0
    const valorChuva = leitura?.chuva ?? 0
    const valorGas = leitura?.gas ?? 0
    const valorPressao = leitura?.["pressão"] ?? leitura?.pressao ?? 0
    const valorRpm = leitura?.rpm ?? 0
    const valorVento = leitura?.vento ?? 0

    const valorPh = leitura?.ph ?? 0
    const valorTurbidez = leitura?.turbidez_v ?? 0
    const valorSensorUV = leitura?.sensor_uv_v ?? 0
    const valorAdc = leitura?.adc ?? 0

    return (
        <div className={styles.dashboard}>
            
            {/* Header do Dashboard */}
            <div className={styles.headerDashboard}>
                <div>
                    <h2 className={styles.titulo}>{equipamento.nome}</h2>
                    <div className={styles.subtitulo}>
                        <span className={styles.badge}>{isBoia ? 'Boia' : 'Estação'}</span>
                        {' • '}
                        Identificador: {equipamento.identificador}
                    </div>

                    <div className={styles.statusRow}>
                        <span className={styles.statusDot} style={{
                            backgroundColor:
                                statusDados === 'atualizado' ? '#00e5ff' :
                                statusDados === 'desatualizado' ? '#e0a11a' :
                                statusDados === 'sem_dados' ? '#666' :
                                statusDados === 'erro' ? '#ff4b4b' : '#666',
                            boxShadow: `0 0 10px ${statusDados === 'atualizado' ? '#00e5ff' : 'transparent'}`
                        }} />
                        <span>
                            {statusDados === 'carregando' && 'Verificando dados...'}
                            {statusDados === 'atualizado' && 'Dados atualizados em tempo real'}
                            {statusDados === 'desatualizado' && 'Dados desatualizados'}
                            {statusDados === 'sem_dados' && 'Nenhuma leitura disponível'}
                            {statusDados === 'erro' && 'Erro ao carregar dados'}
                        </span>
                    </div>
                </div>

                <div className={styles.actionsBox}>
                    <Link to={`/historico/${equipamento.identificador}`} className={styles.btnHistorico}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="12 8 12 12 14 14" />
                            <circle cx="12" cy="12" r="10" />
                        </svg>
                        Histórico
                    </Link>
                    <button onClick={onFechar} className={styles.btnClose} title="Fechar Dashboard">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mensagens Globais */}
            {carregando && (
                <div className={styles.loadingBox}>
                    <div className={styles.spinner}></div>
                    <p>Carregando telemetria...</p>
                </div>
            )}

            {erro && <div className={styles.errorBox}>{erro}</div>}

            {!carregando && !erro && !leitura && (
                <div className={styles.emptyBox}>Nenhuma leitura disponível para este equipamento no momento.</div>
            )}

            {/* Grid de Cards - Estação */}
            {!carregando && !erro && leitura && !isBoia && (
                <div className={styles.grid}>
                    
                    <div className={styles.card}>
                        <p className={styles.cardInfoTitle}>Última leitura</p>
                        {leitura?.hora ? (
                            <>
                                <p className={styles.cardInfoData}>{dataHoraLeitura.data}</p>
                                <p className={styles.cardInfoHora}>{dataHoraLeitura.hora}</p>
                            </>
                        ) : (<p className={styles.cardInfoData}>—</p>)}
                    </div>

                    <div className={styles.card}><Gauge titulo="Temperatura" valor={valorTemperatura} min={0} max={50} cor="#00e5ff" unidade="°C" /></div>
                    <div className={styles.card}><Gauge titulo="Umidade" valor={valorUmidade} min={0} max={100} cor="#00b9d6" unidade="%" /></div>
                    <div className={styles.card}><Gauge titulo="Chuva Acumulada" valor={chuvaAcumulada} min={0} max={50} cor="#4ef0ff" unidade="" /></div>
                    <div className={styles.card}><Gauge titulo="Índice de Qualidade (AQI)" valor={valorAr} min={0} max={100} cor="#a259f7" unidade="AQI" /></div>
                    <div className={styles.card}><Gauge titulo="Nível de Chuva" valor={valorChuva} min={0} max={150} cor="#557db4" unidade="mm" /></div>
                    <div className={styles.card}><Gauge titulo="CO2" valor={valorGas} min={0} max={10000} cor="#a1c298" unidade="ppm" /></div>
                    <div className={styles.card}><Gauge titulo="Pressão" valor={valorPressao} min={300} max={1100} cor="#264653" unidade="hPa" /></div>
                    <div className={styles.card}><Gauge titulo="RPM" valor={valorRpm} min={0} max={10000} cor="#8D99AE" unidade="RPM" /></div>
                    <div className={styles.card}><Gauge titulo="Velocidade do Vento" valor={valorVento} min={0} max={75} cor="#2B6F6F" unidade="m/s" /></div>

                    <div className={styles.card}>
                        <SensorLineChart titulo="Tensão Elétrica" dados={leituras} campo="volt" unidade="V" cor="#a259f7" dominio={[0, 5]} formatarY={v => `${v}V`} />
                    </div>

                    <div className={styles.card}>
                        <SensorLineChart titulo="Luminosidade" dados={leituras} campo="luz" unidade="lx" cor="#f5a623" dominio={[0, 100000]} formatarY={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                    </div>

                </div>
            )}

            {/* Grid de Cards - Boia */}
            {!carregando && !erro && leitura && isBoia && (
                <div className={styles.grid}>
                    <div className={styles.card}>
                        <p className={styles.cardInfoTitle}>Última leitura</p>
                        {leitura?.hora ? (
                            <>
                                <p className={styles.cardInfoData}>{dataHoraLeitura.data}</p>
                                <p className={styles.cardInfoHora}>{dataHoraLeitura.hora}</p>
                            </>
                        ) : (<p className={styles.cardInfoData}>—</p>)}
                    </div>


                    <div className={styles.card}><Gauge titulo="pH" valor={valorPh} min={0} max={14} cor="#00e5ff" unidade="pH" /></div>
                    <div className={styles.card}><Gauge titulo="Turbidez" valor={valorTurbidez} min={0} max={100} cor="#557db4" unidade="V" /></div>
                    <div className={styles.card}><Gauge titulo="Sensor UV" valor={valorSensorUV} min={0} max={5} cor="#f5a623" unidade="V" /></div>
                    <div className={styles.card}><Gauge titulo="ADC" valor={valorAdc} min={0} max={4095} cor="#9b6cbb" unidade="" /></div>
                </div>
            )}
        </div>
    )
}

export default Dashboard