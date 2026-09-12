import { login, getIdToken } from "./auth";

let testeExecutado = false;

export async function testAuthentication() {

    if (testeExecutado) {
        console.log("Teste já executado. Ignorando segunda execução.");
        return;
    }

    testeExecutado = true;

    try {

        const user = await login(
            "nathalia.teste@email.com",
            "Teste123!"
        );

        console.log("Login realizado!");
        console.log("UID:", user.uid);
        console.log("Email:", user.email);

        const token = await getIdToken();

        console.log("ID Token obtido!");

        const response = await fetch(
            "http://127.0.0.1:8000/api/equipamentos/51001/historico/?inicio=2026-09-10&fim=2026-09-08",
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        console.log("Status HTTP:", response.status);

        const data = await response.json();

        console.log(
            "Histórico com localização:",
            JSON.stringify(data, null, 2)
        );

    } catch (error) {

        console.error(
            "Erro no teste:",
            error
        );
    }
}

export async function testNovaLocalizacao() {
    try {
        console.log("Iniciando teste de nova localização...");

        const token = await getIdToken();

        console.log("Token obtido!");

        const resposta = await fetch(
            "http://127.0.0.1:8000/api/equipamentos/51001/localizacoes/",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    latitude: -8.0476,
                    longitude: -34.8770,
                }),
            }
        );

        const data = await resposta.json();

        console.log("Resposta da nova localização:", data);

    } catch (error) {
        console.error("Erro no teste de nova localização:", error);
    }
}