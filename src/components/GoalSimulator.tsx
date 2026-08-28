import React, { useState } from 'react';
import {
  Calculator,
  Target,
  Sparkles,
  TrendingUp,
  Sliders,
  DollarSign,
  ArrowRight,
  RefreshCcw,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { ComputedMetrics } from '../types';
import { formatBRL, formatNumber, formatPercent, formatRatio } from '../utils/calculator';

interface GoalSimulatorProps {
  metrics: ComputedMetrics;
}

export const GoalSimulator: React.FC<GoalSimulatorProps> = ({ metrics }) => {
  const [mode, setMode] = useState<'targetRevenue' | 'budget'>('targetRevenue');
  const [targetRevenue, setTargetRevenue] = useState<number>(100000);
  const [targetBudget, setTargetBudget] = useState<number>(15000);

  // Levers adjustments (percentage shifts, e.g. +5% in show rate)
  const [lpConvBoost, setLpConvBoost] = useState<number>(0);
  const [showRateBoost, setShowRateBoost] = useState<number>(0);
  const [closeRateBoost, setCloseRateBoost] = useState<number>(0);
  const [ticketBoost, setTicketBoost] = useState<number>(0);

  // Baseline metrics (or safe defaults if blank)
  const baseTicket = metrics.ticketMedio > 0 ? metrics.ticketMedio : 4500;
  const baseCloseRate = metrics.taxaFechamento > 0 ? metrics.taxaFechamento : 22;
  const baseShowRate = metrics.taxaComparecimento > 0 ? metrics.taxaComparecimento : 72;
  const baseSqlToRmRate = metrics.sql > 0 ? (metrics.rmAgendadas / metrics.sql) * 100 : 80;
  const baseSalToSqlRate = metrics.salToSqlRate > 0 ? metrics.salToSqlRate : 65;
  const baseMqlToSalRate = metrics.taxaSAL > 0 ? metrics.taxaSAL : 60;
  const baseLeadToMqlRate = metrics.taxaMQL > 0 ? metrics.taxaMQL : 55;
  const baseLpConvRate = metrics.taxaConversaoLP > 0 ? metrics.taxaConversaoLP : 18;
  const baseConnectRate = metrics.connectRate > 0 ? metrics.connectRate : 78;
  const baseCPC = metrics.cpc > 0 ? metrics.cpc : 2.50;

  // Effective adjusted levers
  const effTicket = baseTicket * (1 + ticketBoost / 100);
  const effCloseRate = Math.min(95, baseCloseRate + closeRateBoost);
  const effShowRate = Math.min(95, baseShowRate + showRateBoost);
  const effLpConvRate = Math.min(95, baseLpConvRate + lpConvBoost);

  // Mode 1: Reverse Funnel from Target Revenue
  const simDealsNeeded = Math.ceil(targetRevenue / (effTicket || 1));
  const simMeetingsNeeded = Math.ceil(simDealsNeeded / (effCloseRate / 100 || 1));
  const simScheduledNeeded = Math.ceil(simMeetingsNeeded / (effShowRate / 100 || 1));
  const simSqlNeeded = Math.ceil(simScheduledNeeded / (baseSqlToRmRate / 100 || 1));
  const simSalNeeded = Math.ceil(simSqlNeeded / (baseSalToSqlRate / 100 || 1));
  const simMqlNeeded = Math.ceil(simSalNeeded / (baseMqlToSalRate / 100 || 1));
  const simLeadsNeeded = Math.ceil(simMqlNeeded / (baseLeadToMqlRate / 100 || 1));
  const simPageviewsNeeded = Math.ceil(simLeadsNeeded / (effLpConvRate / 100 || 1));
  const simClicksNeeded = Math.ceil(simPageviewsNeeded / (baseConnectRate / 100 || 1));
  const simBudgetRequired = simClicksNeeded * baseCPC;
  const simRoas = simBudgetRequired > 0 ? targetRevenue / simBudgetRequired : 0;
  const simLucro = targetRevenue - simBudgetRequired;

  // Mode 2: Forward Projection from Budget
  const simFwdClicks = Math.floor(targetBudget / (baseCPC || 1));
  const simFwdPageviews = Math.floor(simFwdClicks * (baseConnectRate / 100));
  const simFwdLeads = Math.floor(simFwdPageviews * (effLpConvRate / 100));
  const simFwdMql = Math.floor(simFwdLeads * (baseLeadToMqlRate / 100));
  const simFwdSal = Math.floor(simFwdMql * (baseMqlToSalRate / 100));
  const simFwdSql = Math.floor(simFwdSal * (baseSalToSqlRate / 100));
  const simFwdScheduled = Math.floor(simFwdSql * (baseSqlToRmRate / 100));
  const simFwdMeetings = Math.floor(simFwdScheduled * (effShowRate / 100));
  const simFwdDeals = Math.floor(simFwdMeetings * (effCloseRate / 100));
  const simFwdRevenue = simFwdDeals * effTicket;
  const simFwdRoas = targetBudget > 0 ? simFwdRevenue / targetBudget : 0;
  const simFwdLucro = simFwdRevenue - targetBudget;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-400" />
            Simulador de Metas & Planejador de Budget (What-If)
          </h2>
          <p className="text-xs text-slate-400">
            Engenharia reversa do funil de vendas baseada no histórico real de conversão por etapa
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setMode('targetRevenue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'targetRevenue'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Meta de Faturamento
          </button>
          <button
            onClick={() => setMode('budget')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'budget'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Orçamento Disponível
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Input Controls & Optimization Sliders (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Main Target Input Card */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-400" />
              {mode === 'targetRevenue' ? 'Definir Meta de Faturamento' : 'Definir Orçamento de Mídia'}
            </h3>

            {mode === 'targetRevenue' ? (
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1.5">
                  Faturamento Alvo Mensal (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">R$</span>
                  <input
                    type="number"
                    step="5000"
                    value={targetRevenue}
                    onChange={(e) => setTargetRevenue(Math.max(1000, Number(e.target.value)))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-base font-extrabold text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {[50000, 100000, 200000, 500000].map((val) => (
                    <button
                      key={val}
                      onClick={() => setTargetRevenue(val)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 transition-colors"
                    >
                      {formatBRL(val)}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1.5">
                  Orçamento de Tráfego / Mídia (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">R$</span>
                  <input
                    type="number"
                    step="1000"
                    value={targetBudget}
                    onChange={(e) => setTargetBudget(Math.max(500, Number(e.target.value)))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-base font-extrabold text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {[5000, 10000, 20000, 50000].map((val) => (
                    <button
                      key={val}
                      onClick={() => setTargetBudget(val)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 transition-colors"
                    >
                      {formatBRL(val)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sensitivity Sliders: Alavancas de Otimização */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                Alavancas de Otimização do Funil
              </h3>
              <button
                onClick={() => {
                  setLpConvBoost(0);
                  setShowRateBoost(0);
                  setCloseRateBoost(0);
                  setTicketBoost(0);
                }}
                className="text-[11px] text-slate-400 hover:text-white inline-flex items-center gap-1"
              >
                <RefreshCcw className="w-3 h-3" /> Resetar
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Simule o efeito cascata de pequenas melhorias operacionais nas taxas de conversão
            </p>

            {/* Slider 1: Conversão LP */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Conversão da LP (+{lpConvBoost}%)</span>
                <span className="font-bold text-indigo-400 font-mono">{formatPercent(effLpConvRate)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                value={lpConvBoost}
                onChange={(e) => setLpConvBoost(Number(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-slate-950 rounded-lg"
              />
            </div>

            {/* Slider 2: Show Rate */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Show Rate (Comparecimento) (+{showRateBoost}%)</span>
                <span className="font-bold text-indigo-400 font-mono">{formatPercent(effShowRate)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                value={showRateBoost}
                onChange={(e) => setShowRateBoost(Number(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-slate-950 rounded-lg"
              />
            </div>

            {/* Slider 3: Taxa de Fechamento */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Taxa de Fechamento Vendas (+{closeRateBoost}%)</span>
                <span className="font-bold text-indigo-400 font-mono">{formatPercent(effCloseRate)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                value={closeRateBoost}
                onChange={(e) => setCloseRateBoost(Number(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-slate-950 rounded-lg"
              />
            </div>

            {/* Slider 4: Ticket Médio */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Aumento de Ticket / Upsell (+{ticketBoost}%)</span>
                <span className="font-bold text-emerald-400 font-mono">{formatBRL(effTicket)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={ticketBoost}
                onChange={(e) => setTicketBoost(Number(e.target.value))}
                className="w-full accent-emerald-500 h-1.5 bg-slate-950 rounded-lg"
              />
            </div>

          </div>

        </div>

        {/* Right Column: Projected Funnel & Financial Outcomes (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Main Projected Financial Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/50 border border-indigo-500/30 shadow-xl">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Resultado Projetado
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[11px] text-slate-400">Faturamento</span>
                <div className="text-lg font-extrabold text-white mt-0.5">
                  {formatBRL(mode === 'targetRevenue' ? targetRevenue : simFwdRevenue)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[11px] text-slate-400">Investimento Necessário</span>
                <div className="text-lg font-extrabold text-blue-400 mt-0.5">
                  {formatBRL(mode === 'targetRevenue' ? simBudgetRequired : targetBudget)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[11px] text-slate-400">ROAS Estimado</span>
                <div className="text-lg font-extrabold text-amber-400 mt-0.5">
                  {formatRatio(mode === 'targetRevenue' ? simRoas : simFwdRoas)}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-[11px] text-slate-400">Lucro Bruto Estimado</span>
                <div className="text-lg font-extrabold text-emerald-400 mt-0.5">
                  {formatBRL(mode === 'targetRevenue' ? simLucro : simFwdLucro)}
                </div>
              </div>
            </div>
          </div>

          {/* Reverse Funnel Requirement Breakdown */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-white">
              Metas Operacionais Necessárias por Etapa
            </h3>
            <p className="text-xs text-slate-400">
              Quantidades exatas que o time de marketing e vendas precisará entregar para atingir este resultado
            </p>

            <div className="space-y-2 pt-2">
              {[
                {
                  label: 'Vendas Fechadas (Contratos)',
                  val: mode === 'targetRevenue' ? simDealsNeeded : simFwdDeals,
                  color: 'text-emerald-400',
                  bg: 'bg-emerald-500/10',
                },
                {
                  label: 'Reuniões Realizadas (Demos executadas)',
                  val: mode === 'targetRevenue' ? simMeetingsNeeded : simFwdMeetings,
                  color: 'text-rose-400',
                  bg: 'bg-rose-500/10',
                },
                {
                  label: 'Reuniões Programadas & Agendadas (SDR)',
                  val: mode === 'targetRevenue' ? simScheduledNeeded : simFwdScheduled,
                  color: 'text-pink-400',
                  bg: 'bg-pink-500/10',
                },
                {
                  label: 'SQL (Leads Qualificados para Venda)',
                  val: mode === 'targetRevenue' ? simSqlNeeded : simFwdSql,
                  color: 'text-fuchsia-400',
                  bg: 'bg-fuchsia-500/10',
                },
                {
                  label: 'SAL (Leads Aceitos pelo Comercial)',
                  val: mode === 'targetRevenue' ? simSalNeeded : simFwdSal,
                  color: 'text-purple-400',
                  bg: 'bg-purple-500/10',
                },
                {
                  label: 'MQL (Marketing Qualified Leads)',
                  val: mode === 'targetRevenue' ? simMqlNeeded : simFwdMql,
                  color: 'text-violet-400',
                  bg: 'bg-violet-500/10',
                },
                {
                  label: 'Total de Leads Gerados na LP / Form',
                  val: mode === 'targetRevenue' ? simLeadsNeeded : simFwdLeads,
                  color: 'text-indigo-400',
                  bg: 'bg-indigo-500/10',
                },
                {
                  label: 'Acessos na Landing Page (Pageviews)',
                  val: mode === 'targetRevenue' ? simPageviewsNeeded : simFwdPageviews,
                  color: 'text-blue-400',
                  bg: 'bg-blue-500/10',
                },
                {
                  label: 'Cliques em Anúncios (Tráfego)',
                  val: mode === 'targetRevenue' ? simClicksNeeded : simFwdClicks,
                  color: 'text-cyan-400',
                  bg: 'bg-cyan-500/10',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-slate-800 text-slate-400 flex items-center justify-center font-mono text-[10px]">
                      {idx + 1}
                    </div>
                    <span className="text-slate-300 font-medium">{item.label}</span>
                  </div>
                  <span className={`font-mono font-extrabold text-sm ${item.color}`}>
                    {formatNumber(item.val)}
                  </span>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
