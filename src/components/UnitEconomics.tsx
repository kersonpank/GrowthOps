import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Percent,
  Layers,
  ArrowRight,
  Sparkles,
  PieChart as PieIcon,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { ComputedMetrics, FunnelDailyRecord } from '../types';
import { computeFunnelMetrics, formatBRL, formatNumber, formatPercent, formatRatio } from '../utils/calculator';

interface UnitEconomicsProps {
  metrics: ComputedMetrics;
  allRecords: FunnelDailyRecord[];
}

export const UnitEconomics: React.FC<UnitEconomicsProps> = ({ metrics, allRecords }) => {
  // Calculate channel-specific metrics for comparison
  const metaLPRecords = allRecords.filter((r) => r.channel === 'Meta (LP)');
  const metaFormRecords = allRecords.filter((r) => r.channel === 'Meta (Form)');
  const googleRecords = allRecords.filter((r) => r.channel === 'Google');

  const metaLPMetrics = computeFunnelMetrics(metaLPRecords);
  const metaFormMetrics = computeFunnelMetrics(metaFormRecords);
  const googleMetrics = computeFunnelMetrics(googleRecords);

  // Step-by-step cost escalation data for chart
  const costEscalation = [
    { stage: 'CPC (Clique)', cost: metrics.cpc, color: '#3b82f6' },
    { stage: 'CPL (Lead)', cost: metrics.cpl, color: '#8b5cf6' },
    { stage: 'CPMQL (MQL)', cost: metrics.cpmql, color: '#a855f7' },
    { stage: 'Custo SAL', cost: metrics.custoSAL, color: '#d946ef' },
    { stage: 'Custo SQL', cost: metrics.custoSQL, color: '#ec4899' },
    { stage: 'Custo Reunião', cost: metrics.custoReuniaoRealizada, color: '#f43f5e' },
    { stage: 'CAC / CPV (Venda)', cost: metrics.cpv, color: '#10b981' },
  ];

  // Channel comparison table rows
  const comparisonRows = [
    {
      label: 'Investimento Total',
      metaLP: formatBRL(metaLPMetrics.investimento),
      metaForm: formatBRL(metaFormMetrics.investimento),
      google: formatBRL(googleMetrics.investimento),
      blended: formatBRL(metrics.investimento),
    },
    {
      label: 'Faturamento Gerado',
      metaLP: formatBRL(metaLPMetrics.faturamento),
      metaForm: formatBRL(metaFormMetrics.faturamento),
      google: formatBRL(googleMetrics.faturamento),
      blended: formatBRL(metrics.faturamento),
    },
    {
      label: 'ROAS (Multiplicador)',
      metaLP: formatRatio(metaLPMetrics.roas),
      metaForm: formatRatio(metaFormMetrics.roas),
      google: formatRatio(googleMetrics.roas),
      blended: formatRatio(metrics.roas),
      highlightBest: 'google',
    },
    {
      label: 'CPL (Custo por Lead)',
      metaLP: formatBRL(metaLPMetrics.cpl),
      metaForm: formatBRL(metaFormMetrics.cpl),
      google: formatBRL(googleMetrics.cpl),
      blended: formatBRL(metrics.cpl),
      highlightBest: 'metaForm',
    },
    {
      label: 'Taxa de MQL (%)',
      metaLP: formatPercent(metaLPMetrics.taxaMQL),
      metaForm: formatPercent(metaFormMetrics.taxaMQL),
      google: formatPercent(googleMetrics.taxaMQL),
      blended: formatPercent(metrics.taxaMQL),
      highlightBest: 'google',
    },
    {
      label: 'Custo por SQL',
      metaLP: formatBRL(metaLPMetrics.custoSQL),
      metaForm: formatBRL(metaFormMetrics.custoSQL),
      google: formatBRL(googleMetrics.custoSQL),
      blended: formatBRL(metrics.custoSQL),
      highlightBest: 'google',
    },
    {
      label: 'Show Rate (Comparecimento)',
      metaLP: formatPercent(metaLPMetrics.taxaComparecimento),
      metaForm: formatPercent(metaFormMetrics.taxaComparecimento),
      google: formatPercent(googleMetrics.taxaComparecimento),
      blended: formatPercent(metrics.taxaComparecimento),
      highlightBest: 'google',
    },
    {
      label: 'CPV / CAC (Custo por Venda)',
      metaLP: formatBRL(metaLPMetrics.cpv),
      metaForm: formatBRL(metaFormMetrics.cpv),
      google: formatBRL(googleMetrics.cpv),
      blended: formatBRL(metrics.cpv),
      highlightBest: 'google',
    },
    {
      label: 'Ticket Médio',
      metaLP: formatBRL(metaLPMetrics.ticketMedio),
      metaForm: formatBRL(metaFormMetrics.ticketMedio),
      google: formatBRL(googleMetrics.ticketMedio),
      blended: formatBRL(metrics.ticketMedio),
    },
    {
      label: 'Lucro Bruto',
      metaLP: formatBRL(metaLPMetrics.lucroBruto),
      metaForm: formatBRL(metaFormMetrics.lucroBruto),
      google: formatBRL(googleMetrics.lucroBruto),
      blended: formatBRL(metrics.lucroBruto),
      highlightBest: 'google',
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Intro Summary Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            Economia Unitária: Da Impressão ao CAC & Rentabilidade
          </h2>
          <p className="text-xs text-slate-400">
            Análise do custo acumulado por etapa do funil e eficiência de alocação de capital entre canais
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400">Margem Bruta da Operação:</span>
          <strong className="text-emerald-400 text-sm font-bold">{formatPercent(metrics.margemBruta, 1)}</strong>
        </div>
      </div>

      {/* Top Cards: Unit Economics Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <span className="text-xs font-medium text-slate-400">CAC / CPV Médio</span>
          <div className="mt-1.5 text-2xl font-extrabold text-white">
            {formatBRL(metrics.cpv)}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Custo total de mídia para fechar 1 cliente
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <span className="text-xs font-medium text-slate-400">Ticket Médio</span>
          <div className="mt-1.5 text-2xl font-extrabold text-emerald-400">
            {formatBRL(metrics.ticketMedio)}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Receita média gerada por venda fechada
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <span className="text-xs font-medium text-slate-400">LTV / CAC Ratio (1ª Compra)</span>
          <div className="mt-1.5 text-2xl font-extrabold text-indigo-400">
            {metrics.cpv > 0 ? (metrics.ticketMedio / metrics.cpv).toFixed(2) : '0.00'}x
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Relação direta de retorno sobre o custo de aquisição
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm">
          <span className="text-xs font-medium text-slate-400">Lucro Bruto Operacional</span>
          <div className="mt-1.5 text-2xl font-extrabold text-cyan-400">
            {formatBRL(metrics.lucroBruto)}
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Faturamento menos investimento de mídia
          </p>
        </div>

      </div>

      {/* Cost Escalation Chart */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Escalada de Custo por Etapa da Jornada
            </h3>
            <p className="text-xs text-slate-400">
              Visualização de quanto o lead se valoriza e encarece a cada avanço no funil comercial
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={costEscalation} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="stage" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis
                stroke="#64748b"
                tick={{ fontSize: 11 }}
                tickFormatter={(val) => `R$${val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  color: '#f8fafc',
                  fontSize: '12px',
                }}
                formatter={(val: any) => [formatBRL(Number(val)), 'Custo Unitário']}
              />
              <Bar dataKey="cost" radius={[6, 6, 0, 0]}>
                {costEscalation.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Channel Comparison Matrix Table */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm overflow-hidden">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-white">Matriz Comparativa de Canais de Aquisição</h3>
          <p className="text-xs text-slate-400">
            Comparativo detalhado de eficiência, custo por lead, qualificação e CAC final entre origens
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 px-4 font-semibold">Métrica de Jornada</th>
                <th className="py-3 px-4 font-semibold text-blue-400">Meta (LP)</th>
                <th className="py-3 px-4 font-semibold text-cyan-400">Meta (Form)</th>
                <th className="py-3 px-4 font-semibold text-emerald-400">Google Ads</th>
                <th className="py-3 px-4 font-semibold text-indigo-300 bg-slate-950/40">Total Blended</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {comparisonRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-4 font-medium text-white">{row.label}</td>
                  <td className={`py-2.5 px-4 ${row.highlightBest === 'metaLP' ? 'text-emerald-400 font-bold' : ''}`}>
                    {row.metaLP}
                  </td>
                  <td className={`py-2.5 px-4 ${row.highlightBest === 'metaForm' ? 'text-emerald-400 font-bold' : ''}`}>
                    {row.metaForm}
                  </td>
                  <td className={`py-2.5 px-4 ${row.highlightBest === 'google' ? 'text-emerald-400 font-bold' : ''}`}>
                    {row.google}
                  </td>
                  <td className="py-2.5 px-4 font-bold text-white bg-slate-950/40">
                    {row.blended}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
