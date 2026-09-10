import { GerenciadorSimulado } from './logicaSimulado.js';

const gerenciador = new GerenciadorSimulado();

const elementos = {
  contador: document.getElementById('contador-questoes'),
  galeria: document.getElementById('galeria-fotos'),
  inputAchados: document.getElementById('achados'),
  inputDiagnostico: document.getElementById('diagnostico'),
  btnAvaliar: document.getElementById('btn-avaliar'),
  areaFeedback: document.getElementById('area-feedback'),
  notaIa: document.getElementById('nota-ia'),
  textoFeedback: document.getElementById('texto-feedback'),
  btnVoltar: document.getElementById('btn-voltar'),
  btnPular: document.getElementById('btn-pular'),
  btnProxima: document.getElementById('btn-proxima')
};

function renderizarTela() {
  const questao = gerenciador.obterQuestaoAtual();
  const total = gerenciador.questoes.length;
  const atual = gerenciador.indiceAtual + 1;

  // Atualiza o contador de questões no topo
  elementos.contador.innerText = `Questão ${atual} de ${total}`;

  // Limpa a galeria de fotos e desenha as imagens da questão atual
  elementos.galeria.innerHTML = "";
  if (questao.fotos && questao.fotos.length > 0) {
    questao.fotos.forEach(fotoSrc => {
      const img = document.createElement("img");
      img.src = fotoSrc;
      img.alt = `Imagem da questão ${questao.id}`;
      
      // Se a imagem falhar ao carregar, exibe um aviso claro na tela
      img.onerror = () => {
        img.style.display = "none";
        const aviso = document.createElement("div");
        aviso.style.color = "#ff6b6b";
        aviso.style.padding = "20px";
        aviso.style.textAlign = "center";
        aviso.innerText = `⚠️ Imagem não encontrada: "${fotoSrc}". Verifique o nome do arquivo na pasta img.`;
        elementos.galeria.appendChild(aviso);
      };

      elementos.galeria.appendChild(img);
    });
  }

  // Reseta os campos de entrada e oculta o feedback
  elementos.inputAchados.value = "";
  elementos.inputDiagnostico.value = "";
  elementos.areaFeedback.classList.add('oculto');
  elementos.btnAvaliar.disabled = false;
  elementos.btnAvaliar.innerText = "Avaliar Resposta";

  // Se já houver resposta salva para esta questão, restaura na tela
  const respostaSalva = gerenciador.obterRespostaSalva();
  if (respostaSalva) {
    elementos.inputAchados.value = respostaSalva.achados;
    elementos.inputDiagnostico.value = respostaSalva.diagnostico;
    
    if (respostaSalva.nota !== null && respostaSalva.nota !== undefined) {
      exibirFeedback(respostaSalva.nota, respostaSalva.feedback);
    }
  }

  // Controla a desativação dos botões de navegação (primeira e última questão)
  elementos.btnVoltar.disabled = (gerenciador.indiceAtual === 0);
  elementos.btnProxima.disabled = (gerenciador.indiceAtual === total - 1);
}

function exibirFeedback(nota, feedback) {
  elementos.notaIa.innerText = nota;
  // Converte as quebras de linha (\n) do texto para a tag <br> do HTML
  elementos.textoFeedback.innerHTML = feedback.replace(/\n/g, '<br>');
  elementos.areaFeedback.classList.remove('oculto');
  elementos.btnAvaliar.innerText = "Reavaliar"; 
}

// Evento do botão de avaliar (agora de forma local e síncrona)
elementos.btnAvaliar.addEventListener('click', () => {
  const achados = elementos.inputAchados.value.trim();
  const diagnostico = elementos.inputDiagnostico.value.trim();

  if (!achados && !diagnostico) {
    alert("Por favor, preencha os achados ou o diagnóstico antes de avaliar.");
    return;
  }

  elementos.btnAvaliar.disabled = true;
  elementos.btnAvaliar.innerText = "Verificando...";

  // Realiza a avaliação instantânea baseada nas palavras-chave do bancoDeDados.js
  const resultado = gerenciador.avaliarResposta(achados, diagnostico);
  
  // Exibe o resultado na tela
  exibirFeedback(resultado.nota, resultado.feedback);
  elementos.btnAvaliar.disabled = false;
});

// Eventos de Navegação
elementos.btnProxima.addEventListener('click', () => {
  if (gerenciador.avancarQuestao()) renderizarTela();
});

elementos.btnVoltar.addEventListener('click', () => {
  if (gerenciador.voltarQuestao()) renderizarTela();
});

elementos.btnPular.addEventListener('click', () => {
  gerenciador.pularQuestao(); 
  renderizarTela();
});

// Inicializa a primeira tela ao carregar a página
renderizarTela();
