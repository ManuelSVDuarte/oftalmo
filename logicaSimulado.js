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

  // Verificação por palavras-chave (Sem IA / Offline)
  async avaliarResposta(achadosUsuario, diagnosticoUsuario) {
    const questao = this.obterQuestaoAtual();
    
    const respAchados = (achadosUsuario || "").toLowerCase();
    const respDiag = (diagnosticoUsuario || "").toLowerCase();

    // 1. Validação de Diagnóstico (Vale até 5 pontos)
    let acertosDiag = 0;
    const totalDiag = questao.palavrasChaveDiagnostico.length;
    
    questao.palavrasChaveDiagnostico.forEach(termo => {
      if (respDiag.includes(termo.toLowerCase())) {
        acertosDiag++;
      }
    });
    const notaDiag = totalDiag > 0 ? (acertosDiag / totalDiag) * 5 : 5;

    // 2. Validação de Achados (Vale até 5 pontos)
    let acertosAchados = 0;
    const totalAchados = questao.palavrasChaveAchados.length;
    
    questao.palavrasChaveAchados.forEach(termo => {
      if (respAchados.includes(termo.toLowerCase())) {
        acertosAchados++;
      }
    });
    const notaAchados = totalAchados > 0 ? (acertosAchados / totalAchados) * 5 : 5;

    // Nota final de 0 a 10 (arredondada)
    let notaFinal = Math.round(notaDiag + notaAchados);
    if (notaFinal > 10) notaFinal = 10;

    // 3. Monta um feedback educativo inteligente
    let feedbackMsg = "";
    if (notaFinal >= 9) {
      feedbackMsg = "Excelente! Sua resposta cobriu os principais achados e o diagnóstico correto.";
    } else if (notaFinal >= 6) {
      feedbackMsg = `Bom trabalho! Você acertou partes importantes, mas faltaram alguns termos-chave.\n\n📖 Gabarito Oficial:\n- Achados: ${questao.achados}\n- Diagnóstico: ${questao.diagnostico}`;
    } else {
      feedbackMsg = `Sua resposta ficou distante do esperado para este caso.\n\n📖 Gabarito Oficial:\n- Achados: ${questao.achados}\n- Diagnóstico: ${questao.diagnostico}`;
    }

    // Salva o resultado
    this.respostasUsuario[questao.id] = {
      achados: achadosUsuario,
      diagnostico: diagnosticoUsuario,
      nota: notaFinal,
      feedback: feedbackMsg
    };

    return this.respostasUsuario[questao.id];
  }
}
