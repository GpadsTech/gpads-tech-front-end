import styles from './Header.module.css'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'
import { logout } from '../auth.js'

// Importe a logo aqui (ajuste o caminho se necessário)
import logoImg from '../assets/logo.png'

function Header() {
    const { user, dadosUsuario } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = async () => {
        try {
            await logout()
            navigate('/login', { replace: true })
        } catch (error) {
            console.error('Erro ao sair da conta:', error)
        }
    }

    return (
        <header className={styles.header}>
            {/* Lado Esquerdo: Logo + Título Moringa */}
            <div className={styles.brand} onClick={() => navigate('/')}>
                <div className={styles.logoBox}>
                    <img src={logoImg} alt="Moringa Logo" className={styles.logoImg} />
                </div>
                <span className={styles.titulo}>GpadsTech</span>
            </div>

            {/* Centro: Navegação com Botões Estilizados */}
            {user && (
                <nav className={styles.navegacao}>
                    <button
                        className={`${styles.navBtn} ${location.pathname === '/' ? styles.activeBtn : ''}`}
                        onClick={() => navigate('/')}
                    >
                        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                            <line x1="9" y1="3" x2="9" y2="18" />
                            <line x1="15" y1="6" x2="15" y2="21" />
                        </svg>
                        <span>Mapa</span>
                    </button>

                    <button
                        className={`${styles.navBtn} ${location.pathname === '/cadastrar-equipamento' ? styles.activeBtn : ''}`}
                        onClick={() => navigate('/cadastrar-equipamento')}
                    >
                        <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="20" height="14" x="2" y="3" rx="2" />
                            <line x1="8" y1="21" x2="16" y2="21" />
                            <line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                        <span>Cadastrar equipamento</span>
                    </button>

                    {dadosUsuario?.role === 'admin' && (
                        <button
                            className={`${styles.navBtn} ${location.pathname === '/admin/usuarios' ? styles.activeBtn : ''}`}
                            onClick={() => navigate('/admin/usuarios')}
                        >
                            <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            <span>Cadastrar usuário</span>
                        </button>
                    )}
                </nav>
            )}

            {/* Lado Direito: Notificação + Dados do Usuário + Sair */}
            <div className={styles.usuario}>
                {user && (
                    <>
                        {/* Botão de Notificação com Ponto Neon */}
                        <button className={styles.notificacaoBtn} title="Notificações">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                            </svg>
                            <span className={styles.pontoAlerta}></span>
                        </button>

                        {/* Avatar e Perfil */}
                        <div className={styles.perfilWrapper}>
                            <div className={styles.avatar}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                            <div className={styles.informacoesUsuario}>
                                <div className={styles.nomeLinha}>
                                    <span className={styles.nomeUsuario}>
                                        {dadosUsuario?.nome || 'Anderson Admin'}
                                    </span>
                                    <svg className={styles.setaBaixo} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </div>
                                <span className={styles.emailUsuario}>
                                    {dadosUsuario?.email || user.email}
                                </span>
                            </div>
                        </div>

                        {/* Botão Sair */}
                        <button className={styles.botaoSair} onClick={handleLogout}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            <span>Sair</span>
                        </button>
                    </>
                )}
            </div>
        </header>
    )
}

export default Header