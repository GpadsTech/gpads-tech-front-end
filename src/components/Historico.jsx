import { useState } from "react"
import styles from './Historico.module.css'
import { Link, useParams } from 'react-router-dom'
import { getIdToken } from '../auth.js'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts'

// Ícone de mapa personalizado com Neon Cyan
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

function Historico() {
    const { identifier } = useParams()
    const [dataInicio, setDatainicio] = useState('')
    const [dataFinal, setDataFinal] = useState('')
    const [dados, setDados] = useState([])
    const [equipamento, setEquipamento] = useState(null)
    const [localizacaoSelecionada, setLocalizacaoSelecionada] = useState(null)
    const [carregando, setCarregando] = useState(false)
    const [erro, setErro] = useState('')

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
        setCarregando(true)
        setErro('')
        try {
            const token = await getIdToken()
            const parametros = new URLSearchParams()
            if (dataInicio) parametros.append('inicio', dataInicio)
            if (dataFinal) parametros.append('fim', dataFinal)

            const queryString = parametros.toString()
            const url = `http://127.0.0.1:8000/api/equipamentos/${identifier}/historico/` + (queryString ? `?${queryString}` : '')

            const response = await fetch(url, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.message || "Erro ao buscar histórico.")

            setEquipamento(data.equipamento)
            setDados(data.dados)
            setLocalizacaoSelecionada(null)
        } catch (error) {
            setErro(error.message)
            setDados([])
            setEquipamento(null)
        } finally {
            setCarregando(false)
        }
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

                {/* Filtros */}
                <div className={styles.filtrosCard}>
                    <div className={styles.filtrosInputs}>
                        <div className={styles.campo}>
                            <label className={styles.label}>Data de Início</label>
                            <input
                                className={styles.inputDate}
                                type="date"
                                value={dataInicio}
                                onChange={(e) => setDatainicio(e.target.value)}
                            />
                        </div>
                        <div className={styles.campo}>
                            <label className={styles.label}>Data Final</label>
                            <input
                                className={styles.inputDate}
                                type="date"
                                value={dataFinal}
                                onChange={(e) => setDataFinal(e.target.value)}
                            />
                        </div>
                    </div>
                    <button className={styles.btnPesquisar} onClick={pesquisar} disabled={carregando}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                        {carregando ? "Buscando..." : "Pesquisar"}
                    </button>
                </div>

                {/* Alertas */}
                {carregando && (
                    <div className={styles.loadingBox}>
                        <div className={styles.spinner}></div>
                        <p>Carregando histórico...</p>
                    </div>
                )}

                {erro && (
                    <div className={styles.errorBox}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        {erro}
                    </div>
                )}

                {/* Conteúdo: Mapa e Dados */}
                {equipamento && !carregando && (
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
                                                    <strong>{equipamento.nome}</strong><br/><br/>
                                                    Lat: {localizacao.latitude}<br/>
                                                    Lng: {localizacao.longitude}<br/><br/>
                                                    <strong>Início:</strong><br/>
                                                    {localizacao.inicio ? new Date(localizacao.inicio).toLocaleString('pt-BR') : 'Não informado'}<br/>
                                                    <strong>Fim:</strong><br/>
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
                                        <GraficoHistorico titulo="Turbidez" dados={dadosDaLocalizacaoSelecionada} dataKey="turbidez_v" unidade="" corLinha="#557db4" />
                                        <GraficoHistorico titulo="Sensor UV" dados={dadosDaLocalizacaoSelecionada} dataKey="sensor_uv_v" unidade="V" corLinha="#f5a623" />
                                        <GraficoHistorico titulo="ADC" dados={dadosDaLocalizacaoSelecionada} dataKey="adc" unidade="" corLinha="#9b6cbb" />
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Historico