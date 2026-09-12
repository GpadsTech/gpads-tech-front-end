import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

import styles from './MapaPublico.module.css'
import { getEquipamentosPublicos } from '../services/api.js'

// IMPORTAMOS A NOVA FUNÇÃO DE LOGIN ANÔNIMO
import { loginAnonimo, logout } from '../auth.js' 

import DashboardPublico from './DashboardPublico.jsx'

// Ícone do logo
import logoImg from '../assets/logo.png'

// Ícone Neon Cyan
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

function CorrigirMapa() {
    const map = useMap()
    useEffect(() => {
        setTimeout(() => map.invalidateSize(), 150)
        map.on('zoomend', () => map.invalidateSize())
    }, [map])
    return null
}

function MapaPublico() {
    const navigate = useNavigate()
    const centroInicial = [-7.9771, -36.4946]

    const [equipamentos, setEquipamentos] = useState([])
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState('')
    const [equipamentoAberto, setEquipamentoAberto] = useState(null)

    useEffect(() => {
        let isMounted = true

        async function carregarEquipamentos() {
            try {
                setCarregando(true)

                // 1. FAZ O LOGIN ANÔNIMO SILENCIOSO PRIMEIRO
                await loginAnonimo()

                // 2. AGORA QUE TEMOS O TOKEN, CARREGA OS EQUIPAMENTOS
                const data = await getEquipamentosPublicos()
                
                if (isMounted) {
                    setEquipamentos(data)
                }

            } catch (error) {
                console.error('Erro ao carregar equipamentos:', error)
                if (isMounted) {
                    setErro('Não foi possível carregar as estações públicas. Verifique a conexão com o servidor.')
                }
            } finally {
                if (isMounted) setCarregando(false)
            }
        }
        carregarEquipamentos()

        return () => {
            isMounted = false
        }
    }, [])

    const handleIrParaLogin = async () => {
        // Quando for para a página de Login oficial, fazemos logout do anônimo
        await logout() 
        navigate('/login')
    }

    return (
        <div className={styles.pageContainer}>
            
            {/* Header Público Simplificado */}
            <header className={styles.header}>
                <div className={styles.brand}>
                    <div className={styles.logoBox}>
                        <img src={logoImg} alt="Moringa Logo" className={styles.logoImg} />
                    </div>
                    <span className={styles.tituloHeader}>GpadsTech</span>
                    <span className={styles.tagPublica}>Acesso Público</span>
                </div>

                <button className={styles.btnLogin} onClick={handleIrParaLogin}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line x1="15" y1="12" x2="3" y2="12" />
                    </svg>
                    Fazer Login
                </button>
            </header>

            {/* Container do Mapa */}
            <div className={styles.mapFrame}>
                <MapContainer center={centroInicial} zoom={12} zoomControl={true} style={{ height: '100%', width: '100%' }}>
                    <CorrigirMapa />

                    <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution="&copy; Esri, Maxar, Earthstar Geographics"
                        maxZoom={18}
                    />
                    <TileLayer url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}" />
                    <TileLayer url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}" />

                    {equipamentos.map((equipamento) => {
                        const localizacao = equipamento.localizacaoAtual
                        if (!localizacao) return null

                        return (
                            <Marker
                                key={equipamento.identificador}
                                position={[localizacao.latitude, localizacao.longitude]}
                                icon={customNeonMarker}
                            >
                                <Popup className={styles.customPopup}>
                                    <div className={styles.popupCard}>
                                        <div className={styles.popupHeader}>
                                            <span className={styles.popupBadge}>Estação</span>
                                            <h3 className={styles.popupTitle}>{equipamento.nome}</h3>
                                        </div>
                                        <div className={styles.popupBody}>
                                            <div className={styles.popupInfoRow}>
                                                <span className={styles.infoLabel}>Tipo:</span>
                                                <span className={styles.infoValue}>{equipamento.tipo}</span>
                                            </div>

                                        </div>
                                        <div className={styles.popupActions}>
                                            <button
                                                type="button"
                                                className={styles.popupBtnPrimary}
                                                onClick={() => setEquipamentoAberto(equipamento)}
                                            >
                                                Visualizar Dashboard &rarr;
                                            </button>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        )
                    })}
                </MapContainer>

                {/* Status e Alertas */}
                <div className={styles.weatherWidget}>
                    <span className={styles.weatherIcon}>🌤️</span>
                    <span>Acesso Público</span>
                </div>

                {carregando && <div className={styles.loadingOverlay}>Conectando ao servidor e carregando estações...</div>}
                {erro && <div className={styles.errorOverlay}>{erro}</div>}
            </div>

            {/* Modal / Overlay do Dashboard Público */}
            {equipamentoAberto && (
                <div className={styles.dashboardOverlay}>
                    <div className={styles.dashboardContainer}>
                        <DashboardPublico 
                            equipamento={equipamentoAberto} 
                            onFechar={() => setEquipamentoAberto(null)} 
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export default MapaPublico