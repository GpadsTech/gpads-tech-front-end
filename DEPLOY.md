# Deploy do front-end na Vercel

Branch: `feature/thiagBranch`. Publique primeiro o back-end no Render e tenha sua URL HTTPS disponível.

1. Acesse Vercel → Add New → Project e importe `GpadsTech/gpads-tech-front-end`.
2. Framework Preset: Vite. Root Directory: raiz do repositório.
3. Configure Install Command `npm ci`, Build Command `npm run build` e Output Directory `dist`. Use Node.js 24.x.
4. Em Environment Variables, adicione `VITE_API_URL=https://SEU-BACKEND.onrender.com`, sem /api e sem barra final. Marque Production e também Preview se usar esse ambiente. Nunca informe GEMINI_API_KEY ou credenciais Firebase Admin aqui.
5. Em Settings → Environments → Production → Branch Tracking, selecione `feature/thiagBranch`. Se o primeiro deploy foi criado a partir de outra branch, faça um deploy desta branch após ajustar o tracking e as variáveis. Não publique main por engano.
6. Clique Deploy. Se o projeto já existe, ajuste a branch e faça Redeploy usando as variáveis novas. VITE_API_URL é incorporada durante o build; salvar a variável sem rebuild não atualiza o bundle.
7. Anote o domínio estável de produção, como `https://SEU-PROJETO.vercel.app`. Configure esse endereço em CORS_ALLOWED_ORIGINS no Render e faça novo deploy do back-end.
8. No Firebase Console → Authentication → Settings → Authorized domains, confira o domínio da Vercel e adicione-o para os fluxos de autenticação que exigem domínio autorizado. Mantenha o mesmo projeto Firebase usado pelo back-end.
9. Abra a aplicação, entre com um usuário existente e cadastrado na API e teste equipamentos, histórico e exportação. O front usa a configuração Firebase de `src/firebase.js`.
10. Recarregue uma rota interna: o arquivo vercel.json já contém o rewrite para /index.html, necessário para React Router.

## Verificações

No painel Network do navegador, chamadas de dados devem usar o domínio Render. Não devem apontar para localhost/127.0.0.1. Se isso acontecer, corrija VITE_API_URL no ambiente correspondente e faça Redeploy.

- 401: token ausente/inválido ou sessão expirada.
- 403: usuário sem cadastro/permissão na API.
- CORS: conferir o domínio exato no Render; URLs temporárias de Preview são origens diferentes. Autorize apenas as que pretende usar.
- Chat 429: a mensagem identifica o limite diário do usuário ou a cota do provedor.
- Chat 503: a API Gemini está indisponível ou não foi configurada no Render.

O relatório de getReportData continua demonstrativo e não deve ser interpretado como telemetria real. O layout existente foi preservado.

Fontes: [Vite na Vercel](https://vercel.com/docs/frameworks/frontend/vite), [branch de produção](https://vercel.com/docs/git) e [variáveis de ambiente](https://vercel.com/docs/environment-variables).
