import React, { useState } from 'react';
import { X, Plus, Calculator, Check } from 'lucide-react';
import { FunnelDailyRecord } from '../types';
import { formatBRL, formatNumber, formatPercent, formatRatio } from '../utils/calculator';

interface NewEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: FunnelDailyRecord) => void;
}

export const NewEntryModal: React.FC<NewEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [channel, setChannel] = useState<'Meta (LP)' | 'Meta (Form)' | 'Google'>('Meta (LP)');
  const [month, setMonth] = useState('Abril');

  // Input states
  const [investimento, setInvestimento] = useState<number>(450);
  const [valorCaptacao, setValorCaptacao] = useState<number>(380);
  const [distribuicao, setDistribuicao] = useState<number>(70);
  const [impressoes, setImpressoes] = useState<number>(16000);
  const [cliques, setCliques] = useState<number>(320);
  const [acessosPagina, setAcessosPagina] = useState<number>(260);
  const [leads, setLeads] = useState<number>(52);
  const [mql, setMql] = useState<number>(34);
  const [ligacoesRealizadas, setLigacoesRealizadas] = useState<number>(32);
  const [ligacoesAtendidas, setLigacoesAtendidas] = useState<number>(18);
  const [sal, setSal] = useState<number>(14);
  const [sql, setSql] = useState<number>(10);
  const [rmAgendadas, setRmAgendadas] = useState<number>(8);
  const [reunioesProgramadas, setReunioesProgramadas] = useState<number>(8);
  const [reunioesRealizadas, setReunioesRealizadas] = useState<number>(6);
  const [noShow, setNoShow] = useState<number>(2);
  const [reagendamentos, setReagendamentos] = useState<number>(1);
  const [vendas, setVendas] = useState<number>(2);
  const [faturamento, setFaturamento] = useState<number>(9600);

  // Live computed preview
  const previewCpl = leads > 0 ? investimento / leads : 0;
  const previewRoas = investimento > 0 ? faturamento / investimento : 0;
  const previewCac = vendas > 0 ? investimento / vendas : 0;
  const previewShowRate = reunioesProgramadas > 0 ? (reunioesRealizadas / reunioesProgramadas) * 100 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: FunnelDailyRecord = {
      id: `${channel.replace(/[^a-zA-Z0-9]/g, '_')}_${date}_${Date.now()}`,
      date,
      month,
      channel,
      investimento: Number(investimento) || 0,
      valorCaptacao: Number(valorCaptacao) || 0,
      distribuicao: Number(distribuicao) || 0,
      impressoes: Number(impressoes) || 0,
      cliques: Number(cliques) || 0,
      acessosPagina: Number(acessosPagina) || 0,
      leads: Number(leads) || 0,
      mql: Number(mql) || 0,
      ligacoesRealizadas: Number(ligacoesRealizadas) || 0,
      ligacoesAtendidas: Number(ligacoesAtendidas) || 0,
      sal: Number(sal) || 0,
      sql: Number(sql) || 0,
      rmAgendadas: Number(rmAgendadas) || 0,
      reunioesProgramadas: Number(reunioesProgramadas) || 0,
      reunioesRealizadas: Number(reunioesRealizadas) || 0,
      noShow: Number(noShow) || 0,
      reagendamentos: Number(reagendamentos) || 0,
      vendas: Number(vendas) || 0,
      faturamento: Number(faturamento) || 0,
    };
    onSave(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-10">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              Novo Registro Diário de Produtividade
            </h3>
            <p className="text-xs text-slate-400">
              Insira os eventos consolidados do dia para recalcular todos os KPIs automaticamente
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 flex-1">
          
          {/* Channel, Date & Month Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Data</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Canal de Origem</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Meta (LP)">Meta (LP)</option>
                <option value="Meta (Form)">Meta (Form)</option>
                <option value="Google">Google Ads</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Mês de Referência</label>
              <input
                type="text"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Group 1: Mídia & Tráfego */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
              1. Mídia & Tráfego de Topo
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Investimento Total (R$)</label>
                <input
                  type="number"
                  value={investimento}
                  onChange={(e) => setInvestimento(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Impressões</label>
                <input
                  type="number"
                  value={impressoes}
                  onChange={(e) => setImpressoes(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Cliques</label>
                <input
                  type="number"
                  value={cliques}
                  onChange={(e) => setCliques(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Group 2: Página & Leads */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <span className="text-[11px] font-bold text-violet-400 uppercase tracking-wider block">
              2. Conexão & Qualificação Inicial
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Acessos à LP</label>
                <input
                  type="number"
                  value={acessosPagina}
                  onChange={(e) => setAcessosPagina(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Leads</label>
                <input
                  type="number"
                  value={leads}
                  onChange={(e) => setLeads(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">MQLs</label>
                <input
                  type="number"
                  value={mql}
                  onChange={(e) => setMql(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Group 3: Prospecção & Vendas */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
              3. Vendas & Fechamento
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">SQLs</label>
                <input
                  type="number"
                  value={sql}
                  onChange={(e) => setSql(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Reuniões Realizadas</label>
                <input
                  type="number"
                  value={reunioesRealizadas}
                  onChange={(e) => setReunioesRealizadas(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Vendas no Dia</label>
                <input
                  type="number"
                  value={vendas}
                  onChange={(e) => setVendas(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Faturamento (R$)</label>
                <input
                  type="number"
                  value={faturamento}
                  onChange={(e) => setFaturamento(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Live Preview Strip */}
          <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Prévia do Registro:</span>
            <div className="flex items-center gap-4">
              <span>CPL: <strong className="text-white">{formatBRL(previewCpl)}</strong></span>
              <span>CAC: <strong className="text-white">{formatBRL(previewCac)}</strong></span>
              <span>ROAS: <strong className="text-emerald-400">{formatRatio(previewRoas)}</strong></span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Registro Diário</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
