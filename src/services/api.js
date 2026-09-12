import { getIdToken } from "../auth.js"

const API_URL = "https://gpads-api-dados.onrender.com"

export async function getEquipamentos() {
    const token = await getIdToken()

    const response = await fetch(
        `${API_URL}/api/equipamentos/`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    )

    const data = await response.json()

    if (!response.ok) {
        throw new Error(data.message || "Não foi possível carregar os equipamentos.")
    }

    return data.equipamentos
}

export async function cadastrarEquipamento(nome, identificador, latitude, longitude) {
    const token = await getIdToken()

    const response = await fetch(
        `${API_URL}/api/equipamentos/cadastrar/`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                nome,
                identificador: Number(identificador),
                latitude: Number(latitude),
                longitude: Number(longitude)
            })
        }
    )
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || "Não foi possível cadastrar o equipamento.")
    return data
}

export async function pesquisarLocalizacao(query) {
    const token = await getIdToken()

    const response = await fetch(
        `${API_URL}/api/localizacao/pesquisar/?q=${encodeURIComponent(query)}`,
        {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` }
        }
    )
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || "Não foi possível pesquisar a localização.")
    return data.resultados
}

export async function atualizarLocalizacao(identificador, latitude, longitude) {
    const token = await getIdToken()

    const response = await fetch(
        `${API_URL}/api/equipamentos/${identificador}/localizacao/`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ latitude: Number(latitude), longitude: Number(longitude) })
        }
    )
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || "Não foi possível atualizar a localização.")
    return data
}

export async function cadastrarUsuario(nome, email, senha) {
    const token = await getIdToken()

    const response = await fetch(
        `${API_URL}/api/usuarios/`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ nome, email, senha })
        }
    )
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || "Não foi possível cadastrar o usuário.")
    return data
}

// ==========================================
// FUNÇÕES PÚBLICAS (Sem Token)
// ==========================================

export async function getEquipamentosPublicos() {
    const response = await fetch(
        `${API_URL}/api/equipamentos/publicos/`,
        {
            method: "GET"
            // Sem header de Authorization
        }
    )

    const data = await response.json()

    if (!response.ok) {
        throw new Error(
            data.message ||
            "Não foi possível carregar as estações públicas."
        )
    }

    return data.equipamentos
}