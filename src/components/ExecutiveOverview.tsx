import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  PhoneCall,
  CalendarCheck,
  Award,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Activity,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { ComputedMetrics, FunnelDailyRecord } from '../types';
import { formatBRL, formatNumber, formatPercent, formatRatio } from '../utils/calculator';

interface ExecutiveOverviewProps {
  metrics: ComputedMetrics;
  records: FunnelDailyRecord[];
  onNavigateToTab: (tab: any) => void;
}

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({
  metrics,
  records,
  onNavigateToTab,
}) => {
  // Aggregate daily time-series data for the trend chart
  const dailyMap = new Map<string, {
    date: string;
    displayDate: string;
    investimento: number;
    faturamento: number;
    leads: number;
    vendas: number;
    roas: number;
  }>();

  // Sort records by date
  const sortedRecords = [...records].sort((a, b) => a.date.localeCompare(b.date));

  sortedRecords.forEach((r) => {
    const existing = dailyMap.get(r.date) || {
      date: r.date,
      displayDate: r.date.slice(5), // MM-DD
      investimento: 0,
      faturamento: 0,
      leads: 0,
      vendas: 0,
      roas: 0,
    };
    existing.investimento += r.investimento;
    existing.faturamento += r.faturamento;
    existing.leads += r.leads;
    existing.vendas += r.vendas;
    dailyMap.set(r.date, existing);
  });

  const timeSeriesData = Array.from(dailyMap.values()).map((d) => ({
    ...d,
    roas: d.investimento > 0 ? Number((d.faturamento / d.investimento).toFixed(2)) : 0,
  }));

  // Channel share data
  const channelBreakdown = [
    {
      name: 'Meta (LP)',
      investimento: records.filter((r) => r.channel === 'Meta (LP)').reduce((s, r) => s + r.investimento, 0),
      faturamento: records.filter((r) => r.channel === 'Meta (LP)').reduce((s, r) => s + r.faturamento, 0),
      vendas: records.filter((r) => r.channel === 'Meta (LP)').reduce((s, r) => s + r.vendas, 0),
      color: '#3b82f6',
    },
    {
      name: 'Meta (Form)',
      investimento: records.filter((r) => r.channel === 'Meta (Form)').reduce((s, r) => s + r.investimento, 0),
      faturamento: records.filter((r) => r.channel === 'Meta (Form)').reduce((s, r) => s + r.faturamento, 0),
      vendas: records.filter((r) => r.channel === 'Meta (Form)').reduce((s, r) => s + r.vendas, 0),
      color: '#06b6d4',
    },
    {
      name: 'Google Ads',
      investimento: records.filter((r) => r.channel === 'Google').reduce((s, r) => s + r.investimento, 0),
      faturamento: records.filter((r) => r.channel === 'Google').reduce((s, r) => s + r.faturamento, 0),
      vendas: records.filter((r) => r.channel === 'Google').reduce((s, r) => s + r.vendas, 0),
      color: '#10b981',
    },
  ];

  // Stage volumes for horizontal funnel summary
  const funnelStages = [
    { label: 'Impressões', val: metrics.impressoes, color: 'bg-slate-700' },
    { label: 'Cliques', val: metrics.cliques, color: 'bg-blue-600' },
    { label: 'Acessos LP', val: metrics.acessosPagina, color: 'bg-indigo-600' },
    { label: 'Leads', val: metrics.leads, color: 'bg-violet-600' },
    { label: 'MQLs', val: metrics.mql, color: 'bg-purple-600' },
    { label: 'SALs', val: metrics.sal, color: 'bg-fuchsia-600' },
    { label: 'SQLs', val: metrics.sql, color: 'bg-pink-600' },
    { label: 'Reuniões', val: metrics.reunioesRealizadas, color: 'bg-rose-600' },
    { label: 'Vendas', val: metrics.vendas, color: 'bg-emerald-500' },
  ];

  // Calculate ROAS status
  const getRoasBadge = (roas: number) => {
    if (roas >= 4.0) {
      return { text: 'Alta Rentabilidade', class: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
    }
    if (roas >= 2.5) {
      return { text: 'Operação Saudável', class: 'bg-blue-500/15 text-blue-400 border-blue-500/30' };
    }
    if (roas >= 1.5) {
      return { text: 'Ponto de Atenção', class: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
    }
    return { text: 'Margem Crítica', class: 'bg-red-500/15 text-red-400 border-red-500/30' };
  };

  const roasStatus = getRoasBadge(metrics.roas);

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Real-Time Growth Health Summary */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 border border-indigo-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Status da Operação de Aquisição</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roasStatus.class}`}>
                {roasStatus.text}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              ROAS de <strong>{formatRatio(metrics.roas)}</strong> gerando <strong>{formatBRL(metrics.lucroBruto)}</strong> de lucro bruto sobre <strong>{formatBRL(metrics.investimento)}</strong> investidos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => onNavigateToTab('playbook')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-colors"
          >
            <span>Ver Diagnóstico de Gargalos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 6 Primary Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* 1. Investimento */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all shadow-sm group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Investimento Total</span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
              <DollarSign className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl font-extrabold text-white tracking-tight">
              {formatBRL(metrics.investimento)}
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
              <span>Captação: {formatBRL(metrics.valorCaptacao)}</span>
              <span>Distr: {formatBRL(metrics.distribuicao)}</span>
            </div>
          </div>
        </div>

        {/* 2. Faturamento & ROAS */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all shadow-sm group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Faturamento Bruto</span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl font-extrabold text-white tracking-tight">
              {formatBRL(metrics.faturamento)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px]">
              <span className="text-slate-400">ROAS:</span>
              <span className="font-bold text-emerald-400">{formatRatio(metrics.roas)}</span>
              <span className="text-slate-500">• Margem {formatPercent(metrics.margemBruta, 0)}</span>
            </div>
          </div>
        </div>

        {/* 3. Leads & CPL */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all shadow-sm group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Leads Gerados</span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
              <Users className="w-4 h-4 text-violet-400" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl font-extrabold text-white tracking-tight">
              {formatNumber(metrics.leads)}
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
              <span>CPL: <strong className="text-slate-200">{formatBRL(metrics.cpl)}</strong></span>
              <span>Taxa LP: <strong className="text-slate-200">{formatPercent(metrics.taxaConversaoLP)}</strong></span>
            </div>
          </div>
        </div>

        {/* 4. MQL / SQL */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all shadow-sm group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Qualificação (MQL / SQL)</span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
              <Target className="w-4 h-4 text-pink-400" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl font-extrabold text-white tracking-tight">
              {formatNumber(metrics.sql)} <span className="text-xs font-normal text-slate-400">SQLs</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
              <span>{formatNumber(metrics.mql)} MQLs</span>
              <span>Custo/SQL: <strong className="text-slate-200">{formatBRL(metrics.custoSQL)}</strong></span>
            </div>
          </div>
        </div>

        {/* 5. Reuniões & Show Rate */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all shadow-sm group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Reuniões Realizadas</span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
              <CalendarCheck className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl font-extrabold text-white tracking-tight">
              {formatNumber(metrics.reunioesRealizadas)}
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
              <span>Show Rate: <strong className="text-slate-200">{formatPercent(metrics.taxaComparecimento)}</strong></span>
              <span>No-Show: <strong className="text-slate-200">{formatPercent(metrics.taxaNoShow)}</strong></span>
            </div>
          </div>
        </div>

        {/* 6. Vendas & CPV (CAC) */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all shadow-sm group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Vendas & CAC (CPV)</span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
              <Award className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-xl font-extrabold text-white tracking-tight">
              {formatNumber(metrics.vendas)} <span className="text-xs font-normal text-slate-400">vendas</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
              <span>CAC: <strong className="text-slate-200">{formatBRL(metrics.cpv)}</strong></span>
              <span>Ticket: <strong className="text-slate-200">{formatBRL(metrics.ticketMedio)}</strong></span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Big Chart: Evolution over Time (Investimento vs Faturamento vs ROAS) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                Evolução Temporal: Investimento vs Faturamento & ROAS
              </h3>
              <p className="text-xs text-slate-400">
                Acompanhamento diário do ritmo de gasto, receita gerada e multiplicador de retorno
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-blue-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> Investimento
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Faturamento
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2.5 h-0.5 bg-amber-400" /> ROAS
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="displayDate" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis
                  yAxisId="left"
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => `R$${(val / 1000).toFixed(0)}k`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(val) => `${val}x`}
                  domain={[0, 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                  formatter={(val: any, name: string) => {
                    if (name === 'investimento') return [formatBRL(Number(val)), 'Investimento'];
                    if (name === 'faturamento') return [formatBRL(Number(val)), 'Faturamento'];
                    if (name === 'roas') return [formatRatio(Number(val)), 'ROAS'];
                    return [val, name];
                  }}
                  labelFormatter={(label) => `Data: ${label}`}
                />
                <Bar yAxisId="left" dataKey="investimento" fill="#3b82f6" opacity={0.8} radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="faturamento" fill="#10b981" opacity={0.9} radius={[4, 4, 0, 0]} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="roas"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Column: Channel Distribution & Efficiency */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Mix de Canais & Eficiência
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Comparativo de receita gerada e retorno por origem
            </p>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelBreakdown}
                    dataKey="faturamento"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                  >
                    {channelBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#f8fafc',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [formatBRL(Number(val)), 'Faturamento']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2.5 mt-2 pt-3 border-t border-slate-800">
            {channelBreakdown.map((ch) => {
              const chRoas = ch.investimento > 0 ? ch.faturamento / ch.investimento : 0;
              return (
                <div key={ch.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ch.color }} />
                    <span className="text-slate-300 font-medium">{ch.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">{formatBRL(ch.faturamento)}</span>
                    <span className="font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                      {formatRatio(chRoas)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Mini Visual Funnel Pipeline Strip */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Pipeline de Volume de Ponta a Ponta</h3>
            <p className="text-xs text-slate-400">
              Fluxo numérico de passagem de leads ao longo de cada etapa da jornada
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('funnel')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
          >
            Ver Análise Detalhada de Taxas <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
          {funnelStages.map((stage, idx) => (
            <div
              key={stage.label}
              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between text-center relative"
            >
              <span className="text-[11px] font-medium text-slate-400 line-clamp-1">{stage.label}</span>
              <div className="my-1.5 text-sm sm:text-base font-extrabold text-white">
                {formatNumber(stage.val)}
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${stage.color}`}
                  style={{
                    width: `${Math.max(8, (stage.val / (metrics.impressoes || 1)) * 100 * (idx === 0 ? 1 : idx === 1 ? 50 : idx === 2 ? 100 : 300))}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
