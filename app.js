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

  elementos.contador.innerText = `Questão ${atual} de ${total}`;
  elementos.galeria.innerHTML = "";
  
  questao.fotos.forEach(fotoSrc => {
    const img = document.createElement("img");
    img.src = fotoSrc;
    img.alt = `Imagem do caso ${questao.id}`; 
    elementos.galeria.appendChild(img);
  });

  elementos.inputAchados.value = "";
  elementos.inputDiagnostico.value = "";
  elementos.areaFeedback.classList.add('oculto');
  elementos.btnAvaliar.disabled = false;
  elementos.btnAvaliar.innerText = "Avaliar com IA";

  const respostaSalva = gerenciador.obterRespostaSalva();
  if (respostaSalva) {
    elementos.inputAchados.value = respostaSalva.achados;
    elementos.inputDiagnostico.value = respostaSalva.diagnostico;
    
    if (respostaSalva.nota !== null) {
      exibirFeedback(respostaSalva.nota, respostaSalva.feedback);
    }
  }

  elementos.btnVoltar.disabled = (gerenciador.indiceAtual === 0);
  elementos.btnProxima.disabled = (gerenciador.indiceAtual === total - 1);
}

function exibirFeedback(nota, feedback) {
  elementos.notaIa.innerText = nota;
  elementos.textoFeedback.innerText = feedback;
  elementos.areaFeedback.classList.remove('oculto');
  elementos.btnAvaliar.innerText = "Reavaliar"; 
}

elementos.btnAvaliar.addEventListener('click', async () => {
  // Pega o valor direto do elemento na tela com segurança
  const inputChaveEl = document.getElementById('input-chave');
  const apiKey = inputChaveEl ? inputChaveEl.value.trim() : "";
  
  const achados = elementos.inputAchados.value;
  const diagnostico = elementos.inputDiagnostico.value;

  if (!apiKey) {
    alert("Por favor, insira a sua Chave da API do Gemini no campo superior antes de avaliar.");
    if (inputChaveEl) inputChaveEl.focus();
    return;
  }

  if (!achados && !diagnostico) {
    alert("Por favor, preencha os achados ou o diagnóstico antes de avaliar.");
    return;
  }

  elementos.btnAvaliar.disabled = true;
  elementos.btnAvaliar.innerText = "A IA está corrigindo...";
  
  const resultado = await gerenciador.avaliarComIA(achados, diagnostico, apiKey);
  
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

renderizarTela();
