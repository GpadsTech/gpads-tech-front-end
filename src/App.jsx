import styles from './App.module.css'
import Header from './components/Header.jsx'
import Mapa from './components/Mapa.jsx'
import Dashboard from './components/Dashboard.jsx'
import Login from './components/Login.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Historico from './components/Historico.jsx'
import CadastroEquipamento from "./components/CadastroEquipamento"
import CadastroUsuario from "./components/CadastroUsuario"

import MapaPublico from './components/MapaPublico.jsx'

import {
    BrowserRouter,
    Routes,
    Route,
    Outlet
} from 'react-router-dom'

import { useState } from 'react'
import { AuthProvider } from './AuthContext.jsx'


function PaginaPrincipal() {
    const [equipamentoSelecionado, setEquipamentoSelecionado] = useState(null)

    return (
        <div>
            <div className={styles.container}>

                <div className={styles.mapa}>
                    <Mapa
                        onEstacaoClick={setEquipamentoSelecionado}
                    />
                </div>

                {equipamentoSelecionado && (
                    <div className={styles.dashboard}>
                        <Dashboard
                            equipamento={equipamentoSelecionado}
                            onFechar={() => {
                                setEquipamentoSelecionado(null)
                            }}
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

            <AuthProvider>

                <Routes>

                    {/* Página pública */}

                    <Route
                        path="/login"
                        element={<Login />}
                    />


                    <Route
                        path="/estacoes"
                        element={<MapaPublico />}
                    />

                    {/* Páginas protegidas */}

                    <Route element={<ProtectedRoute />}>

                        <Route element={<LayoutProtegido />}>

                            <Route
                                path="/"
                                element={<PaginaPrincipal />}
                            />

                            <Route
                                path="/historico/:identifier"
                                element={<Historico />}
                            />

                            <Route
                                path="/cadastrar-equipamento"
                                element={<CadastroEquipamento />}
                            />

                            <Route
                                path="/admin/usuarios"
                                element={<CadastroUsuario />}
                            />

                        </Route>

                    </Route>

                </Routes>

            </AuthProvider>

        </BrowserRouter>

    )
}

export default App