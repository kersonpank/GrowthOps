import React, { useState } from 'react';
import {
  Compass,
  AlertTriangle,
  CheckCircle2,
  ListTodo,
  Layers,
  Sparkles,
  ArrowRight,
  Filter,
  CheckSquare,
  Square,
  Zap,
} from 'lucide-react';
import { ComputedMetrics } from '../types';
import { STAGE_PLAYBOOKS } from '../data/optimizationPlaybook';
import { formatBRL, formatPercent, formatRatio } from '../utils/calculator';

interface OptimizationPlaybookProps {
  metrics: ComputedMetrics;
}

export const OptimizationPlaybook: React.FC<OptimizationPlaybookProps> = ({ metrics }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});

  const toggleAction = (actionKey: string) => {
    setCompletedActions((prev) => ({
      ...prev,
      [actionKey]: !prev[actionKey],
    }));
  };

  // Senior Growth AI Diagnostics Engine: Evaluate current real data against spreadsheet standards
  const diagnosticFindings: {
    id: string;
    stageTitle: string;
    level: 'critical' | 'warning' | 'scale';
    title: string;
    description: string;
    currentValue: string;
    targetValue: string;
    actions: string[];
  }[] = [];

  // Check 1: Connect Rate (Cliques > LP)
  if (metrics.connectRate < 70) {
    diagnosticFindings.push({
      id: 'connect_diag',
      stageTitle: 'CONEXÃO — CLIQUE > PÁGINA',
      level: metrics.connectRate < 60 ? 'critical' : 'warning',
      title: 'Perda Excessiva no Carregamento da LP (Connect Rate)',
      description: `Apenas ${formatPercent(metrics.connectRate)} das pessoas que clicaram conseguiram abrir a página. Perda direta de verba entre o clique e o carregamento.`,
      currentValue: formatPercent(metrics.connectRate),
      targetValue: '≥ 75.0%',
      actions: [
        'Melhorar velocidade e estabilidade da página (Core Web Vitals & CDN).',
        'Verificar URL, redirecionamentos e experiência móvel (90%+ do tráfego).',
        'Corrigir perdas técnicas entre clique e carregamento de tags.',
      ],
    });
  }

  // Check 2: Conversão da Página
  if (metrics.taxaConversaoLP < 15) {
    diagnosticFindings.push({
      id: 'conv_lp_diag',
      stageTitle: 'CONVERSÃO — PÁGINA > LEAD',
      level: metrics.taxaConversaoLP < 10 ? 'critical' : 'warning',
      title: 'Taxa de Conversão da Landing Page Abaixo do Esperado',
      description: `Conversão atual em ${formatPercent(metrics.taxaConversaoLP)}. Indica desalinhamento entre o criativo de anúncio e o topo da página (Hook & Promessa).`,
      currentValue: formatPercent(metrics.taxaConversaoLP),
      targetValue: '≥ 18.0%',
      actions: [
        'Alinhar página e promessa do anúncio (Message Match).',
        'Testar título principal, formulário mais enxuto e prova social relevante.',
        'Reduzir fricção e campos desnecessários no formulário.',
        'Executar testes A/B de headline e oferta.',
      ],
    });
  }

  // Check 3: Show Rate (Comparecimento)
  if (metrics.taxaComparecimento < 70) {
    diagnosticFindings.push({
      id: 'show_rate_diag',
      stageTitle: 'COMPARECIMENTO — REALIZADAS',
      level: metrics.taxaComparecimento < 55 ? 'critical' : 'warning',
      title: 'Alto Índice de Faltas em Reuniões Agendadas (No-Show)',
      description: `Show rate em ${formatPercent(metrics.taxaComparecimento)} (No-Show em ${formatPercent(metrics.taxaNoShow)}). Aumenta o custo comercial por reunião realizada.`,
      currentValue: formatPercent(metrics.taxaComparecimento),
      targetValue: '≥ 75.0%',
      actions: [
        'Enviar lembretes automáticos multicanal (WhatsApp D-1 e 1h antes da call).',
        'Entregar material preparatório, vídeo rápido de introdução ou case.',
        'Recuperar rapidamente faltas e reagendamentos no mesmo dia.',
      ],
    });
  }

  // Check 4: Taxa de Fechamento / Vendas
  if (metrics.taxaFechamento < 20) {
    diagnosticFindings.push({
      id: 'close_rate_diag',
      stageTitle: 'FECHAMENTO — VENDAS NO DIA',
      level: metrics.taxaFechamento < 12 ? 'critical' : 'warning',
      title: 'Oportunidade no Roteiro de Fechamento & Objeções',
      description: `Conversão de reunião realizada para venda em ${formatPercent(metrics.taxaFechamento)}.`,
      currentValue: formatPercent(metrics.taxaFechamento),
      targetValue: '≥ 25.0%',
      actions: [
        'Revisar diagnóstico, proposta e matriz de contorno de objeções.',
        'Acompanhar gravações de vendas perdidas para encontrar padrões de recusa.',
        'Estruturar follow-up com prazo formal e próximo passo agendado na call.',
      ],
    });
  }

  // Check 5: Scale Opportunity if ROAS is very high
  if (metrics.roas >= 3.5) {
    diagnosticFindings.push({
      id: 'scale_diag',
      stageTitle: 'ECONOMIA — TICKET / ROAS',
      level: 'scale',
      title: 'Janela de Oportunidade para Escalar Orçamento',
      description: `ROAS saudável em ${formatRatio(metrics.roas)} com CAC equilibrado de ${formatBRL(metrics.cpv)}. Cenário ideal para aumento gradativo de investimento diário.`,
      currentValue: formatRatio(metrics.roas),
      targetValue: 'Escalar orçamento com segurança',
      actions: [
        'Aumentar orçamento em 15% a cada 3 dias nos conjuntos de anúncio campeões.',
        'Ampliar públicos semelhantes (Lookalike) e expansão de palavras-chave.',
        'Garantir capacidade de atendimento do time de vendas antes de dobrar o volume.',
      ],
    });
  }

  const categories = [
    { id: 'all', label: 'Todos os Nós' },
    { id: 'Investimento', label: 'Investimento' },
    { id: 'Entrega', label: 'Entrega' },
    { id: 'Atração', label: 'Atração' },
    { id: 'Conexão', label: 'Conexão' },
    { id: 'Conversão', label: 'Conversão LP' },
    { id: 'Qualidade', label: 'Qualidade MQL' },
    { id: 'Contato', label: 'Contato SDR' },
    { id: 'Aceite', label: 'Aceite SAL' },
    { id: 'Comparecimento', label: 'Comparecimento' },
    { id: 'Fechamento', label: 'Fechamento' },
    { id: 'Economia', label: 'Economia & ROAS' },
  ];

  const filteredPlaybooks = selectedCategory === 'all'
    ? STAGE_PLAYBOOKS
    : STAGE_PLAYBOOKS.filter((p) => p.category === selectedCategory);

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            Matriz Estratégica: Nós Influenciáveis & Ações de Otimização
          </h2>
          <p className="text-xs text-slate-400">
            Playbook operacional da planilha com diagnóstico analítico em tempo real dos gargalos da operação
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono">
            {STAGE_PLAYBOOKS.length} Nós Mapeados
          </span>
        </div>
      </div>

      {/* Automated Senior Growth Diagnostic Box */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-indigo-500/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Diagnóstico Automatizado de Gargalos (Growth Ops AI)
              </h3>
              <p className="text-xs text-slate-400">
                Identificação instantânea dos pontos de maior vazamento de receita baseada nos dados atuais
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            {diagnosticFindings.length} Alertas Ativos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {diagnosticFindings.map((finding) => {
            const isCritical = finding.level === 'critical';
            const isScale = finding.level === 'scale';
            return (
              <div
                key={finding.id}
                className={`p-4 rounded-xl border flex flex-col justify-between ${
                  isCritical
                    ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                    : isScale
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                    : 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider mb-2">
                    <span className="text-slate-400 font-mono line-clamp-1">{finding.stageTitle}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] ${
                        isCritical
                          ? 'bg-rose-500/20 text-rose-300'
                          : isScale
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {isCritical ? 'Gargalo Crítico' : isScale ? 'Escala' : 'Atenção'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1.5">
                    {finding.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {finding.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 mb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Atual</span>
                      <strong className="text-white">{finding.currentValue}</strong>
                    </div>
                    <div className="border-l border-slate-700 pl-3">
                      <span className="text-[10px] text-slate-400 block">Meta</span>
                      <strong className="text-emerald-400">{finding.targetValue}</strong>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Ação Recomendada:
                  </span>
                  <div className="text-xs text-slate-200 flex items-start gap-2">
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    <span>{finding.actions[0]}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const active = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                active
                  ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Playbook Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPlaybooks.map((playbook) => (
          <div
            key={playbook.id}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all shadow-sm flex flex-col justify-between space-y-4"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 uppercase tracking-wider">
                  {playbook.category}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {playbook.metricName}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mt-2 mb-1">
                {playbook.nodeTitle}
              </h3>
            </div>

            {/* Actions Checklist */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ListTodo className="w-3.5 h-3.5 text-indigo-400" />
                Ações de Otimização Mapeadas:
              </span>

              {playbook.optimizationActions.map((action, idx) => {
                const actionKey = `${playbook.id}_${idx}`;
                const isChecked = !!completedActions[actionKey];

                return (
                  <div
                    key={idx}
                    onClick={() => toggleAction(actionKey)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                      isChecked
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-400 line-through'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <button
                      type="button"
                      className="mt-0.5 text-slate-400 hover:text-indigo-400 shrink-0"
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                    <span className="leading-relaxed">{action}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
