import { dadosSimulado } from './bancoDeDados.js';

export class GerenciadorSimulado {
  constructor() {
    this.questoes = dadosSimulado;
    this.indiceAtual = 0;
    this.respostasUsuario = {}; 
  }

  obterQuestaoAtual() {
    return this.questoes[this.indiceAtual];
  }

  avancarQuestao() {
    if (this.indiceAtual < this.questoes.length - 1) {
      this.indiceAtual++;
      return true;
    }
    return false;
  }

  voltarQuestao() {
    if (this.indiceAtual > 0) {
      this.indiceAtual--;
      return true;
    }
    return false;
  }

  pularQuestao() {
    const questaoAtual = this.obterQuestaoAtual();
    this.respostasUsuario[questaoAtual.id] = {
      achados: "",
      diagnostico: "",
      nota: 0,
      feedback: "Questão pulada."
    };
    this.avancarQuestao();
  }

  obterRespostaSalva() {
    const idQuestaoAtual = this.obterQuestaoAtual().id;
    return this.respostasUsuario[idQuestaoAtual] || null;
  }

  // Recebe a chave digitada como parâmetro
  async avaliarComIA(achadosUsuario, diagnosticoUsuario, apiKey) {
    const questao = this.obterQuestaoAtual();
    
    this.respostasUsuario[questao.id] = {
      achados: achadosUsuario,
      diagnostico: diagnosticoUsuario,
      nota: null,
      feedback: "Avaliando com IA..."
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const promptParaIA = `
      Você é um professor de oftalmologia. Avalie a resposta do aluno comparando-a com o gabarito.
      Dê uma nota de 0 a 10 considerando a precisão dos achados e o acerto do diagnóstico.
      
      GABARITO ESPERADO:
      - Achados: ${questao.achados}
      - Diagnóstico: ${questao.diagnostico}
      
      RESPOSTA DO ALUNO:
      - Achados: ${achadosUsuario}
      - Diagnóstico: ${diagnosticoUsuario}
      
      Gere um feedback curto (máximo 3 linhas) justificando a nota.
      Devolva a resposta ESTRITAMENTE em JSON com a estrutura: {"nota": numero, "feedback": "texto"}
    `;

    try {
      const payload = {
        contents: [{ parts: [{ text: promptParaIA }] }],
        generationConfig: { responseMimeType: "application/json" }
      };

      const respostaAPI = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!respostaAPI.ok) {
        const erroDetalhado = await respostaAPI.text();
        console.error("Erro retornado pelo Google:", erroDetalhado);
        throw new Error("Falha na API: " + respostaAPI.status);
      }

      const dadosBrutos = await respostaAPI.json();
      const textoDaIA = dadosBrutos.candidates[0].content.parts[0].text;
      const resultadoJSON = JSON.parse(textoDaIA);

      this.respostasUsuario[questao.id].nota = resultadoJSON.nota;
      this.respostasUsuario[questao.id].feedback = resultadoJSON.feedback;

      return this.respostasUsuario[questao.id];

    } catch (erro) {
      console.error("Erro ao consultar o Gemini:", erro);
      this.respostasUsuario[questao.id].nota = 0;
      this.respostasUsuario[questao.id].feedback = "Erro de conexão. Verifique se a Chave da API inserida no topo da página está correta e válida.";
      return this.respostasUsuario[questao.id];
    }
  }
}
