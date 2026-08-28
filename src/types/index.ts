export type ChannelType = 'Meta (LP)' | 'Meta (Form)' | 'Google' | 'Todos';

export interface FunnelDailyRecord {
  id: string;
  date: string; // YYYY-MM-DD
  month: string; // e.g. "Março", "Abril"
  channel: 'Meta (LP)' | 'Meta (Form)' | 'Google';
  
  // Raw Inputs from Spreadsheet
  investimento: number; // R$
  valorCaptacao: number; // R$
  distribuicao: number; // R$
  impressoes: number;
  cliques: number;
  acessosPagina: number;
  leads: number;
  mql: number;
  ligacoesRealizadas: number;
  ligacoesAtendidas: number;
  sal: number; // Sales Accepted Leads
  sql: number; // Sales Qualified Leads
  rmAgendadas: number; // Reuniões Marcadas no dia
  reunioesProgramadas: number;
  reunioesRealizadas: number;
  noShow: number;
  reagendamentos: number;
  vendas: number;
  faturamento: number; // R$
}

export interface ComputedMetrics {
  // Volume & Raw
  investimento: number;
  valorCaptacao: number;
  distribuicao: number;
  impressoes: number;
  cliques: number;
  acessosPagina: number;
  leads: number;
  mql: number;
  ligacoesRealizadas: number;
  ligacoesAtendidas: number;
  sal: number;
  sql: number;
  rmAgendadas: number;
  reunioesProgramadas: number;
  reunioesRealizadas: number;
  noShow: number;
  reagendamentos: number;
  vendas: number;
  faturamento: number;

  // Entrega
  cpm: number; // Custo por Mil
  
  // Atração
  ctr: number; // %
  cpc: number; // R$
  
  // Conexão
  connectRate: number; // % (Acessos / Cliques)
  
  // Conversão LP
  taxaConversaoLP: number; // % (Leads / Acessos)
  cpl: number; // Custo por Lead R$
  
  // Qualidade / MQL
  taxaMQL: number; // % (MQL / Leads)
  cpmql: number; // Custo por MQL R$
  
  // Contato SDR
  taxaLigacoes: number; // % (Ligações / MQL)
  taxaAtendimento: number; // % (Atendidas / Ligações)
  custoLigacaoAtendida: number; // R$
  
  // Aceite SAL
  taxaSAL: number; // % (SAL / Atendidas ou MQL)
  custoSAL: number; // R$
  
  // Qualificação SQL
  salToSqlRate: number; // % (SQL / SAL)
  custoSQL: number; // R$
  
  // Agendamento RM
  custoRMAgendada: number; // R$
  
  // Comparecimento & Execução
  taxaComparecimento: number; // % Show Rate (Realizadas / Programadas)
  taxaNoShow: number; // % (No Show / Programadas)
  taxaReagendamento: number; // % (Reagendamentos / Programadas)
  custoReuniaoRealizada: number; // R$
  
  // Fechamento & Unit Economics
  taxaFechamento: number; // % (Vendas / Realizadas)
  leadToCustomerRate: number; // % (Vendas / Leads)
  cpv: number; // CAC / Custo por Venda R$
  ticketMedio: number; // R$
  roas: number; // Faturamento / Investimento
  lucroBruto: number; // Faturamento - Investimento
  margemBruta: number; // %
}

export interface FunnelStageBenchmark {
  id: string;
  name: string;
  shortName: string;
  metricName: string;
  category: 'Investimento' | 'Entrega' | 'Atração' | 'Conexão' | 'Conversão' | 'Qualidade' | 'Contato' | 'Aceite' | 'Qualificação' | 'Agendamento' | 'Comparecimento' | 'Fechamento' | 'Economia';
  unit: '%' | 'R$' | 'ratio' | 'qtd';
  goodThreshold: number;
  warningThreshold: number;
  isHigherBetter: boolean;
  nodeTitle: string;
  optimizationActions: string[];
}

export type ViewTab = 'overview' | 'funnel' | 'uniteconomics' | 'playbook' | 'simulator' | 'datagrid';

export type DateRangePreset = '7d' | '14d' | '30d' | 'month' | 'quarter' | 'all' | 'custom';
