import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "./firebase"

const AuthContext = createContext(null)

const API_URL = "https://gpads-api-dados.onrender.com"

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null)
    const [dadosUsuario, setDadosUsuario] = useState(null)
    const [carregando, setCarregando] = useState(true)

    useEffect(() => {

        const unsubscribe = onAuthStateChanged(
            auth,
            async (usuarioAtual) => {

                setUser(usuarioAtual)

                if (!usuarioAtual) {

                    setDadosUsuario(null)
                    setCarregando(false)

                    return
                }

                try {

                    const token = await usuarioAtual.getIdToken()

                    const response = await fetch(
                        `${API_URL}/api/auth/me/`,
                        {
                            method: "GET",
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        }
                    )

                    const data = await response.json()

                    if (!response.ok) {

                        throw new Error(
                            data.message ||
                            "Não foi possível carregar os dados do usuário."
                        )

                    }

                    setDadosUsuario(data.usuario)

                } catch (error) {

                    console.error(
                        "Erro ao carregar dados do usuário:",
                        error
                    )

                    setDadosUsuario(null)

                } finally {

                    setCarregando(false)

                }

            }
        )

        return unsubscribe

    }, [])

    return (
        <AuthContext.Provider
            value={{
                user,
                dadosUsuario,
                carregando
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {

    return useContext(AuthContext)

}
