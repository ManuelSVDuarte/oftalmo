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

  // Atualiza o contador de questões
  elementos.contador.innerText = `Questão ${atual} de ${total}`;

  // Garante que a galeria limpa as fotos anteriores e desenha a nova
  elementos.galeria.innerHTML = "";
  if (questao.fotos && questao.fotos.length > 0) {
    questao.fotos.forEach(fotoSrc => {
      const img = document.createElement("img");
      img.src = fotoSrc;
      img.alt = `Imagem da questão ${questao.id}`;
      elementos.galeria.appendChild(img);
    });
  }

  // Limpa os campos de texto
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

  // Controla a desativação dos botões de navegação nos extremos
  elementos.btnVoltar.disabled = (gerenciador.indiceAtual === 0);
  elementos.btnProxima.disabled = (gerenciador.indiceAtual === total - 1);
}

function exibirFeedback(nota, feedback) {
  elementos.notaIa.innerText = nota;
  // Substitui quebras de linha por <br> para o texto do gabarito ficar legível
  elementos.textoFeedback.innerHTML = feedback.replace(/\n/g, '<br>');
  elementos.areaFeedback.classList.remove('oculto');
  elementos.btnAvaliar.innerText = "Reavaliar"; 
}

// Evento de clique para avaliar a resposta com base nas palavras-chave
elementos.btnAvaliar.addEventListener('click', () => {
  const achados = elementos.inputAchados.value;
  const diagnostico = elementos.inputDiagnostico.value;

  if (!achados && !diagnostico) {
    alert("Por favor, preencha os achados ou o diagnóstico antes de avaliar.");
    return;
  }

  elementos.btnAvaliar.disabled = true;
  elementos.btnAvaliar.innerText = "Verificando...";

  const resultado = gerenciador.avaliarResposta(achados, diagnostico);
  
  exibirFeedback(resultado.nota, resultado.feedback);
  elementos.btnAvaliar.disabled = false;
});

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
