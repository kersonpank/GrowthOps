import { FunnelDailyRecord, ComputedMetrics } from '../types';

export function computeFunnelMetrics(records: FunnelDailyRecord[]): ComputedMetrics {
  const totals = records.reduce(
    (acc, cur) => {
      acc.investimento += cur.investimento || 0;
      acc.valorCaptacao += cur.valorCaptacao || 0;
      acc.distribuicao += cur.distribuicao || 0;
      acc.impressoes += cur.impressoes || 0;
      acc.cliques += cur.cliques || 0;
      acc.acessosPagina += cur.acessosPagina || 0;
      acc.leads += cur.leads || 0;
      acc.mql += cur.mql || 0;
      acc.ligacoesRealizadas += cur.ligacoesRealizadas || 0;
      acc.ligacoesAtendidas += cur.ligacoesAtendidas || 0;
      acc.sal += cur.sal || 0;
      acc.sql += cur.sql || 0;
      acc.rmAgendadas += cur.rmAgendadas || 0;
      acc.reunioesProgramadas += cur.reunioesProgramadas || 0;
      acc.reunioesRealizadas += cur.reunioesRealizadas || 0;
      acc.noShow += cur.noShow || 0;
      acc.reagendamentos += cur.reagendamentos || 0;
      acc.vendas += cur.vendas || 0;
      acc.faturamento += cur.faturamento || 0;
      return acc;
    },
    {
      investimento: 0,
      valorCaptacao: 0,
      distribuicao: 0,
      impressoes: 0,
      cliques: 0,
      acessosPagina: 0,
      leads: 0,
      mql: 0,
      ligacoesRealizadas: 0,
      ligacoesAtendidas: 0,
      sal: 0,
      sql: 0,
      rmAgendadas: 0,
      reunioesProgramadas: 0,
      reunioesRealizadas: 0,
      noShow: 0,
      reagendamentos: 0,
      vendas: 0,
      faturamento: 0,
    }
  );

  // Safe division helpers
  const div = (n: number, d: number) => (d > 0 ? n / d : 0);
  const pct = (n: number, d: number) => (d > 0 ? (n / d) * 100 : 0);

  const cpm = totals.impressoes > 0 ? (totals.investimento / totals.impressoes) * 1000 : 0;
  const ctr = pct(totals.cliques, totals.impressoes);
  const cpc = div(totals.investimento, totals.cliques);
  
  // Taxa de Conexão (Connect Rate)
  const connectRate = pct(totals.acessosPagina, totals.cliques);
  
  // Conversão LP
  const taxaConversaoLP = pct(totals.leads, totals.acessosPagina);
  const cpl = div(totals.investimento, totals.leads);
  
  // MQL
  const taxaMQL = pct(totals.mql, totals.leads);
  const cpmql = div(totals.investimento, totals.mql);
  
  // SDR / Contato
  const taxaLigacoes = pct(totals.ligacoesRealizadas, totals.mql);
  const taxaAtendimento = pct(totals.ligacoesAtendidas, totals.ligacoesRealizadas);
  const custoLigacaoAtendida = div(totals.investimento, totals.ligacoesAtendidas);
  
  // SAL (Sales Accepted Lead)
  const taxaSAL = pct(totals.sal, totals.ligacoesAtendidas || totals.mql);
  const custoSAL = div(totals.investimento, totals.sal);
  
  // SQL (Sales Qualified Lead)
  const salToSqlRate = pct(totals.sql, totals.sal);
  const custoSQL = div(totals.investimento, totals.sql);
  
  // RM Agendada
  const custoRMAgendada = div(totals.investimento, totals.rmAgendadas);
  
  // Comparecimento & Show Rate
  const taxaComparecimento = pct(totals.reunioesRealizadas, totals.reunioesProgramadas);
  const taxaNoShow = pct(totals.noShow, totals.reunioesProgramadas);
  const taxaReagendamento = pct(totals.reagendamentos, totals.reunioesProgramadas);
  const custoReuniaoRealizada = div(totals.investimento, totals.reunioesRealizadas);
  
  // Fechamento & Vendas
  const taxaFechamento = pct(totals.vendas, totals.reunioesRealizadas);
  const leadToCustomerRate = pct(totals.vendas, totals.leads);
  const cpv = div(totals.investimento, totals.vendas);
  const ticketMedio = div(totals.faturamento, totals.vendas);
  const roas = div(totals.faturamento, totals.investimento);
  const lucroBruto = totals.faturamento - totals.investimento;
  const margemBruta = pct(lucroBruto, totals.faturamento);

  return {
    ...totals,
    cpm,
    ctr,
    cpc,
    connectRate,
    taxaConversaoLP,
    cpl,
    taxaMQL,
    cpmql,
    taxaLigacoes,
    taxaAtendimento,
    custoLigacaoAtendida,
    taxaSAL,
    custoSAL,
    salToSqlRate,
    custoSQL,
    custoRMAgendada,
    taxaComparecimento,
    taxaNoShow,
    taxaReagendamento,
    custoReuniaoRealizada,
    taxaFechamento,
    leadToCustomerRate,
    cpv,
    ticketMedio,
    roas,
    lucroBruto,
    margemBruta,
  };
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value || 0);
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${(value || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}%`;
}

export function formatRatio(value: number, decimals: number = 2): string {
  return `${(value || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}x`;
}
