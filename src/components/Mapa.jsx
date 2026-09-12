import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents
} from 'react-leaflet'

import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import styles from './Mapa.module.css'
import { getEquipamentos, atualizarLocalizacao } from '../services/api.js'

// Ícone personalizado com efeito Neon Cyan idêntico ao da imagem
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
    setTimeout(() => {
      map.invalidateSize()
    }, 150)

    map.on('zoomend', () => {
      map.invalidateSize()
    })
  }, [map])

  return null
}

function SelecionarLocalizacao({ ativo, onSelecionar }) {
  useMapEvents({
    click: (evento) => {
      if (!ativo) return
      const { lat, lng } = evento.latlng
      onSelecionar(lat, lng)
    }
  })

  return null
}

function Mapa({ onEstacaoClick }) {
  const navigate = useNavigate()
  // Centro inicial em Pernambuco (coordenadas do print)
  const centroInicial = [-7.9771, -36.4946]

  const [equipamentos, setEquipamentos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState(null)
  const [selecionandoLocalizacao, setSelecionandoLocalizacao] = useState(false)
  const [novaLocalizacao, setNovaLocalizacao] = useState(null)
  const [salvandoLocalizacao, setSalvandoLocalizacao] = useState(false)

  useEffect(() => {
    async function carregarEquipamentos() {
      try {
        setCarregando(true)
        setErro('')
        const data = await getEquipamentos()
        setEquipamentos(data)
      } catch (error) {
        console.error('Erro ao carregar equipamentos:', error)
        setErro('Não foi possível carregar os equipamentos.')
      } finally {
        setCarregando(false)
      }
    }

    carregarEquipamentos()
  }, [])

  // Função para abrir o dashboard de forma garantida
  const handleAbrirDashboard = (equipamento) => {
    if (typeof onEstacaoClick === 'function') {
      onEstacaoClick(equipamento)
    } else {
      // Caso a prop não tenha sido passada pelo componente pai, redireciona por rota
      navigate(`/dashboard/${equipamento.identificador}`, { state: { equipamento } })
    }
  }

  return (
    <div className={styles.pageContainer}>
      {/* O <Header /> foi retirado daqui pois seu App/Layout pai já renderiza um */}

      {/* Caixa do Mapa com borda neon */}
      <div className={styles.mapFrame}>
        <MapContainer
          center={centroInicial}
          zoom={12}
          zoomControl={true}
          style={{ height: '100%', width: '100%' }}
        >
          <CorrigirMapa />

          <SelecionarLocalizacao
            ativo={selecionandoLocalizacao}
            onSelecionar={(lat, lng) => {
              setNovaLocalizacao({ lat, lng })
              setSelecionandoLocalizacao(false)
            }}
          />

          {/* Camada Satélite (Esri World Imagery) */}
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="&copy; Esri, Maxar, Earthstar Geographics"
            maxZoom={18}
          />

          {/* Camadas de Nomes e Rodovias */}
          <TileLayer
            url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
          />
          <TileLayer
            url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          />

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
                      <h3 className={styles.popupTitle}>{equipamento.nome || 'Estação sem nome'}</h3>
                    </div>

                    <div className={styles.popupBody}>
                      <div className={styles.popupInfoRow}>
                        <span className={styles.infoLabel}>Tipo:</span>
                        <span className={styles.infoValue}>{equipamento.tipo || 'N/A'}</span>
                      </div>
                      <div className={styles.popupInfoRow}>
                        <span className={styles.infoLabel}>ID:</span>
                        <span className={styles.infoValue}>{equipamento.identificador}</span>
                      </div>
                      {localizacao.latitude && (
                        <div className={styles.popupInfoRow}>
                          <span className={styles.infoLabel}>Coordenadas:</span>
                          <span className={styles.infoValue}>
                            {Number(localizacao.latitude).toFixed(4)}, {Number(localizacao.longitude).toFixed(4)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className={styles.popupActions}>
                      <button
                        type="button"
                        className={styles.popupBtnSecondary}
                        onClick={() => {
                          setEquipamentoSelecionado(equipamento)
                          setNovaLocalizacao(null)
                          setSelecionandoLocalizacao(true)
                        }}
                      >
                        Alterar localização
                      </button>

                      <button
                        type="button"
                        className={styles.popupBtnPrimary}
                        onClick={() => handleAbrirDashboard(equipamento)}
                      >
                        Abrir dashboard &rarr;
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}

          {novaLocalizacao && (
            <Marker
              position={[novaLocalizacao.lat, novaLocalizacao.lng]}
              icon={customNeonMarker}
            >
              <Popup className={styles.customPopup}>
                <div className={styles.popupCard}>
                  <div className={styles.popupHeader}>
                    <span className={styles.popupBadge}>Confirmação</span>
                    <h3 className={styles.popupTitle}>Nova Localização</h3>
                  </div>

                  <div className={styles.popupBody}>
                    <div className={styles.popupInfoRow}>
                      <span className={styles.infoLabel}>Latitude:</span>
                      <span className={styles.infoValue}>{novaLocalizacao.lat.toFixed(6)}</span>
                    </div>
                    <div className={styles.popupInfoRow}>
                      <span className={styles.infoLabel}>Longitude:</span>
                      <span className={styles.infoValue}>{novaLocalizacao.lng.toFixed(6)}</span>
                    </div>
                  </div>

                  <div className={styles.popupActions}>
                    <button
                      type="button"
                      className={styles.popupBtnPrimary}
                      onClick={async () => {
                        if (!equipamentoSelecionado) return
                        try {
                          setSalvandoLocalizacao(true)
                          await atualizarLocalizacao(
                            equipamentoSelecionado.identificador,
                            novaLocalizacao.lat,
                            novaLocalizacao.lng
                          )
                          setEquipamentos((equipamentosAtuais) =>
                            equipamentosAtuais.map((equipamento) => {
                              if (equipamento.identificador !== equipamentoSelecionado.identificador) {
                                return equipamento
                              }
                              return {
                                ...equipamento,
                                localizacaoAtual: {
                                  ...equipamento.localizacaoAtual,
                                  latitude: novaLocalizacao.lat,
                                  longitude: novaLocalizacao.lng
                                }
                              }
                            })
                          )
                          setEquipamentoSelecionado(null)
                          setNovaLocalizacao(null)
                        } catch (error) {
                          console.error('Erro ao atualizar localização:', error)
                          setErro(error.message || 'Não foi possível atualizar a localização.')
                        } finally {
                          setSalvandoLocalizacao(false)
                        }
                      }}
                      disabled={salvandoLocalizacao}
                    >
                      {salvandoLocalizacao ? 'Salvando...' : 'Confirmar nova localização'}
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Widget Clima (29°) */}
        <div className={styles.weatherWidget}>
          <span className={styles.weatherIcon}>🌤️</span>
          <span>29°</span>
        </div>

        {carregando && (
          <div className={styles.loadingOverlay}>
            Carregando equipamentos...
          </div>
        )}

        {erro && (
          <div className={styles.errorOverlay}>
            {erro}
          </div>
        )}
      </div>
    </div>
  )
}

export default Mapa