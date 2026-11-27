import { useState, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import styles from './App.module.css'
import Header from './components/Header.jsx'
import Mapa from './components/Mapa.jsx'
import Dashboard from './components/Dashboard.jsx'
import Login from './components/Login.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import MapaPublico from './components/MapaPublico.jsx'
import { FluxoAnaliseProvider } from './contexts/FluxoAnaliseContext'
import { AuthProvider } from './AuthContext.jsx'

const Historico = lazy(() => import('./components/Historico.jsx'))
const CadastroEquipamento = lazy(() => import('./components/CadastroEquipamento'))
const CadastroUsuario = lazy(() => import('./components/CadastroUsuario'))

function FallbackPagina({ texto = 'Carregando...' }) {
    return (
        <div style={{ padding: '2rem', color: '#fff', textAlign: 'center' }}>
            {texto}
        </div>
    )
}

function PaginaPrincipal() {
    const [equipamentoSelecionado, setEquipamentoSelecionado] = useState(null)

    return (
        <div>
            <div className={styles.container}>
                <div className={styles.mapa}>
                    <Mapa onEstacaoClick={setEquipamentoSelecionado} />
                </div>

                {equipamentoSelecionado && (
                    <div className={styles.dashboard}>
                        <Dashboard
                            key={equipamentoSelecionado.identificador}
                            equipamento={equipamentoSelecionado}
                            onFechar={() => setEquipamentoSelecionado(null)}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

function LayoutProtegido() {
    return (
        <>
            <Header />
            <Outlet />
        </>
    )
}

function App() {
    return (
        <BrowserRouter>
            <FluxoAnaliseProvider>
                <AuthProvider>
                    <Routes>
                        {/* Páginas públicas */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/estacoes" element={<MapaPublico />} />

                        {/* Páginas protegidas */}
                        <Route element={<ProtectedRoute />}>
                            <Route element={<LayoutProtegido />}>
                                <Route path="/" element={<PaginaPrincipal />} />

                                <Route
                                    path="/historico/:identifier"
                                    element={
                                        <Suspense fallback={<FallbackPagina texto="Carregando histórico..." />}>
                                            <Historico />
                                        </Suspense>
                                    }
                                />

                                <Route
                                    path="/cadastrar-equipamento"
                                    element={
                                        <Suspense fallback={<FallbackPagina texto="Carregando cadastro..." />}>
                                            <CadastroEquipamento />
                                        </Suspense>
                                    }
                                />

                                <Route
                                    path="/admin/usuarios"
                                    element={
                                        <Suspense fallback={<FallbackPagina texto="Carregando usuários..." />}>
                                            <CadastroUsuario />
                                        </Suspense>
                                    }
                                />
                            </Route>
                        </Route>
                    </Routes>
                </AuthProvider>
            </FluxoAnaliseProvider>
        </BrowserRouter>
    )
}

export default App