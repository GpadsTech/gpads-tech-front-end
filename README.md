# 📊 Dashboard Morhinga

Dashboard web desenvolvido para visualização e análise de dados de sensores (temperatura, umidade e pH), com filtros por período e gráficos interativos.

---

## 🚀 Tecnologias utilizadas

- ⚛️ React
- ⚡ Vite
- 🔥 Firebase (Firestore)
- 📈 Recharts
- 🎨 CSS Modules

---

## 📌 Funcionalidades

- 📅 Filtro por data (início e fim)
- 🌡️ Visualização de temperatura
- 💧 Visualização de umidade
- 🧪 Visualização de pH
- 📊 Gráficos dinâmicos
- 🔄 Integração com banco de dados em tempo real (Firebase)
- 🗺️ Navegação entre páginas (React Router)

---

## 📷 Preview / Demo

Acesse a aplicação rodando no Vercel:

[🌐 Abrir Dashboard Morhinga](https://dashboard-morhinga.vercel.app)

> <img width="1895" height="938" alt="image" src="https://github.com/user-attachments/assets/f982582d-3c44-46e7-8941-7346821c07a7" />
> <img width="1889" height="938" alt="image" src="https://github.com/user-attachments/assets/b4acf2e1-68e5-47c9-9bad-28bdb1790b39" />
> <img width="1909" height="938" alt="image" src="https://github.com/user-attachments/assets/27e78092-b878-4c9c-8747-c0826dcd88ce" />

---

## 🛠️ Como rodar o projeto

### 1. Clone o repositório

```bash
git clone https://github.com/GpadsTech/DashboardMorhinga.git
```
### 2. Acesse a pasta do projeto

```bash
cd DashboardMorhinga
```
### 3. Instale as dependências
```bash
npm install
```
### 4. Execute o projeto
```bash
npm run dev
```
---
## 🔥 Configuração do Firebase
### Crie o arquivo:
```bash
src/firebase.js
```
### E adicione sua configuração
```bash
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_DOMINIO",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_BUCKET",
  messagingSenderId: "SEU_ID",
  appId: "SEU_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```
---
## 📂 Estrutura do projeto
```bash
src/
 ├── components/
 ├── pages/
 │    └── Historico.jsx
 ├── firebase.js
 ├── App.jsx
 └── main.jsx
```
---
## 📊 Dados utilizados

- 📁 sensor_dados
  - Temperatura
  - Umidade
  - Hora

- 📁 ph_dados
  - pH
  - Hora

 ---

 ## 🎯 Objetivo
 Este projeto tem como objetivo fornecer uma interface simples e eficiente para monitoramento e análise de dados ambientais coletados por sensores.

 ---
 ## 🚧 Melhorias futuras
 - 📱 Responsividade completa
 - 🌙 Dark mode
 - 📊 Novos tipos de gráficos
 - 🔍 Filtros avançados
 - 📡 Atualização em tempo real (onSnapshot)
 - 📈 Dashboard mais detalhado

 ---
 ## 👨‍💻 Autor
 Desenvolvido por **GpadsTech**
 ---
 ## 📄 Licença
 ### Este projeto está sob a licença MIT:
 ```bash
MIT License

Copyright (c) 2026 GpadsTech

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
