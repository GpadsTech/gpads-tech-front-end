import { signInWithEmailAndPassword, signOut, signInAnonymously } from "firebase/auth"
import { auth } from "./firebase"

// Login padrão com e-mail e senha (Área Admin)
export async function login(email, password) {
    const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
    )
    return userCredential.user
}

// NOVO: Login Anônimo para a Área Pública
export async function loginAnonimo() {
    const userCredential = await signInAnonymously(auth)
    return userCredential.user
}

// Pega o token, seja de um usuário logado ou de um usuário anônimo
export async function getIdToken() {
    const user = auth.currentUser

    if (!user) {
        throw new Error("Nenhum usuário está autenticado.")
    }

    const token = await user.getIdToken()
    return token
}

export async function logout() {
    await signOut(auth)
}