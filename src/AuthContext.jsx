import { getCurrentUserProfile } from "./services/userService.js"
import { useEffect, useState } from "react"
import { AuthContext } from "./contexts/authContext.js"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "./firebase"



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

                    const profile = await getCurrentUserProfile(token)

                    setDadosUsuario(profile)

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
