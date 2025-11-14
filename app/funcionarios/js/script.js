// ===== VERIFICA USUÁRIO LOGADO =====
const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
if (!usuarioLogado || usuarioLogado.tipo !== "funcionario") {
  alert("Acesso não autorizado! Faça login novamente.");
  window.location.href = "../../login/index.html";
}

// ===== BOTÃO SAIR =====
function sair() {
  localStorage.removeItem("usuarioLogado");
  sessionStorage.removeItem("tipoUsuario");
  window.location.href = "/app/login/index.html";
}

// ===== OBTÉM OS CHAMADOS DO LOCALSTORAGE =====
const chamadosClientes = JSON.parse(localStorage.getItem("chamadosClientes")) || [];

// Aqui filtramos apenas os chamados com técnico definido (visão do funcionário)
const chamados = chamadosClientes.filter(c => c.tecnico);

// ===== POPULA LISTA DE CHAMADOS =====
const lista = document.getElementById("listaChamados");

if (chamados.length === 0) {
  lista.innerHTML = "<p style='text-align:center;'>Nenhum chamado atribuído a você ainda.</p>";
} else {
  chamados.forEach(chamado => {
    const div = document.createElement("div");
    div.classList.add("chamado");

    // Classes de cor conforme o status
    if (chamado.status === "Aberto") div.classList.add("status-aberto");
    else if (chamado.status === "Em andamento") div.classList.add("status-emandamento");
    else if (chamado.status === "Encerrado") div.classList.add("status-encerrado");

    div.innerHTML = `
      <span>${chamado.categoria}</span>
      <span>${chamado.tecnico || "Sem técnico"}</span>
      <span>${chamado.prioridade.charAt(0).toUpperCase() + chamado.prioridade.slice(1)}</span>
    `;

    div.addEventListener("click", () => abrirChamado(chamado));
    lista.appendChild(div);
  });
}

// ===== FUNÇÃO PARA ABRIR CHAMADO =====
function abrirChamado(chamado) {
  localStorage.setItem("chamadoSelecionado", JSON.stringify(chamado));
  window.location.href = "/app/chamados/responder/index.html";
}

// ===== GERA GRÁFICO DE STATUS =====
const ctx = document.getElementById("graficoChamados");
const qtEncerrados = chamados.filter(c => c.status === "Encerrado").length;
const qtAndamento = chamados.filter(c => c.status === "Em andamento").length;
const qtAbertos = chamados.filter(c => c.status === "Aberto").length;

new Chart(ctx, {
  type: "doughnut",
  data: {
    labels: ["Encerrados", "Em andamento", "Abertos"],
    datasets: [{
      data: [qtEncerrados, qtAndamento, qtAbertos],
      backgroundColor: ["#4caf50", "#ffc107", "#ff5252"]
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { position: "bottom" } }
  }
});

// ===== GERA ESTATÍSTICAS POR TÉCNICO =====
const statsTecnico = {};
chamados.forEach(c => {
  const tecnico = c.tecnico || "Não atribuído";
  if (!statsTecnico[tecnico]) statsTecnico[tecnico] = { Encerrado: 0, "Em andamento": 0, Aberto: 0 };
  statsTecnico[tecnico][c.status]++;
});

let htmlStats = "<ul>";
for (let tecnico in statsTecnico) {
  htmlStats += `
    <li>
      <strong>${tecnico}:</strong>
      Encerrados: ${statsTecnico[tecnico]["Encerrado"]},
      Em andamento: ${statsTecnico[tecnico]["Em andamento"]},
      Abertos: ${statsTecnico[tecnico]["Aberto"]}
    </li>
  `;
}
htmlStats += "</ul>";

document.getElementById("estatisticasConteudo").innerHTML = htmlStats;
