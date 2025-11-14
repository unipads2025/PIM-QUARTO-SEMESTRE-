let tipoAcesso = null;

// ESCOLHA DE TIPO DE ACESSO (CLIENTE / FUNCIONÁRIO)
function escolherTipo(tipo) {
  tipoAcesso = tipo; // "cliente" ou "funcionario"

  document.querySelector(".user-type").classList.add("hidden");
  document.getElementById("form-container").classList.remove("hidden");

  document.getElementById("msg").textContent =
    tipo === "cliente"
      ? "Login - Área do Cliente"
      : "Login - Funcionário";
}

// ======================================================
// ABRIR / FECHAR CADASTRO
// ======================================================
function abrirCadastro() {
  document.getElementById("form-container").classList.add("hidden");
  document.getElementById("cadastro-container").classList.remove("hidden");
  document.getElementById("msg").textContent = "Crie sua conta:";
}

function voltarLogin() {
  document.getElementById("cadastro-container").classList.add("hidden");
  document.getElementById("form-container").classList.remove("hidden");
  document.getElementById("msg").textContent = "Digite seu usuário e senha para entrar.";
}

// ======================================================
// CRIAR USUÁRIO (BANCO DE DADOS)
// ======================================================
async function criarUsuario() {
  const email = document.getElementById("novoEmail").value.trim();
  const senha = document.getElementById("novaSenha").value.trim();

  if (!email || !senha) {
    alert("Preencha todos os campos!");
    return;
  }

  try {
    const response = await fetch("http://127.0.0.1:3000/api/cadastrar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha, tipo: tipoAcesso })
    });

    const data = await response.json();

    if (response.ok) {
      alert("Usuário cadastrado com sucesso!");
      voltarLogin();
    } else {
      alert(data.error || "Erro ao cadastrar.");
    }
  } catch (err) {
    alert("Erro ao conectar ao servidor.");
    console.error(err);
  }
}

// ======================================================
// LOGIN (BANCO DE DADOS)
// ======================================================
async function fazerLogin() {
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  if (!email || !senha) {
    alert("Preencha todos os campos!");
    return;
  }

  try {
    const response = await fetch("http://127.0.0.1:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha, tipo: tipoAcesso })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || "Erro ao fazer login.");
      return;
    }

    // Salva os dados essenciais no navegador
    localStorage.setItem("usuarioLogado", JSON.stringify(data));

    alert(`Bem-vindo, ${email.split("@")[0]}!`);

    if (data.tipo === "cliente") {
      window.location.href = "/app/chamados/index.html";
    } else if (data.tipo === "funcionario") {
      window.location.href = "/app/funcionarios/index.html";
    }

  } catch (err) {
    alert("Erro ao conectar ao servidor.");
    console.error(err);
  }
}
