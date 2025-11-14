import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import mysql from "mysql2/promise";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// DB
const db = await mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// CADASTRAR USUÁRIO
app.post("/api/cadastrar", async (req, res) => {
  try {
    const { email, senha, tipo } = req.body;

    if (!email || !senha || !tipo) {
      return res.status(400).json({ error: "Campos obrigatórios faltando." });
    }

    const [existe] = await db.query("SELECT id FROM usuarios WHERE email = ?", [email]);
    if (existe.length > 0) {
      return res.status(400).json({ error: "Usuário já cadastrado!" });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    await db.query(
      "INSERT INTO usuarios (email, senha, tipo) VALUES (?, ?, ?)",
      [email, senhaHash, tipo]
    );

    res.json({ message: "Usuário cadastrado com sucesso!" });
  } catch (err) {
    console.error("Erro no cadastro:", err);
    res.status(500).json({ error: "Erro no servidor." });
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  try {
    const { email, senha, tipo } = req.body;

    const [result] = await db.query(
      "SELECT * FROM usuarios WHERE email = ? AND tipo = ?",
      [email, tipo]
    );

    if (result.length === 0) {
      return res.status(400).json({ error: "Usuário não encontrado." });
    }

    const user = result[0];
    const match = await bcrypt.compare(senha, user.senha);

    if (!match) return res.status(401).json({ error: "Senha incorreta." });

    res.json({
      id: user.id,
      email: user.email,
      tipo: user.tipo
    });

  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ error: "Erro no servidor." });
  }
});


// CLIENTE ENVIA CHAMADO PARA OS FUNCIONÁRIOS
// (clicou "Não resolvido")

app.post("/api/enviar-para-funcionario", async (req, res) => {
  try {
    const { chamadoId } = req.body;

    await db.query(
      "UPDATE chamados SET status='aguardando-atendimento' WHERE id=?",
      [chamadoId]
    );

    res.json({ message: "Chamado enviado para os técnicos!" });

  } catch (err) {
    console.error("Erro:", err);
    res.status(500).json({ error: "Erro ao enviar chamado." });
  }
});

app.post("/api/responder"), async (req, res) => {
  try {
    const { mensagem } = req.body;

    if(!mensagem) {
      return res.status(400).json({ error: "Mensagem obrigatória."});
    }
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "Você é um assistente técnico educado e direto." },
        { role: "user", content: mensagem }
      ]
    });

    const resposta = completion.choices[0].message.content;

    res.json({ resposta });

  } catch (err) {
    console.error("Erro IA:", err);
    res.status(500).json({ error: "Erro ao gerar resposta com IA." });
  }
}

// =====================================================
// FUNCIONÁRIO RESPONDE AO CHAMADO
// =====================================================
app.post("/api/responder-chamado", async (req, res) => {
  try {
    const { chamadoId, tecnico, resposta } = req.body;

    await db.query(
      "UPDATE chamados SET resposta=?, tecnico=?, status='respondido' WHERE id=?",
      [resposta, tecnico, chamadoId]
    );

    res.json({ message: "Resposta enviada ao cliente!" });

  } catch (err) {
    console.error("Erro:", err);
    res.status(500).json({ error: "Erro ao responder." });
  }
});

// =====================================================
// LISTAR CHAMADOS PARA FUNCIONÁRIOS
// =====================================================
app.get("/api/chamados/pendentes", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM chamados WHERE status='aguardando-atendimento'"
    );
    res.json(rows);

  } catch (err) {
    console.error("Erro:", err);
    res.status(500).json({ error: "Erro ao carregar chamados." });
  }
});

// =====================================================
// LISTAR CHAMADOS DO CLIENTE
// =====================================================
app.get("/api/chamados/cliente/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const [rows] = await db.query(
      "SELECT * FROM chamados WHERE email=?",
      [email]
    );

    res.json(rows);

  } catch (err) {
    console.error("Erro:", err);
    res.status(500).json({ error: "Erro ao carregar chamados do cliente." });
  }
});

app.listen(3000, () => {
  console.log("Servidor rodando: http://localhost:3000");
});
