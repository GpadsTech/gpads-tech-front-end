# MoRHInGA — interface web

Aplicação React/Vite para acompanhar estações e boias, visualizar medições e histórico, administrar equipamentos e consultar o assistente Gemini. Firebase Authentication faz o login; a API Django valida o token e as permissões.

## Executar localmente

Requer Node.js 22.12 ou superior (ambiente verificado: Node.js 24) e npm.

```powershell
npm ci
Copy-Item .env.example .env
npm run dev -- --host 127.0.0.1
```

Abra a URL exibida pelo Vite. Inicie também o back-end em http://127.0.0.1:8000. `VITE_API_URL` define a base comum de todas as chamadas HTTP; o padrão é essa URL local. Reinicie Vite quando alterar o .env. Para outro ambiente, configure a URL antes do build.

O projeto Firebase está configurado em `src/firebase.js`. Entre com um usuário existente e cadastrado na API. A credencial privada Firebase Admin e a chave Gemini pertencem exclusivamente ao back-end. Nunca defina GEMINI_API_KEY como variável VITE.

## Assistente e erros

O chat envia `pergunta` com token Firebase para `/api/equipamentos/{id}/chatbot/` e apresenta `resposta`. Durante o envio, novas submissões são ignoradas. O servidor aplica 5 tentativas por usuário por dia, somando todos os equipamentos; erros de cota aparecem no chat. Recarregar a página não restaura a cota. As respostas atuais são apresentadas como texto.

Os dados de `getReportData` ainda são demonstrativos; não representam medições reais. Histórico, exportações e telemetria usam os endpoints Django. A existência de telas não garante dados disponíveis: depende de login, permissão, equipamentos e leituras no Firebase.

## Verificação

```powershell
npm run build
npm run lint
```

Os serviços HTTP ficam em `src/services`; telas e componentes ficam em `src/components`. Instruções históricas foram preservadas em `docs/README-anterior.md`.

Destino da publicação: GpadsTech/gpads-tech-front-end, branch feature/thiagBranch.

## Arquitetura e manutenção

- `services/httpTransport.js`: transporte HTTP com dependências injetáveis, sem Firebase ou React; serializa JSON e normaliza erros.
- `services/httpClient.js`: monta o transporte com URL configurada e token Firebase.
- `services/api.js`, `telemetryService.js`, `userService.js`: contratos de equipamentos, telemetria e perfil.
- `services/chatServices.js`: contrato do assistente; mantém reexports compatíveis para relatórios e downloads.
- `services/exportService.js`: download de CSV/PDF; `demoReportService.js`: dados demonstrativos isolados.
- `hooks/useChat.js`: estado, envio e exclusão de submissões simultâneas do chat.
- `components`: renderização e interação; estilos CSS e estrutura visual preservados nesta refatoração.

A separação aplica responsabilidade única e permite substituir transporte e envio do chat sem modificar os componentes. Evita classes ou interfaces artificiais em JavaScript. As telas recebem os mesmos campos e os serviços mantêm as assinaturas existentes.

`npm test` executa testes do transporte com fetch e tokens simulados: autenticação, requisições públicas, serialização e HTTP 429. Não usa Gemini nem altera dados Firebase. `npm run build` verifica o empacotamento; `npm run lint` verifica qualidade estática.

## Deploy

O passo a passo com branch, comandos e variáveis está em [DEPLOY.md](DEPLOY.md).
