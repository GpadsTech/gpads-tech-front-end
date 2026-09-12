import { useState } from "react"
import { useAuth } from "../AuthContext.jsx"
import { useNavigate } from "react-router-dom"
import { cadastrarUsuario } from "../services/api.js"
import styles from "./CadastroUsuario.module.css"

function CadastroUsuario() {
    const { dadosUsuario, carregando } = useAuth()
    const navigate = useNavigate()

    const [nome, setNome] = useState("")
    const [email, setEmail] = useState("")
    const [senha, setSenha] = useState("")
    const [confirmarSenha, setConfirmarSenha] = useState("")

    const [mensagem, setMensagem] = useState("")
    const [erro, setErro] = useState("")
    const [carregandoCadastro, setCarregandoCadastro] = useState(false)

    async function handleSubmit(event) {
        event.preventDefault()
        setMensagem("")
        setErro("")

        if (senha !== confirmarSenha) {
            setErro("As senhas não coincidem.")
            return
        }

        setCarregandoCadastro(true)

        try {
            await cadastrarUsuario(nome, email, senha)
            setMensagem("Usuário cadastrado com sucesso.")
            setNome("")
            setEmail("")
            setSenha("")
            setConfirmarSenha("")
        } catch (error) {
            setErro(error.message)
        } finally {
            setCarregandoCadastro(false)
        }
    }

    // Tela de Carregamento Inicial
    if (carregando) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Carregando...</p>
            </div>
        )
    }

    // Tela de Acesso Negado
    if (!dadosUsuario || dadosUsuario.role !== "admin") {
        return (
            <div className={styles.deniedContainer}>
                <div className={styles.deniedCard}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <h1>Acesso negado</h1>
                    <p>Você não possui permissão para acessar esta página.</p>
                    <button onClick={() => navigate("/")} className={styles.btnSecundario}>
                        Voltar para o Mapa
                    </button>
                </div>
            </div>
        )
    }

    // Formulário Principal
    return (
        <div className={styles.pageContainer}>
            <div className={styles.formCard}>
                
                {/* Header do Card */}
                <div className={styles.formHeader}>
                    <div className={styles.iconWrapper}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="8.5" cy="7" r="4" />
                            <line x1="20" y1="8" x2="20" y2="14" />
                            <line x1="23" y1="11" x2="17" y2="11" />
                        </svg>
                    </div>
                    <div>
                        <h1 className={styles.titulo}>Cadastrar usuário</h1>
                        <p className={styles.subtitulo}>Informe os dados para adicionar um novo administrador ou operador.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className={styles.formulario}>
                    
                    <div className={styles.campo}>
                        <label>Nome</label>
                        <input
                            type="text"
                            placeholder="Ex.: João Silva"
                            value={nome}
                            onChange={(event) => setNome(event.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.campo}>
                        <label>E-mail</label>
                        <input
                            type="email"
                            placeholder="Ex.: joao@moringa.com"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.gridDuasColunas}>
                        <div className={styles.campo}>
                            <label>Senha</label>
                            <input
                                type="password"
                                placeholder="Digite a senha"
                                value={senha}
                                onChange={(event) => setSenha(event.target.value)}
                                required
                                minLength="6"
                            />
                        </div>

                        <div className={styles.campo}>
                            <label>Confirmar senha</label>
                            <input
                                type="password"
                                placeholder="Confirme a senha"
                                value={confirmarSenha}
                                onChange={(event) => setConfirmarSenha(event.target.value)}
                                required
                                minLength="6"
                            />
                        </div>
                    </div>

                    {erro && (
                        <div className={styles.mensagemErro}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                            {erro}
                        </div>
                    )}

                    {mensagem && (
                        <div className={styles.mensagemSucesso}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                            {mensagem}
                        </div>
                    )}

                    <div className={styles.footerForm}>
                        <button
                            type="submit"
                            className={styles.btnPrimario}
                            disabled={carregandoCadastro}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                <polyline points="17 21 17 13 7 13 7 21" />
                                <polyline points="7 3 7 8 15 8" />
                            </svg>
                            {carregandoCadastro ? "Cadastrando..." : "Cadastrar usuário"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CadastroUsuario