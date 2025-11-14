README

Este é o repositório do Projeto Integrador de Sistemas desenvolvido para o quarto semestre do
curso de Tecnologia em Análise e Desenvolvimento de Sistemas.
Descrição
-----------
O projeto Synapse Medical tem como objetivo fornecer uma plataforma de gerenciamento de
chamados técnicos em uma clínica de saúde. O sistema permite que os clientes registrem
problemas, enquanto os técnicos podem responder, acompanhar o status dos chamados e fornecer
suporte técnico por meio de uma interface interativa com IA.
Funcionalidades:
- Cadastro de usuários (clientes e funcionários)
- Login de usuários (clientes e funcionários)
- Abertura e visualização de chamados
- Respostas automáticas geradas pela IA para problemas técnicos
- Funcionalidade de feedback dos clientes sobre a resolução dos problemas
- Alteração de status dos chamados (Aberto, Em andamento, Concluído)
Tecnologias Utilizadas
------------------------
- Backend:
 - Node.js
 - Express.js
 - MySQL
 - OpenAI GPT-4 (IA)
- Frontend:
 - HTML, CSS, JavaScript
- Banco de Dados:
 - MySQL
Instalação e Execução
----------------------
Pré-requisitos
---------------
Certifique-se de ter o seguinte instalado na sua máquina:
- Node.js (v14.x ou superior) - Download Node.js
- MySQL - Download MySQL
- Git - Download Git
Passo a Passo
--------------
1. Clone o Repositório:
 Primeiro, clone o repositório em sua máquina local:
 bash
 git clone https://github.com/unipads2025/PIM-QUARTO-SEMESTRE-.git
 cd PIM-QUARTO-SEMESTRE-
 
2. Instalar Dependências Backend:
 Navegue até a pasta onde o arquivo package.json está localizado e execute o seguinte
comando para instalar as dependências do backend:
 bash
 npm install
 
3. Configurar o Banco de Dados:
 No MySQL, crie um banco de dados para o projeto:
 sql
 CREATE DATABASE meu_projeto;
 
 Em seguida, crie as tabelas conforme necessário. Você pode importar o arquivo de estrutura
SQL, caso tenha um, ou rodar as queries que estão no backend para criar as tabelas.

TABELAS NECESSÁRIAS:

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de chamados
CREATE TABLE IF NOT EXISTS chamados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT NOT NULL,
    status ENUM('aberto', 'em_andamento', 'concluido') DEFAULT 'aberto',
    usuario_id INT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

4. Configurar as Variáveis de Ambiente:
 Crie um arquivo .env na raiz do projeto com as variáveis de ambiente necessárias:
 env
 DB_HOST=localhost
 DB_USER=root
 DB_PASS=senha_do_mysql
 DB_NAME=meu_projeto
 OPENAI_API_KEY=sua_chave_da_api_openai
 
 - *DB_HOST*: localhost
 - *DB_USER*: root
 - *DB_PASS*: Senha do usuário do MySQL. (coloque a que voce criou)
 - *DB_NAME*: meu_projeto
 - *OPENAI_API_KEY*: Sua chave de API do OpenAI (para interação com a IA).

5. Rodar o Servidor:
 Após a instalação das dependências e configuração do banco de dados, inicie o servidor com o
comando:
 bash
 npm start
 
 Isso iniciará o backend do projeto. A aplicação estará disponível no endereço
http://localhost:3000.

6. Acessar a Aplicação:
Alternativamente, se estiver utilizando um servidor local (como o http-server), você pode rodar o
comando para servir os arquivos:
 bash
 http-server -o app/login/index.html
 
 O frontend estará disponível no endereço http://localhost:8080 (caso esteja utilizando o
http-server).
7. Testar a Aplicação:
 - Crie uma conta como *cliente* ou *funcionário*.
 - Realize login com a conta criada.
 - Registre um chamado técnico e veja o processo de interação com a IA para a solução do
problema.
Estrutura do Projeto
--------------------
A estrutura do projeto é organizada da seguinte forma:
PIM-QUARTO-SEMESTRE-/
app/ # Frontend
 assets/ # Imagens, logos, etc.
 chamados/ # Arquivos relacionados ao gerenciamento de chamados
 funcionarios/ # Arquivos relacionados aos funcionários
 login/ # Tela de login e cadastro
 index.html # Página inicial
 style.css # Estilos CSS
server.js # Backend: código principal para a API e lógica de servidor
package.json # Dependências do Node.js
.env # Variáveis de ambiente (não versionado)
.gitignore # Arquivos e pastas a serem ignorados pelo Git
README.md #

Como Contribuir
----------------
Se você quiser contribuir para o projeto, siga os passos abaixo:
1. Faça um *fork* do repositório.
2. Crie uma nova branch a partir de main:
 bash
 git checkout -b nome-da-sua-branch
 
3. Faça suas modificações e commit:
 bash
 git commit -m "Descrição das mudanças"
 
4. Envie suas alterações para o repositório remoto:
 bash
 git push origin nome-da-sua-branch
 
5. Abra um *pull request* no GitHub para revisar e mesclar suas mudanças.
Licença
--------
