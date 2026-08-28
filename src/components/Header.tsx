import React, { useState } from 'react';
import {
  BarChart3,
  GitFork,
  DollarSign,
  Compass,
  Calculator,
  Table as TableIcon,
  RefreshCw,
  Plus,
  Download,
  Filter,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { ChannelType, DateRangePreset, ViewTab } from '../types';

interface HeaderProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  selectedChannel: ChannelType;
  setSelectedChannel: (channel: ChannelType) => void;
  datePreset: DateRangePreset;
  setDatePreset: (preset: DateRangePreset) => void;
  onOpenNewEntry: () => void;
  onOpenSyncModal: () => void;
  onExportCSV: () => void;
  isSyncing: boolean;
  lastSyncTime: Date | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedChannel,
  setSelectedChannel,
  datePreset,
  setDatePreset,
  onOpenNewEntry,
  onOpenSyncModal,
  onExportCSV,
  isSyncing,
  lastSyncTime,
}) => {
  const [showChannelDropdown, setShowChannelDropdown] = useState(false);

  const channels: { id: ChannelType; label: string; dotColor: string }[] = [
    { id: 'Todos', label: 'Visão Geral (Blended)', dotColor: 'bg-indigo-500' },
    { id: 'Meta (LP)', label: 'Meta Ads (Landing Page)', dotColor: 'bg-blue-500' },
    { id: 'Meta (Form)', label: 'Meta Ads (Formulário Nativo)', dotColor: 'bg-cyan-500' },
    { id: 'Google', label: 'Google Ads (Search & PMax)', dotColor: 'bg-emerald-500' },
  ];

  const datePresets: { id: DateRangePreset; label: string }[] = [
    { id: '7d', label: 'Últimos 7d' },
    { id: '14d', label: '14 dias' },
    { id: '30d', label: '30 dias' },
    { id: 'month', label: 'Mês Atual' },
    { id: 'all', label: 'Todo o Período' },
  ];

  const navTabs: { id: ViewTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Cockpit Executivo', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'funnel', label: 'Funil da Jornada', icon: <GitFork className="w-4 h-4" /> },
    { id: 'uniteconomics', label: 'Economia Unitária & CAC', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'playbook', label: 'Diagnóstico & Otimizações', icon: <Compass className="w-4 h-4" /> },
    { id: 'simulator', label: 'Simulador de Metas', icon: <Calculator className="w-4 h-4" /> },
    { id: 'datagrid', label: 'Matriz de Dados', icon: <TableIcon className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      {/* Top bar: Brand, Status, Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo and System Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-blue-600 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Layers className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  GrowthOps Cockpit
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    PRO
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400">
                Matriz de Inteligência de Funil & Vendas em Tempo Real
              </p>
            </div>
          </div>

          {/* Center/Right Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Google Sheets Connection Pill */}
            <button
              onClick={onOpenSyncModal}
              title="Configurações e Sincronização com Google Sheets"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-300 hover:text-white transition-all shadow-sm group"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Planilha Google</span>
              <RefreshCw className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
            </button>

            {/* Export CSV */}
            <button
              onClick={onExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Exportar</span>
            </button>

            {/* Quick Log Action */}
            <button
              onClick={onOpenNewEntry}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Dia</span>
            </button>
          </div>
        </div>

        {/* Sub-bar: Filters & Channel Tabs */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/60 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Channel Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-xl border border-slate-800 overflow-x-auto scrollbar-none">
            {channels.map((ch) => {
              const active = selectedChannel === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChannel(ch.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    active
                      ? 'bg-slate-800 text-white shadow-sm font-semibold border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${ch.dotColor}`} />
                  <span>{ch.label}</span>
                </button>
              );
            })}
          </div>

          {/* Date Presets */}
          <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800 self-start lg:self-auto overflow-x-auto">
            {datePresets.map((dp) => {
              const active = datePreset === dp.id;
              return (
                <button
                  key={dp.id}
                  onClick={() => setDatePreset(dp.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                  }`}
                >
                  {dp.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-3 flex items-center gap-1 overflow-x-auto scrollbar-none border-b border-transparent">
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
