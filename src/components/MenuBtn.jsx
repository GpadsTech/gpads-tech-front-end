import styles from './MenuBtn.module.css';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';

function MenuBtn() {
    const [menuAberto, setMenuAberto] = useState(false);
    const fecharMenu = () => {
        setMenuAberto(false);
    };
    const navigate = useNavigate();
    return (
        <>
            <button
                type="button"
                className={styles.botaoMenu}
                onClick={() => setMenuAberto(true)}
                aria-expanded={menuAberto}
                aria-controls="menu-lateral"
            >
            ☰ Menu
            </button>

            {createPortal(
                <>
                {/* Fundo escurecido */}
                {menuAberto && (
                    <div
                        className={styles.fundo}
                        onClick={fecharMenu}
                        aria-hidden="true"
                    />
                )}

                {/* Menu lateral */}
                <aside
                    id="menu-lateral"
                    className={`${styles.sidebar} ${
                        menuAberto ? styles.aberto : ''
                    }`}
                    aria-hidden={!menuAberto}
                    inert={!menuAberto}
                >
                    <button
                        type="button"
                        className={styles.botaoFechar}
                        onClick={fecharMenu}
                        aria-label="Fechar menu"
                        tabIndex={menuAberto ? 0 : -1}
                    >
                    ×
                    </button>

                    <h2>Navegação</h2>

                    <nav aria-label="Navegação principal">
                        <button
                            className={`${styles.navBtn} ${location.pathname === '/' ? styles.activeBtn : ''}`}
                            onClick={() => navigate('/')}
                            tabIndex={menuAberto ? 0 : -1}
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
                            tabIndex={menuAberto ? 0 : -1}
                        >
                            <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="20" height="14" x="2" y="3" rx="2" />
                                <line x1="8" y1="21" x2="16" y2="21" />
                                <line x1="12" y1="17" x2="12" y2="21" />
                            </svg>
                            <span>Cadastrar equipamento</span>
                        </button>

                        
                        <button
                            className={`${styles.navBtn} ${location.pathname === '/admin/usuarios' ? styles.activeBtn : ''}`}
                            onClick={() => navigate('/admin/usuarios')}
                            tabIndex={menuAberto ? 0 : -1}
                        >
                            <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            <span>Cadastrar usuário</span>
                        </button>

                    </nav>
                </aside>
                </>,
                document.body
            )}
        </> 
    );
}

export default MenuBtn;