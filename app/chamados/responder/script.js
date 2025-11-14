const chamado = JSON.parse(localStorage.getItem("chamadoSelecionado"));
const tecnico = chamado.tecnico || "Técnico não definido";

document.getElementById("usuarioChamado").textContent = chamado.email || "Usuário não informado";
document.getElementById("descricaoChamado").textContent =
  `Chamado de ${chamado.email || "usuário desconhecido"} com prioridade ${chamado.prioridade}.`;
document.getElementById("nomeTecnico").textContent = tecnico;

if (!chamado) {
  alert("Nenhum chamado selecionado. Você será redirecionado à tela de chamados.");
  window.location.href = "../index.html";
} else {
  document.getElementById("assuntoChamado").textContent = chamado.categoria;
  document.getElementById("usuarioChamado").textContent = chamado.responsavel;
  document.getElementById("textoChamado").textContent = chamado.descricao || "Chamado sem descrição detalhada.";
  document.getElementById("descricaoChamado").textContent =
    `Chamado de ${chamado.tecnico} com prioridade ${chamado.prioridade}.`;
}

async function responderChamado() {
  const resposta = document.getElementById("respostaTexto").value.trim();

  if (!resposta) {
    alert("Preencha a resposta antes de enviar.");
    return;
  }

  const status = document.getElementById("statusSelect").value;
  const tecnicoSelecionado = document.getElementById("tecnicoSelect").value;

  const chamadoAtualizado = {
    ...chamado,
    resposta,
    tecnico: tecnicoSelecionado || chamado.tecnico,
    status: status,
  };

  // Atualizar o status do chamado
  const chamadosClientes = JSON.parse(localStorage.getItem("chamadosClientes")) || [];
  const indexChamado = chamadosClientes.findIndex(c => c.id === chamado.id);

  if (indexChamado !== -1) {
    chamadosClientes[indexChamado] = chamadoAtualizado;
    localStorage.setItem("chamadosClientes", JSON.stringify(chamadosClientes));
  }

  // Exibe a resposta do técnico no painel
  document.getElementById("respostaAdm").innerHTML = `
    <div class='resposta-adm'>
      <strong>Técnico (${chamadoAtualizado.tecnico}):</strong>
      <p>${resposta}</p>
    </div>
  `;

  alert("Resposta enviada com sucesso!");

  // Atualiza a tela de chamados
  window.location.href = "../meus-chamados.html";
}
