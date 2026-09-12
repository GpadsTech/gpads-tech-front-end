import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
    MapContainer,
    TileLayer,
    Marker,
    useMap,
    useMapEvents
} from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

import {
    cadastrarEquipamento,
    pesquisarLocalizacao
} from "../services/api.js"

import styles from "./CadastroEquipamento.module.css"

// Ícone personalizado com efeito Neon Cyan
const customNeonMarker = L.divIcon({
    className: "custom-neon-pin",
    html: `
        <div style="position: relative; width: 32px; height: 42px; display: flex; align-items: center; justify-content: center;">
            <svg width="32" height="42" viewBox="0 0 36 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 0C8.06 0 0 8.06 0 18C0 29.5 18 46 18 46C18 46 36 29.5 36 18C36 8.06 27.94 0 18 0Z" fill="#00e5ff" />
                <circle cx="18" cy="18" r="7" fill="#03162b" />
            </svg>
            <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: rgba(0, 229, 255, 0.45); filter: blur(6px); z-index: -1;"></div>
        </div>
    `,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
})

function SeletorLocalizacao({ onSelecionar }) {
    useMapEvents({
        click(event) {
            onSelecionar(event.latlng.lat, event.latlng.lng)
        }
    })
    return null
}

function CentralizarMapa({ posicao }) {
    const map = useMap()
    if (posicao) {
        map.setView(posicao, 15)
    }
    return null
}

function CadastroEquipamento() {
    const navigate = useNavigate()

    const [nome, setNome] = useState("")
    const [identificador, setIdentificador] = useState("")
    const [latitude, setLatitude] = useState("")
    const [longitude, setLongitude] = useState("")

    const [carregando, setCarregando] = useState(false)
    const [erro, setErro] = useState("")
    const [sucesso, setSucesso] = useState("")

    const [posicao, setPosicao] = useState(null)
    const [buscaLocalizacao, setBuscaLocalizacao] = useState("")
    const [resultadosLocalizacao, setResultadosLocalizacao] = useState([])
    const [pesquisandoLocalizacao, setPesquisandoLocalizacao] = useState(false)

    function selecionarLocalizacao(lat, lng) {
        setLatitude(lat.toFixed(6))
        setLongitude(lng.toFixed(6))
        setPosicao([lat, lng])
    }

    function selecionarResultadoLocalizacao(resultado) {
        const lat = resultado.latitude
        const lng = resultado.longitude
        setLatitude(lat.toFixed(6))
        setLongitude(lng.toFixed(6))
        setPosicao([lat, lng])
        setResultadosLocalizacao([])
    }

    async function handlePesquisarLocalizacao() {
        if (!buscaLocalizacao.trim()) {
            setErro("Digite um local para pesquisar.")
            return
        }

        setErro("")
        setResultadosLocalizacao([])
        setPesquisandoLocalizacao(true)

        try {
            const resultados = await pesquisarLocalizacao(buscaLocalizacao)
            if (resultados.length === 0) {
                setErro("Nenhuma localização encontrada.")
                return
            }
            setResultadosLocalizacao(resultados)
        } catch (error) {
            setErro(error.message)
        } finally {
            setPesquisandoLocalizacao(false)
        }
    }

    async function handleSubmit(event) {
        event.preventDefault()
        setErro("")
        setSucesso("")

        if (!nome.trim()) {
            setErro("Informe o nome do equipamento.")
            return
        }
        if (!identificador) {
            setErro("Informe o identificador.")
            return
        }
        if (!latitude || !longitude) {
            setErro("Selecione a localização do equipamento no mapa.")
            return
        }

        setCarregando(true)

        try {
            const data = await cadastrarEquipamento(
                nome,
                identificador,
                latitude,
                longitude
            )
            setSucesso(data.message || "Equipamento cadastrado com sucesso.")
            setNome("")
            setIdentificador("")
            setLatitude("")
            setLongitude("")
            setPosicao(null)

            setTimeout(() => {
                navigate("/")
            }, 1500)
        } catch (error) {
            setErro(error.message)
        } finally {
            setCarregando(false)
        }
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.formCard}>
                
                {/* Header do Card */}
                <div className={styles.formHeader}>
                    <div className={styles.iconWrapper}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                            <line x1="8" y1="21" x2="16" y2="21" />
                            <line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                    </div>
                    <div>
                        <h1 className={styles.titulo}>Cadastrar equipamento</h1>
                        <p className={styles.subtitulo}>Informe os dados do equipamento e selecione sua localização.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className={styles.formulario}>
                    
                    {/* Campos de Nome e Identificador */}
                    <div className={styles.campo}>
                        <label>Nome</label>
                        <input
                            type="text"
                            value={nome}
                            onChange={(event) => setNome(event.target.value)}
                            placeholder="Ex.: Estação Recife"
                        />
                    </div>

                    <div className={styles.campo}>
                        <label>Identificador</label>
                        <input
                            type="number"
                            value={identificador}
                            onChange={(event) => setIdentificador(event.target.value)}
                            placeholder="Ex.: 51001"
                            min="10000"
                            max="99999"
                        />
                    </div>

                    {/* Bloco de Pesquisa de Localização */}
                    <div className={styles.blocoPesquisa}>
                        <label className={styles.tituloPesquisa}>Localização</label>
                        <span className={styles.subtituloPesquisa}>Pesquise a localização:</span>
                        
                        <div className={styles.pesquisaRow}>
                            <input
                                type="text"
                                value={buscaLocalizacao}
                                onChange={(event) => setBuscaLocalizacao(event.target.value)}
                                placeholder="Ex.: Recife, Pernambuco"
                            />
                            <button
                                type="button"
                                className={styles.btnPesquisa}
                                onClick={handlePesquisarLocalizacao}
                                disabled={pesquisandoLocalizacao}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                                {pesquisandoLocalizacao ? "Pesquisando" : "Pesquisar"}
                            </button>
                        </div>
                        
                        {resultadosLocalizacao.length > 0 && (
                            <div className={styles.resultadosLista}>
                                {resultadosLocalizacao.map((resultado, index) => (
                                    <button
                                        key={`${resultado.latitude}-${resultado.longitude}-${index}`}
                                        type="button"
                                        className={styles.resultadoItem}
                                        onClick={() => selecionarResultadoLocalizacao(resultado)}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                        {resultado.nome}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Mapa Integrado */}
                    <div className={styles.mapaContainer}>
                        <div className={styles.mapaHeaderInfo}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                            <span>Clique no mapa para selecionar a localização do equipamento.</span>
                        </div>
                        
                        <div className={styles.mapFrame}>
                            <MapContainer
                                center={[-8.0476, -34.877]}
                                zoom={12}
                                style={{ height: "100%", width: "100%" }}
                            >
                                <TileLayer
                                    attribution='&copy; OpenStreetMap contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <CentralizarMapa posicao={posicao} />
                                <SeletorLocalizacao onSelecionar={selecionarLocalizacao} />
                                {posicao && <Marker position={posicao} icon={customNeonMarker} />}
                            </MapContainer>
                        </div>
                    </div>

                    {/* Latitude e Longitude (Readonly) */}
                    <div className={styles.gridDuasColunas}>
                        <div className={styles.campo}>
                            <label>Latitude</label>
                            <input
                                type="text"
                                value={latitude}
                                readOnly
                                placeholder="Selecione no mapa"
                            />
                        </div>
                        <div className={styles.campo}>
                            <label>Longitude</label>
                            <input
                                type="text"
                                value={longitude}
                                readOnly
                                placeholder="Selecione no mapa"
                            />
                        </div>
                    </div>

                    {/* Alertas */}
                    {erro && (
                        <div className={styles.mensagemErro}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            {erro}
                        </div>
                    )}

                    {sucesso && (
                        <div className={styles.mensagemSucesso}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                            {sucesso}
                        </div>
                    )}

                    {/* Botão de Submit */}
                    <div className={styles.footerForm}>
                        <button
                            type="submit"
                            className={styles.btnPrimario}
                            disabled={carregando}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                <polyline points="17 21 17 13 7 13 7 21" />
                                <polyline points="7 3 7 8 15 8" />
                            </svg>
                            {carregando ? "Cadastrando..." : "Cadastrar equipamento"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CadastroEquipamento