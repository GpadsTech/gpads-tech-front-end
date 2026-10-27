import styles from './NavLink.module.css'

function NavLink() {
    const [menuAberto, setMenuAberto] = useState(false);
    const fecharMenu = () => {
        setMenuAberto(false);
    };

    return (
        <div>
            {/* Botão que abre o menu */}
            <button
                type="button"
                className={styles.botaoMenu}
                onClick={() => setMenuAberto(true)}
                aria-expanded={menuAberto}
                aria-controls="menu-lateral"
            >
                ☰ Menu
            </button>

            {/* Fundo escurecido */}
            {menuAberto && (
                <div
                    className={styles.fundo}
                    onClick={fecharMenu}
                />
            )}

            {/* Menu lateral */}
            <aside
                id="menu-lateral"
                className={`${styles.sidebar} ${
                    menuAberto ? styles.aberto : ''
                }`}
                aria-hidden={!menuAberto}
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
                    <a href="/" tabIndex={menuAberto ? 0 : -1}>
                        Início
                    </a>
                    <a href="/perfil" tabIndex={menuAberto ? 0 : -1}>
                        Perfil
                    </a>
                    <a href="/configuracoes" tabIndex={menuAberto ? 0 : -1}>
                        Configurações
                    </a>
                </nav>
            </aside>
        </div>
    );
}

export default NavLink;