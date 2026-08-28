import React, { useState } from 'react';
import {
  GitFork,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  XCircle,
  HelpCircle,
  ChevronRight,
  TrendingDown,
  Compass,
  Lightbulb,
  ExternalLink,
} from 'lucide-react';
import { ComputedMetrics } from '../types';
import { STAGE_PLAYBOOKS } from '../data/optimizationPlaybook';
import { formatBRL, formatNumber, formatPercent } from '../utils/calculator';

interface FunnelVisualizerProps {
  metrics: ComputedMetrics;
  onNavigateToPlaybookStage?: (stageId: string) => void;
}

export const FunnelVisualizer: React.FC<FunnelVisualizerProps> = ({
  metrics,
  onNavigateToPlaybookStage,
}) => {
  const [selectedStageId, setSelectedStageId] = useState<string>('conexao');

  // Define each conversion transition in the funnel
  const funnelSteps = [
    {
      id: 'entrega_atracao',
      playbookId: 'atracao',
      fromName: 'Impressões',
      fromValue: metrics.impressoes,
      toName: 'Cliques',
      toValue: metrics.cliques,
      rateName: 'CTR (Taxa de Cliques)',
      rateValue: metrics.ctr,
      unitCost: metrics.cpc,
      unitCostLabel: 'CPC Médio',
      benchmarkGood: 1.8,
      benchmarkWarn: 1.0,
      isHigherBetter: true,
      description: 'Capacidade do criativo (hook, promessa e imagem/vídeo) de captar atenção no feed ou busca e gerar o clique.',
    },
    {
      id: 'conexao',
      playbookId: 'conexao',
      fromName: 'Cliques',
      fromValue: metrics.cliques,
      toName: 'Acessos à Página',
      toValue: metrics.acessosPagina,
      rateName: 'Connect Rate (Taxa de Conexão)',
      rateValue: metrics.connectRate,
      unitCost: metrics.investimento > 0 && metrics.acessosPagina > 0 ? metrics.investimento / metrics.acessosPagina : 0,
      unitCostLabel: 'Custo por Acesso',
      benchmarkGood: 75.0,
      benchmarkWarn: 60.0,
      isHigherBetter: true,
      description: 'Percentual de pessoas que clicaram e efetivamente carregaram a Landing Page. Quedas indicam lentidão técnica ou abandono de carregamento.',
    },
    {
      id: 'conversao_lp',
      playbookId: 'conversao_lp',
      fromName: 'Acessos à Página',
      fromValue: metrics.acessosPagina,
      toName: 'Leads',
      toValue: metrics.leads,
      rateName: 'Taxa de Conversão da LP',
      rateValue: metrics.taxaConversaoLP,
      unitCost: metrics.cpl,
      unitCostLabel: 'CPL (Custo por Lead)',
      benchmarkGood: 18.0,
      benchmarkWarn: 10.0,
      isHigherBetter: true,
      description: 'Poder de persuasão da Landing Page: proposta de valor, clareza do formulário e coerência com a promessa do anúncio.',
    },
    {
      id: 'qualidade_mql',
      playbookId: 'qualidade_mql',
      fromName: 'Leads',
      fromValue: metrics.leads,
      toName: 'MQL (Marketing Qualified Leads)',
      toValue: metrics.mql,
      rateName: 'Taxa de MQL',
      rateValue: metrics.taxaMQL,
      unitCost: metrics.cpmql,
      unitCostLabel: 'CPMQL (Custo por MQL)',
      benchmarkGood: 60.0,
      benchmarkWarn: 40.0,
      isHigherBetter: true,
      description: 'Filtro inicial de perfil ideal de cliente (ICP), tamanho de empresa, segmento ou critérios mínimos de compra.',
    },
    {
      id: 'contato_sdr',
      playbookId: 'contato_sdr',
      fromName: 'Ligações Realizadas',
      fromValue: metrics.ligacoesRealizadas,
      toName: 'Ligações Atendidas',
      toValue: metrics.ligacoesAtendidas,
      rateName: 'Taxa de Atendimento (Speed-to-lead)',
      rateValue: metrics.taxaAtendimento,
      unitCost: metrics.custoLigacaoAtendida,
      unitCostLabel: 'Custo por Atendimento',
      benchmarkGood: 45.0,
      benchmarkWarn: 28.0,
      isHigherBetter: true,
      description: 'Capacidade da equipe de pré-vendas (SDR) de conectar rapidamente com o lead no timing ideal por WhatsApp/Telefone.',
    },
    {
      id: 'aceite_sal',
      playbookId: 'aceite_sal',
      fromName: 'Ligações Atendidas',
      fromValue: metrics.ligacoesAtendidas,
      toName: 'SAL (Sales Accepted Leads)',
      toValue: metrics.sal,
      rateName: 'Taxa de Aceite Comercial (SAL)',
      rateValue: metrics.taxaSAL,
      unitCost: metrics.custoSAL,
      unitCostLabel: 'Custo por SAL',
      benchmarkGood: 70.0,
      benchmarkWarn: 50.0,
      isHigherBetter: true,
      description: 'Aceite formal do lead pelo time comercial cumprindo os acordos de SLA de qualidade entre Marketing e Vendas.',
    },
    {
      id: 'qualificacao_sql',
      playbookId: 'qualificacao_sql',
      fromName: 'SAL',
      fromValue: metrics.sal,
      toName: 'SQL (Sales Qualified Leads)',
      toValue: metrics.sql,
      rateName: 'Conversão SAL > SQL',
      rateValue: metrics.salToSqlRate,
      unitCost: metrics.custoSQL,
      unitCostLabel: 'Custo por SQL',
      benchmarkGood: 65.0,
      benchmarkWarn: 45.0,
      isHigherBetter: true,
      description: 'Validação aprofundada de autoridade, dor real, orçamento e momento de compra na qualificação prévia.',
    },
    {
      id: 'agendamento_rm',
      playbookId: 'agendamento_rm',
      fromName: 'SQL',
      fromValue: metrics.sql,
      toName: 'RM Agendadas no Dia',
      toValue: metrics.rmAgendadas,
      rateName: 'Taxa de Agendamento',
      rateValue: metrics.sql > 0 ? (metrics.rmAgendadas / metrics.sql) * 100 : 0,
      unitCost: metrics.custoRMAgendada,
      unitCostLabel: 'Custo por RM Agendada',
      benchmarkGood: 80.0,
      benchmarkWarn: 60.0,
      isHigherBetter: true,
      description: 'Eficiência em transformar o lead qualificado em um compromisso fixado na agenda dos executivos de vendas.',
    },
    {
      id: 'comparecimento_show',
      playbookId: 'comparecimento_realizadas',
      fromName: 'Reuniões Programadas',
      fromValue: metrics.reunioesProgramadas,
      toName: 'Reuniões Realizadas',
      toValue: metrics.reunioesRealizadas,
      rateName: 'Taxa de Comparecimento (Show Rate)',
      rateValue: metrics.taxaComparecimento,
      unitCost: metrics.custoReuniaoRealizada,
      unitCostLabel: 'Custo por Reunião Realizada',
      benchmarkGood: 75.0,
      benchmarkWarn: 55.0,
      isHigherBetter: true,
      description: 'Presença efetiva do prospect na reunião agendada. Minimizado por cadências de lembretes em D-1, D-0 e WhatsApp.',
    },
    {
      id: 'fechamento_venda',
      playbookId: 'fechamento_vendas',
      fromName: 'Reuniões Realizadas',
      fromValue: metrics.reunioesRealizadas,
      toName: 'Vendas no Dia',
      toValue: metrics.vendas,
      rateName: 'Taxa de Fechamento (Win Rate)',
      rateValue: metrics.taxaFechamento,
      unitCost: metrics.cpv,
      unitCostLabel: 'CPV / CAC (Custo por Venda)',
      benchmarkGood: 25.0,
      benchmarkWarn: 12.0,
      isHigherBetter: true,
      description: 'Conversão da demonstração/diagnóstico comercial em contrato assinado e faturamento realizado.',
    },
  ];

  // Helper for health badge
  const getHealth = (val: number, good: number, warn: number, isHigherBetter: boolean) => {
    if (isHigherBetter) {
      if (val >= good) return { status: 'good', label: 'Saudável', icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
      if (val >= warn) return { status: 'warn', label: 'Atenção', icon: <AlertCircle className="w-4 h-4 text-amber-400" />, badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
      return { status: 'critical', label: 'Gargalo Crítico', icon: <XCircle className="w-4 h-4 text-rose-400" />, badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30' };
    } else {
      if (val <= good) return { status: 'good', label: 'Saudável', icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />, badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
      if (val <= warn) return { status: 'warn', label: 'Atenção', icon: <AlertCircle className="w-4 h-4 text-amber-400" />, badge: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
      return { status: 'critical', label: 'Gargalo Crítico', icon: <XCircle className="w-4 h-4 text-rose-400" />, badge: 'bg-rose-500/15 text-rose-400 border-rose-500/30' };
    }
  };

  const currentActiveStep = funnelSteps.find((s) => s.id === selectedStageId) || funnelSteps[1];
  const activePlaybook = STAGE_PLAYBOOKS.find((p) => p.id === currentActiveStep.playbookId);

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <GitFork className="w-5 h-5 text-indigo-400" />
            Funil Completo da Jornada: Taxas de Conversão & Nós de Fricção
          </h2>
          <p className="text-xs text-slate-400">
            Clique em qualquer etapa do funil para inspecionar os volumes, perdas e ações de otimização mapeadas na planilha
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> Acima do Benchmark
          </span>
          <span className="flex items-center gap-1 text-amber-400">
            <AlertCircle className="w-3.5 h-3.5" /> Atenção
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <XCircle className="w-3.5 h-3.5" /> Gargalo Crítico
          </span>
        </div>
      </div>

      {/* Two Column Layout: Funnel Pipeline on Left, Deep Dive & Action Plan on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Stages list (8 cols on desktop) */}
        <div className="lg:col-span-7 space-y-3">
          {funnelSteps.map((step, idx) => {
            const isSelected = selectedStageId === step.id;
            const health = getHealth(step.rateValue, step.benchmarkGood, step.benchmarkWarn, step.isHigherBetter);
            const dropOffCount = Math.max(0, step.fromValue - step.toValue);
            const dropOffPct = step.fromValue > 0 ? (dropOffCount / step.fromValue) * 100 : 0;

            return (
              <div
                key={step.id}
                onClick={() => setSelectedStageId(step.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-indigo-500 ring-1 ring-indigo-500/50 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  
                  {/* Left info: Step Sequence & Name */}
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-400">{step.fromName}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                        <span className="text-xs font-bold text-white">{step.toName}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-sm font-extrabold text-indigo-300">
                          {formatPercent(step.rateValue)}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          ({formatNumber(step.toValue)} de {formatNumber(step.fromValue)})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right info: Status Badge & Cost */}
                  <div className="flex flex-col items-end gap-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${health.badge}`}>
                      {health.icon}
                      {health.label}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {step.unitCostLabel}: <strong className="text-slate-200">{formatBRL(step.unitCost)}</strong>
                    </span>
                  </div>
                </div>

                {/* Progress Bar showing conversion */}
                <div className="mt-3 w-full bg-slate-950 h-2 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all ${
                      health.status === 'good'
                        ? 'bg-emerald-500'
                        : health.status === 'warn'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(4, step.rateValue))}%` }}
                  />
                </div>

                {/* Loss footnote */}
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <TrendingDown className="w-3 h-3 text-slate-500" />
                    Perda de {formatNumber(dropOffCount)} contatos ({formatPercent(dropOffPct)})
                  </span>
                  <span className="text-indigo-400 font-medium">
                    {isSelected ? 'Inspecionando Ações de Otimização →' : 'Clique para analisar'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Stage Inspection & Strategy Playbook (5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Card: Active Step Detailed Inspection */}
          <div className="sticky top-44 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            
            {/* Header of Active Step */}
            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 uppercase tracking-wider">
                  Etapa Selecionada
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {currentActiveStep.fromName} ➔ {currentActiveStep.toName}
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-2">
                {currentActiveStep.rateName}
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {currentActiveStep.description}
              </p>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 font-medium">Taxa Realizada</span>
                <div className="text-lg font-extrabold text-white mt-0.5">
                  {formatPercent(currentActiveStep.rateValue)}
                </div>
                <span className="text-[10px] text-slate-500">
                  Meta ideal: ≥ {formatPercent(currentActiveStep.benchmarkGood)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 font-medium">{currentActiveStep.unitCostLabel}</span>
                <div className="text-lg font-extrabold text-white mt-0.5">
                  {formatBRL(currentActiveStep.unitCost)}
                </div>
                <span className="text-[10px] text-slate-500">
                  Custo unitário na etapa
                </span>
              </div>
            </div>

            {/* Strategic Optimization Actions directly from the spreadsheet */}
            {activePlaybook && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Ações de Otimização da Planilha
                  </h4>
                </div>

                <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs font-semibold text-indigo-300">
                  Nó / Rotina Influenciável: {activePlaybook.nodeTitle}
                </div>

                <div className="space-y-2">
                  {activePlaybook.optimizationActions.map((action, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5 leading-relaxed hover:border-slate-700 transition-colors"
                    >
                      <div className="w-5 h-5 rounded bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <span>{action.replace(/^[0-9]+\.\s*/, '')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pro Tip Box */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
              <Compass className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-400 leading-relaxed">
                <strong className="text-slate-200">Recomendação Senior:</strong> Priorize sempre o gargalo mais próximo do topo onde houver grande volume de queda, pois qualquer ganho de 2% no topo multiplica exponencialmente as vendas finais.
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
