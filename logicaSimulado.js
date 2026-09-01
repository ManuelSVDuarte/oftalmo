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

  async avaliarComIA(achadosUsuario, diagnosticoUsuario) {
    const questao = this.obterQuestaoAtual();
    
    this.respostasUsuario[questao.id] = {
      achados: achadosUsuario,
      diagnostico: diagnosticoUsuario,
      nota: null,
      feedback: "Avaliando..."
    };

    // Sua chave correta
    const API_KEY = "AQ.Ab8RN6I1ezujmj-Z2v0YYx5hV2SYbkponG_2x4Dl3Z3IFDTxAA"; 
    
    // URL exata do seu Início Rápido
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`;

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
        headers: { 
          'Content-Type': 'application/json',
          'x-goog-api-key': API_KEY // A chave agora vai no cabeçalho, igual ao seu cURL
        },
        body: JSON.stringify(payload)
      });

      // Adicionei isso para conseguirmos ver o erro real caso falhe
      if (!respostaAPI.ok) {
        const erroDetalhado = await respostaAPI.text();
        console.error("Erro detalhado retornado pelo Google:", erroDetalhado);
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
      this.respostasUsuario[questao.id].feedback = "Erro de conexão com a IA. Pressione F12 e veja a aba 'Console' para descobrir o motivo exato do bloqueio.";
      return this.respostasUsuario[questao.id];
    }
  }

    } catch (erro) {
      console.error("Erro ao consultar o Gemini:", erro);
      this.respostasUsuario[questao.id].nota = 0;
      this.respostasUsuario[questao.id].feedback = "Erro de conexão com a IA ou limite de acessos da turma atingido. Aguarde 10 segundos e tente reavaliar.";
      return this.respostasUsuario[questao.id];
    }
  }
}
