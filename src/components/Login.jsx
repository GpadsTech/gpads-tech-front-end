import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { login } from "../auth.js"
import styles from "./Login.module.css"

import logoImg from "../assets/logo.png"

function Login() {
    const navigate = useNavigate()
    const location = useLocation()

    const [email, setEmail] = useState("")
    const [senha, setSenha] = useState("")
    const [mostrarSenha, setMostrarSenha] = useState(false)

    const [erro, setErro] = useState("")
    const [carregando, setCarregando] = useState(false)

    const handleLogin = async (e) => {
        e.preventDefault()
        setErro("")
        setCarregando(true)

        try {
            await login(email, senha)

            const destino = location.state?.from
            if (destino) {
                navigate(
                    `${destino.pathname}${destino.search}${destino.hash}`,
                    { replace: true }
                )
            } else {
                navigate("/", { replace: true })
            }
        } catch (error) {
            console.error("Erro ao realizar login:", error)

            switch (error.code) {
                case "auth/invalid-credential":
                    setErro("E-mail ou senha incorretos.")
                    break
                case "auth/user-not-found":
                    setErro("Usuário não encontrado.")
                    break
                case "auth/wrong-password":
                    setErro("Senha incorreta.")
                    break
                case "auth/invalid-email":
                    setErro("Digite um e-mail válido.")
                    break
                case "auth/too-many-requests":
                    setErro("Muitas tentativas. Aguarde alguns minutos e tente novamente.")
                    break
                default:
                    setErro("Não foi possível realizar o login.")
            }
        } finally {
            setCarregando(false)
        }
    }

    return (
        <div className={styles.container}>
            {/* Linhas curvas decorativas com brilho neon do fundo */}
            <svg className={styles.ambientLines} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" preserveAspectRatio="none">
                <path
                    d="M-50,180 C400,90 280,380 -80,500"
                    fill="none"
                    stroke="rgba(0, 215, 240, 0.45)"
                    strokeWidth="2.5"
                    filter="drop-shadow(0 0 10px rgba(0, 220, 240, 0.6))"
                />
                <path
                    d="M850,1100 C1250,920 1600,820 2000,420"
                    fill="none"
                    stroke="rgba(0, 215, 240, 0.45)"
                    strokeWidth="2.5"
                    filter="drop-shadow(0 0 10px rgba(0, 220, 240, 0.6))"
                />
            </svg>

            {/* Seção da Marca / Logo */}
            <div className={styles.brandSection}>
                <div className={styles.logoWrapper}>
                    <img 
                        src={logoImg} 
                        alt="Logo Gpads Tech" 
                        className={styles.logoImage} 
                    />
                </div>

                <div className={styles.brandName}>
                    <span>Gpads</span>
                    <strong>Tech</strong>
                </div>

                <div className={styles.brandTagline}>
                    solutions
                </div>
            </div>

            {/* Card de Login */}
            <div className={styles.loginCard}>
                <h1 className={styles.titulo}>Login</h1>
                <p className={styles.subtitulo}>Acesse sua conta para continuar</p>

                <form onSubmit={handleLogin} className={styles.formulario}>
                    {/* Campo E-mail */}
                    <div className={styles.campo}>
                        <label htmlFor="email">E-mail</label>
                        <div className={styles.inputWrapper}>
                            <span className={styles.inputIcon}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect width="20" height="16" x="2" y="4" rx="2" />
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                </svg>
                            </span>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Digite seu e-mail"
                                required
                            />
                        </div>
                    </div>

                    {/* Campo Senha */}
                    <div className={styles.campo}>
                        <label htmlFor="senha">Senha</label>
                        <div className={styles.inputWrapper}>
                            <span className={styles.inputIcon}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </span>
                            <input
                                id="senha"
                                type={mostrarSenha ? "text" : "password"}
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                placeholder="Digite sua senha"
                                required
                            />
                            <button
                                type="button"
                                className={styles.toggleSenhaBtn}
                                onClick={() => setMostrarSenha(!mostrarSenha)}
                                title={mostrarSenha ? "Ocultar senha" : "Ver senha"}
                            >
                                {mostrarSenha ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="m9.88 9.88 a3 3 0 1 0 4.24 4.24" />
                                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                                        <line x1="2" x2="22" y1="2" y2="22" />
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {erro && <p className={styles.erro}>{erro}</p>}

                    {/* Botão Entrar */}
                    <button
                        type="submit"
                        className={styles.botao}
                        disabled={carregando}
                    >
                        {carregando ? (
                            "Entrando..."
                        ) : (
                            <>
                                <span>Entrar</span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14" />
                                    <path d="m12 5 7 7-7 7" />
                                </svg>
                            </>
                        )}
                    </button>
                </form>

                {/* Linha divisora "ou" */}
                <div className={styles.divisor}>
                    <span>ou</span>
                </div>

                {/* Link inferior para o Mapa Público */}
                <div className={styles.linkEstacoesContainer}>
                    <button
                        type="button"
                        onClick={() => navigate("/estacoes")}
                        className={styles.linkEstacoes}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>Veja as estações disponíveis aqui</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Login