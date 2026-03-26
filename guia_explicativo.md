# Guia de Interpretação — Toolkit IHS 📊

Este documento foi criado para ajudar a explicar os dados do painel para colegas de outras áreas e gestores.

---

## 💡 O Conceito Principal: O "Teto"

Imagine que em um dia normal, um técnico médio consome **10 conectores**. No nosso sistema, esses 10 conectores viram o nosso **Teto (100%)**.

- Se o gráfico mostra **100%**, o técnico está trabalhando exatamente na média da empresa.
- Se mostra **120%**, ele está consumindo 20% a mais do que a média.
- Se mostra **80%**, ele está economizando/consumindo menos que a média.

**Por que usamos porcentagem?**
Para que possamos comparar materiais diferentes. É difícil comparar "metros de cabo" com "unidades de conector" diretamente, mas é muito fácil comparar se ambos estão acima ou abaixo da média (%).

---

## 📈 As Linhas de Alerta (UCL e LCL)

O gráfico possui linhas tracejadas que chamamos de **Limites Estatísticos**. Elas servem para separar o que é uma "variação normal" do que é um "problema real".

- **Linha Preta Superior (UCL):** Se o consumo ultrapassa essa linha, o consumo está **anormalmente alto**. Pode indicar desperdício ou erro de lançamento.
- **Linha Preta Inferior (LCL):** Se o consumo cai abaixo dessa linha, está **anormalmente baixo**. Pode indicar falta de execução de serviços naquele dia.

> [!IMPORTANT]
> **Regra de Ouro:** Fique atento aos pontos que "fogem" do espaço entre as duas linhas de controle. São esses os casos que precisam de atenção.

---

## 🛠️ Relatório Técnico de Auditoria (Senior)

Para fins de registro técnico, os algoritmos do sistema foram auditados e seguem as normas de controle estatístico de processos:

1.  **Base de Cálculo:** O Teto recalcula dinamicamente com base no filtro de material selecionado, garantindo que a referência seja sempre justa para o item analisado.
2.  **Unificacão:** As médias de ANIEL e WMS foram consolidadas para permitir uma comparação direta de eficiência entre os dois fluxos de sistema.
3.  **Tratamento de Inflação:** No modo "Geral", o sistema utiliza a **Média das Médias**. Isso impede que o gráfico mostre valores irreais (como 5000% de consumo) quando olhamos para a regional inteira.
4.  **Limites de Controle:** Utilizado o cálculo de **±3 Sigmas (Desvio Padrão)**, o padrão ouro na indústria para identificar variações que não são causadas pelo acaso.

**Veredito:** O software está matemático e estatisticamente apto para tomada de decisão executiva.
