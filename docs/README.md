# 🎮 Documentação backend do jogo da forca

# 🚀 Visão Geral

Este repositório contém a implementação do **backend do jogo da forca**. O objetivo deste projeto é fornecer a lógica de jogo, interações com o banco de dados e a API para que o frontend possa interagir com o backend.

# 🔌 Tecnologias Utilizadas

- **Node.js**: Utilizado para executar o JavaScript no backend.
- **Express**: Framework para criação de APIs de forma rápida e eficiente.
- **Dotenv**:  Gerenciamento de váriaveis de ambiente.
- **CORS**: Permite requisições entre diferentes origens.
- **Nodemon**: Reinicia automaticamente o servidor durante o desenvolvimento.

## 📂 Estrutura do projeto

   📦 forca.client.back
  - |- 📂 docs
      - |- 📜 README.md # Documentação do projeto
  - |- 📂 .github
      - |- 📜 PULL_REQUEST_TEMPLATE.md # Padronizar as descrições dos Pull Requests(PRs)
  - |- 📂 src
  - |- 📂 controllers # Lógica das funcionalidade
  - |- 📂 models # Modelo de dados
  - |- 📂 services # Regras de negócios
  - |- 📜 .env.examples # Exemplo de váriaveis de ambiente
  - |- 📜 server.js # Arquivo principal
  - |- 📜 package.json # Dependências e scripts


## 🛠️ Configuração inicial

# 1️⃣ Clonar o repositório:

      git clone https://github.com/Cacatuas-Aquaticas/forca.client.api.git
      cd forca.client.api

# 2️⃣ Instale as dependências:

      npm install

# 3️⃣ Rode o projeto:

     node server.js ou npx nodemon server.js

O projeto estará disponível em `http://localhost:3000` 

## 📄 Contribuindo

- **1**: Faça um fork do repositório
- **2**: Crie uma branch com sua feature: `git checkout -b id-da-task`
- **3**: Faça commit seguindo o padrão: `git commit -m "feat: descrição breve da alteração`
- **4**: Envie as mudanças: `git push origin id-da-task`
- **5**: Abra um Pull Request.








