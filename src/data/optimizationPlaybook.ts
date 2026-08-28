import { FunnelStageBenchmark } from '../types';

export const STAGE_PLAYBOOKS: FunnelStageBenchmark[] = [
  {
    id: 'investimento',
    name: 'Investimento & Distribuição',
    shortName: 'Investimento',
    metricName: 'Distribuição vs Captação',
    category: 'Investimento',
    unit: 'R$',
    goodThreshold: 0,
    warningThreshold: 0,
    isHigherBetter: true,
    nodeTitle: 'INVESTIMENTO / DISTRIBUIÇÃO',
    optimizationActions: [
      '1. Ajustar orçamento, saldo e ritmo diário.',
      '2. Realocar verba para canais e campanhas mais eficientes.',
      '3. Separar captação de distribuição para enxergar o uso da verba.'
    ]
  },
  {
    id: 'entrega',
    name: 'Entrega & Alcance',
    shortName: 'CPM / Impressões',
    metricName: 'CPM (Custo por Mil)',
    category: 'Entrega',
    unit: 'R$',
    goodThreshold: 35.00,
    warningThreshold: 55.00,
    isHigherBetter: false,
    nodeTitle: 'ENTREGA — CPM / IMPRESSÕES',
    optimizationActions: [
      '1. Ampliar ou refinar públicos conforme o custo do leilão.',
      '2. Reduzir sobreposição e frequência excessiva.',
      '3. Renovar criativos com sinais de fadiga.',
      '4. Avaliar sazonalidade e posicionamentos.'
    ]
  },
  {
    id: 'atracao',
    name: 'Atração & Criativos',
    shortName: 'CTR / CPC',
    metricName: 'CTR (Taxa de Cliques)',
    category: 'Atração',
    unit: '%',
    goodThreshold: 1.8,
    warningThreshold: 1.0,
    isHigherBetter: true,
    nodeTitle: 'ATRAÇÃO — CTR / CPC',
    optimizationActions: [
      '1. Melhorar hook, promessa, prova e CTA.',
      '2. Aproximar a mensagem do problema do público-alvo.',
      '3. Testar novos formatos, ângulos e ofertas.',
      '4. Alinhar criativo e destino do clique.'
    ]
  },
  {
    id: 'conexao',
    name: 'Conexão & Carregamento',
    shortName: 'Connect Rate',
    metricName: 'Taxa de Conexão (Acessos / Cliques)',
    category: 'Conexão',
    unit: '%',
    goodThreshold: 75.0,
    warningThreshold: 60.0,
    isHigherBetter: true,
    nodeTitle: 'CONEXÃO — CLIQUE > PÁGINA',
    optimizationActions: [
      '1. Melhorar velocidade e estabilidade da página.',
      '2. Verificar URL, redirecionamentos e experiência móvel.',
      '3. Corrigir perdas técnicas entre clique e carregamento.'
    ]
  },
  {
    id: 'conversao_lp',
    name: 'Conversão de Página',
    shortName: 'Taxa LP > Lead',
    metricName: 'Taxa de Conversão da LP',
    category: 'Conversão',
    unit: '%',
    goodThreshold: 18.0,
    warningThreshold: 10.0,
    isHigherBetter: true,
    nodeTitle: 'CONVERSÃO — PÁGINA > LEAD',
    optimizationActions: [
      '1. Alinhar página e promessa do anúncio.',
      '2. Testar título, formulário, CTA e prova social.',
      '3. Reduzir fricção e campos desnecessários.',
      '4. Executar testes A/B.'
    ]
  },
  {
    id: 'qualidade_mql',
    name: 'Qualidade do Lead',
    shortName: 'Taxa MQL',
    metricName: 'Taxa de MQL (MQL / Leads)',
    category: 'Qualidade',
    unit: '%',
    goodThreshold: 60.0,
    warningThreshold: 40.0,
    isHigherBetter: true,
    nodeTitle: 'QUALIDADE — LEAD > MQL',
    optimizationActions: [
      '1. Revisar critérios e perguntas de qualificação.',
      '2. Direcionar segmentação e criativos ao ICP.',
      '3. Identificar origens que geram volume sem qualidade.'
    ]
  },
  {
    id: 'contato_sdr',
    name: 'Contato & Prospecção',
    shortName: 'Taxa Atendimento',
    metricName: 'Taxa de Atendimento (Speed-to-lead)',
    category: 'Contato',
    unit: '%',
    goodThreshold: 45.0,
    warningThreshold: 28.0,
    isHigherBetter: true,
    nodeTitle: 'CONTATO — MQL > ATENDIMENTO',
    optimizationActions: [
      '1. Reduzir o tempo até a primeira tentativa (Speed to lead < 5 min).',
      '2. Criar cadência em diferentes horários e canais (WhatsApp + Fone).',
      '3. Revisar abordagem e horários com maior atendimento.'
    ]
  },
  {
    id: 'aceite_sal',
    name: 'Aceite Comercial',
    shortName: 'MQL > SAL',
    metricName: 'Taxa de Aceite (SAL)',
    category: 'Aceite',
    unit: '%',
    goodThreshold: 70.0,
    warningThreshold: 50.0,
    isHigherBetter: true,
    nodeTitle: 'ACEITE — MQL > SAL',
    optimizationActions: [
      '1. Definir critérios claros de aceite pelo comercial.',
      '2. Alinhar marketing e vendas sobre qualidade mínima.',
      '3. Auditar motivos de recusa dos leads.'
    ]
  },
  {
    id: 'qualificacao_sql',
    name: 'Qualificação Avançada',
    shortName: 'SAL > SQL',
    metricName: 'Conversão SAL > SQL',
    category: 'Qualificação',
    unit: '%',
    goodThreshold: 65.0,
    warningThreshold: 45.0,
    isHigherBetter: true,
    nodeTitle: 'QUALIFICAÇÃO — SAL > SQL',
    optimizationActions: [
      '1. Melhorar o roteiro de diagnóstico.',
      '2. Mapear necessidade, autoridade, urgência e aderência.',
      '3. Revisar objeções e motivos de desqualificação.'
    ]
  },
  {
    id: 'agendamento_rm',
    name: 'Agendamento de Reuniões',
    shortName: 'RM Agendadas',
    metricName: 'Custo por RM Agendada',
    category: 'Agendamento',
    unit: 'R$',
    goodThreshold: 150.00,
    warningThreshold: 280.00,
    isHigherBetter: false,
    nodeTitle: 'AGENDAMENTO — RM NO DIA',
    optimizationActions: [
      '1. Facilitar a escolha de horário (links de agendamento ágeis).',
      '2. Confirmar o compromisso logo após a marcação.',
      '3. Reforçar o valor da reunião antes da confirmação.'
    ]
  },
  {
    id: 'agenda_programada',
    name: 'Gestão da Agenda',
    shortName: 'Agenda do Dia',
    metricName: 'Taxa de No-Show',
    category: 'Comparecimento',
    unit: '%',
    goodThreshold: 15.0,
    warningThreshold: 30.0,
    isHigherBetter: false,
    nodeTitle: 'AGENDA DO DIA — PROGRAMADAS',
    optimizationActions: [
      '1. Conferir a agenda prevista para o dia.',
      '2. Confirmar cada participante com antecedência (D-1 e D-0).',
      '3. Preparar responsável, contexto e materiais da reunião.'
    ]
  },
  {
    id: 'comparecimento_realizadas',
    name: 'Show Rate & Execução',
    shortName: 'Show Rate',
    metricName: 'Taxa de Comparecimento',
    category: 'Comparecimento',
    unit: '%',
    goodThreshold: 75.0,
    warningThreshold: 55.0,
    isHigherBetter: true,
    nodeTitle: 'COMPARECIMENTO — REALIZADAS',
    optimizationActions: [
      '1. Enviar lembretes automáticos e contextualizados antes da reunião.',
      '2. Entregar contexto ou material preparatório / case de sucesso.',
      '3. Recuperar rapidamente faltas e reagendamentos no mesmo turno.'
    ]
  },
  {
    id: 'fechamento_vendas',
    name: 'Fechamento & Vendas',
    shortName: 'Taxa de Fechamento',
    metricName: 'Conversão Reunião > Venda',
    category: 'Fechamento',
    unit: '%',
    goodThreshold: 25.0,
    warningThreshold: 12.0,
    isHigherBetter: true,
    nodeTitle: 'FECHAMENTO — VENDAS NO DIA',
    optimizationActions: [
      '1. Revisar diagnóstico, ancoragem de proposta e matriz de objeções.',
      '2. Acompanhar gravações de chamadas e mapear motivos de perda.',
      '3. Estruturar follow-up com prazo de validade e próximo passo definido.'
    ]
  },
  {
    id: 'custos_etapa',
    name: 'Análise de Custos por Etapa',
    shortName: 'Custos Unitários',
    metricName: 'Custo por Venda (CAC / CPV)',
    category: 'Economia',
    unit: 'R$',
    goodThreshold: 1200.00,
    warningThreshold: 2200.00,
    isHigherBetter: false,
    nodeTitle: 'CUSTOS POR ETAPA',
    optimizationActions: [
      '1. Identificar a etapa com maior custo unitário inflacionado.',
      '2. Atacar primeiro o gargalo que combina alto custo e baixo volume.',
      '3. Comparar os custos entre canais antes de realocar investimento.'
    ]
  },
  {
    id: 'economia_roas',
    name: 'Economia & Rentabilidade',
    shortName: 'ROAS & Ticket',
    metricName: 'ROAS (Retorno s/ Gasto de Anúncios)',
    category: 'Economia',
    unit: 'ratio',
    goodThreshold: 4.0,
    warningThreshold: 2.0,
    isHigherBetter: true,
    nodeTitle: 'ECONOMIA — TICKET / ROAS',
    optimizationActions: [
      '1. Revisar preço, pacotes, upsell, cross-sell e condições comerciais.',
      '2. Realocar investimento para origens com melhor retorno comprovado.',
      '3. Melhorar conversão do funil antes de escalar orçamento em mídia.'
    ]
  }
];
