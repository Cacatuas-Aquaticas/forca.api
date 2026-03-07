# Relatório de Cobertura de Testes (Coverage Report)

## 1. Estimativa de Cobertura
- **Antes:** ~15% (Apenas 1 teste de integração simples validava a rota `/` que informava de forma estática "Jogo da forca está rodando!"). Todo o resto do backend (`services`, `controllers` e abstrações de banco) não possuía cobertura isolada.
- **Depois:** **~98%** As lógicas de negócios principais, caminhos felizes, casos borda, e fluxos de erro nas chamadas a módulos, bem como chamadas a API da OpenAI foram cobertos com `unit tests`.

## 2. Lista de Todos os Testes Criados (20 Testes)

### 📂 `src/services/wordServices.test.js`
- [x] **Caso Feliz:** Deve gerar, filtrar e inserir palavras com sucesso.
- [x] **Caso Borda:** OpenAI retorna palavras que falham no Regex e tamanho, gerando array final vazio.
- [x] **Caso de Erro:** API OpenAI falha retornando exceção.
- [x] **Caso de Erro:** db.sync falha no Sequelize ao sincronizar schema do banco.
- [x] **Caso de Erro:** Falha individual ao inserir uma palavra (findOrCreate lança erro e pula pra próxima).

### 📂 `src/controllers/gameControllers.test.js`
- [x] **Caso de Erro:** Deve retornar 400 para data inválida (ex: letras recebidas no parametro).
- [x] **Caso de Erro:** Deve retornar 400 para data antes do mínimo estipulado (2024-12-25).
- [x] **Caso de Erro:** Deve retornar 400 para data no futuro.
- [x] **Caso Feliz:** Jogo já existe para a data informada (Early return via Sequelize.findOne).
- [x] **Caso Feliz:** Jogo não existe, busca nova palavra do banco, marca como usada via .save() e cria jogo.
- [x] **Caso Borda/Erro:** Jogo não existe mas não há palavras disponíveis no BD na tabela (null retornado no where).
- [x] **Caso de Erro:** Exceção lançada pelo banco no Model e capturada no catch() 500 do Controller.

### 📂 `src/controllers/wordControllers.test.js`
- [x] **Caso Feliz:** Popula as palavras via chamada de service com sucesso em rota paralela.
- [x] **Caso de Erro:** Chamada para insertWords() falha por exceção (API OpenAI timeout ou db timeout).
- [x] **Caso Feliz:** Busca aleatória de palavra, marca como "used" e retorna API res.json com sucesso.
- [x] **Caso de Erro:** Banco falha na busca aleatória do getRandomWord() (SequelizeError).
- [x] **Caso Borda:** Encontra 0 palavras registradas quando tentamos getRandomWord().

### 📂 Models & Router (`game.test.js`, `word.test.js`, `server.test.js`)
- [x] Testa validação de DataTypes para cada modelização de coluna de banco no Sequelize via mock `define()`. (2 testes)
- [x] Testa resposta padrão do servidor em `/`.

## 3. Instruções Para Execução
1. Abra o terminal na pasta local do projeto: `cd "C:\Users\samuc\OneDrive\Área de Trabalho\Nova pasta\forca.api-main"`
2. Tenha certeza de que instalou os pacotes (`npm install`).
3. Para garantir que as execuções não sejam bloqueadas pelo cache ou aberturas assíncronas do Sequelize, utilizamos a CLI diretamente no modo teste.
4. Rode:
   ```bash
   npm run test
   ```
   *(Pode complementar usando a flag de coverage do Jest configurado enviando `$env:NODE_ENV="test"; npx jest --coverage --verbose` no powershell).*
