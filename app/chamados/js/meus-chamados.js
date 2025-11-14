// ===== VERIFICA USUÁRIO LOGADO =====
const usuarioLogadoJS = JSON.parse(localStorage.getItem("usuarioLogado"));

if (!usuarioLogadoJS) {
  alert("Faça login para acessar seus chamados!");
  window.location.href = "../login/index.html";
} else {
  document.getElementById("usuarioLogadoNome").textContent = usuarioLogadoJS.nome || usuarioLogadoJS.email || "Usuário";
}

// ===== BOTÃO DE LOGOUT =====
document.getElementById("btnLogout").addEventListener("click", () => {
  const confirmar = confirm("Deseja realmente sair?");
  if (confirmar) {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "../login/index.html";
  }
});

// Variáveis do modal / chat
let chamadoAtual = null;
const modal = document.getElementById("iaModal");
const chatBox = document.getElementById("chatIA");
const inputIA = document.getElementById("msgIA");

// ===== CARREGA CHAMADOS =====
function carregarChamados() {
  const tabela = document.getElementById("tabelaChamados").querySelector("tbody");
  tabela.innerHTML = "<tr><td colspan='9' style='text-align:center;'>Carregando chamados...</td></tr>";

  const chamadosClientes = JSON.parse(localStorage.getItem("chamadosClientes")) || [];
  const meusChamados = chamadosClientes.filter(c => c.email === usuarioLogadoJS.email);

  if (meusChamados.length === 0) {
    tabela.innerHTML = "<tr><td colspan='9' style='text-align:center;'>Nenhum chamado encontrado.</td></tr>";
    return;
  }

  tabela.innerHTML = "";
  meusChamados.forEach(c => {
    const tr = document.createElement("tr");
    const anexoHTML = c.anexo
      ? `<a href="${c.anexo}" download="anexo_${c.id}" class="download-link">Baixar/Visualizar</a>`
      : "-";

    // Ações: abrir chat (funcionário ou cliente que recebeu instrução), feedback se em andamento
    let acoes = `<div class="table-actions">`;
    acoes += `<button class="table-btn btn-open-chat" onclick="abrirIA('${c.id}')">Gerar / Abrir Chat IA</button>`;

    if (c.status === "Em andamento") {
      acoes += ` <button class="table-btn btn-resolved" onclick="resolverChamado('${c.id}')">Resolvido</button>`;
      acoes += ` <button class="table-btn btn-notresolved" onclick="naoResolvido('${c.id}')">Não Resolvido</button>`;
    }
    acoes += `</div>`;

    tr.innerHTML = `
      <td>${c.id}</td>
      <td>${c.categoria}</td>
      <td>${c.descricao}</td>
      <td>${c.prioridade}</td>
      <td>${c.tecnico || "-"}</td>
      <td><span class="status ${String(c.status).toLowerCase()}">${c.status}</span></td>
      <td>${c.data}</td>
      <td>${anexoHTML}</td>
      <td>${acoes}</td>
    `;
    tabela.appendChild(tr);
  });
}

// ===== FUNÇÕES DO CHAT / IA (MODAL) =====

// Abre o modal do chat IA para um chamado específico (recebe id string ou number)
function abrirIA(id) {
  const lista = JSON.parse(localStorage.getItem("chamadosClientes")) || [];
  const ch = lista.find(x => String(x.id) === String(id));
  if (!ch) {
    alert("Chamado não encontrado.");
    return;
  }
  chamadoAtual = ch;

  // atualiza status para Em andamento
  if (chamadoAtual.status !== "Em andamento") {
    chamadoAtual.status = "Em andamento";
    salvarChamadoAtualizado();
    carregarChamados();
  }

  // limpa chat e abre modal
  chatBox.innerHTML = "";
  appendIAMessage("Olá! Sou o assistente automático. Conte mais detalhes do problema ou pergunte o que precisar.");
  modal.classList.remove("hidden");
  inputIA.focus();
}

// Fecha o modal
function fecharIA() {
  modal.classList.add("hidden");
}

// Adiciona mensagem do usuário na tela
function appendUserMessage(text) {
  chatBox.innerHTML += `<div class="msg-user"><strong>Você:</strong> ${escapeHtml(text)}</div>`;
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Adiciona mensagem da IA na tela
function appendIAMessage(text) {
  chatBox.innerHTML += `<div class="msg-ia"><strong>IA:</strong> ${escapeHtml(text)}</div>`;
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Envia a mensagem para o backend (/api/responder) e exibe resposta
async function enviarMsgIA() {
  const texto = inputIA.value.trim();
  if (!texto) return;
  appendUserMessage(texto);
  inputIA.value = "";
  appendIAMessage("Gerando resposta ...");

  try {
    const resp = await fetch("http://127.0.0.1:3000/api/responder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problema: `${chamadoAtual.descricao}\nDetalhe do técnico/usuário: ${texto}` })
    });
    const data = await resp.json();

    // remove mensagem "Gerando..." (última mensagem IA)
    // simplificar: substitui última mensagem com a resposta real
    // para simplicidade, limpamos e re-renderizamos histórico (simples)
    // Aqui apenas soma a resposta
    if (resp.ok && data.resposta) {
      appendIAMessage(data.resposta);
    } else {
      appendIAMessage(data.error || data.resposta || "Erro ao gerar resposta.");
    }
  } catch (err) {
    console.error(err);
    appendIAMessage("Erro ao conectar com o servidor da IA.");
  }
}

// Envia a resposta final ao cliente (salva no chamado)
function enviarRespostaAoCliente() {
  // pega último bloco de IA como "solução" (procura última .msg-ia)
  const msgs = Array.from(chatBox.querySelectorAll(".msg-ia"));
  if (msgs.length === 0) {
    alert("Ainda não há resposta da IA para enviar.");
    return;
  }

  const ultimo = msgs[msgs.length - 1].innerText.replace(/^IA:/, "").trim();
  // salvar solução no chamado atual
  chamadoAtual.solucao = ultimo;
  // opcional: salvar historico de conversas
  chamadoAtual.historico = chamadoAtual.historico || [];
  chamadoAtual.historico.push({ data: new Date().toLocaleString(), texto: ultimo });

  salvarChamadoAtualizado();
  carregarChamados();
  alert("Resposta enviada ao cliente e salva no chamado.");
  // desejar manter o modal aberto para ajustes? vamos manter aberto
}

// Marca como resolvido (via modal)
function marcarComoResolvidoModal() {
  if (!chamadoAtual) return;
  chamadoAtual.status = "Encerrado";
  salvarChamadoAtualizado();
  carregarChamados();
  fecharIA();
  alert("Chamado marcado como encerrado.");
}

// Marca como não resolvido (via modal) — abre prompt para detalhar e reenvia para IA
function marcarComoNaoResolvidoModal() {
  if (!chamadoAtual) return;
  alert("Em breve, o técnico enviará instruções. Aguarde!");
}

// ===== Funções utilitárias =====
function salvarChamadoAtualizado() {
  const lista = JSON.parse(localStorage.getItem("chamadosClientes")) || [];
  const idx = lista.findIndex(c => String(c.id) === String(chamadoAtual.id));
  if (idx !== -1) {
    lista[idx] = chamadoAtual;
    localStorage.setItem("chamadosClientes", JSON.stringify(lista));
  }
}

// Cliente marca resolvido (na lista)
function resolverChamado(id) {
  const lista = JSON.parse(localStorage.getItem("chamadosClientes")) || [];
  const idx = lista.findIndex(c => String(c.id) === String(id));
  if (idx === -1) { alert("Chamado não encontrado."); return; }
  lista[idx].status = "Encerrado";
  localStorage.setItem("chamadosClientes", JSON.stringify(lista));
  alert("Obrigado! O chamado foi encerrado.");
  carregarChamados();
}

// Cliente sinaliza não resolvido (na lista)
function naoResolvido(id) {
    alert("Em breve, o técnico enviará instruções. Aguarde!");

}

// escape básico para evitar HTML injection nas mensagens (render simples)
function escapeHtml(unsafe) {
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ===== EXECUTA AO ABRIR =====
carregarChamados();
