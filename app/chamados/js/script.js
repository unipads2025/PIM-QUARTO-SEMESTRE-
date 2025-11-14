// ===== VERIFICA USUÁRIO LOGADO =====
const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
if (!usuarioLogado) {
  alert("Faça login para abrir um chamado!");
  window.location.href = "../login/index.html";
}

// ===== REGRAS DE PRIORIDADE E TÉCNICO =====
const regras = {
  sistema: { prioridade: "Alta", tecnico: "Pedro" },
  infra: { prioridade: "Média", tecnico: "Yasmin" },
  impressora: { prioridade: "Média", tecnico: "Yasmin" },
  suporte: { prioridade: "Baixa", tecnico: "Pedro" },
  outros: { prioridade: "Baixa", tecnico: "Pedro" }
};

document.getElementById("categoria").addEventListener("change", (e) => {
  const valor = e.target.value;
  const prioridade = document.getElementById("prioridade");
  const tecnico = document.getElementById("tecnico");

  if (regras[valor]) {
    prioridade.textContent = regras[valor].prioridade;
    tecnico.textContent = regras[valor].tecnico;
  } else {
    prioridade.textContent = "-";
    tecnico.textContent = "-";
  }
});

// ===== SALVAR CHAMADO NO LOCALSTORAGE =====
document.getElementById("chamadoForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const categoria = document.getElementById("categoria").value;
  const descricao = document.getElementById("descricao").value;
  const prioridade = document.getElementById("prioridade").textContent;
  const tecnico = document.getElementById("tecnico").textContent;
  const arquivoInput = document.getElementById("anexo");
  const msg = document.getElementById("msg");

  // Lê arquivo em Base64
  const lerArquivo = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject("Erro ao ler arquivo");
      reader.readAsDataURL(file);
    });
  };

  const salvarChamado = async () => {
    let anexoBase64 = null;
    if (arquivoInput.files.length > 0) {
      anexoBase64 = await lerArquivo(arquivoInput.files[0]);
    }

    const chamadosClientes = JSON.parse(localStorage.getItem("chamadosClientes")) || [];
    const novoChamado = {
      id: Date.now(),
      usuario: usuarioLogado.nome,
      email: usuarioLogado.email,
      categoria,
      descricao,
      prioridade,
      tecnico,
      status: "Aberto",
      data: new Date().toLocaleString(),
      anexo: anexoBase64
    };

    chamadosClientes.push(novoChamado);
    localStorage.setItem("chamadosClientes", JSON.stringify(chamadosClientes));

    msg.style.color = "green";
    msg.textContent = "Chamado enviado com sucesso!";
    e.target.reset();
    document.getElementById("prioridade").textContent = "-";
    document.getElementById("tecnico").textContent = "-";
  };

  salvarChamado();
});

// ===== NAVEGAÇÃO =====
document.getElementById("meusChamados").addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = "./meus-chamados.html";
});
