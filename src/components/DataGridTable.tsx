import React, { useState } from 'react';
import {
  Table as TableIcon,
  Search,
  ArrowUpDown,
  Download,
  Plus,
  Trash2,
  Edit2,
  Filter,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { FunnelDailyRecord } from '../types';
import { formatBRL, formatNumber, formatPercent, formatRatio } from '../utils/calculator';

interface DataGridTableProps {
  records: FunnelDailyRecord[];
  onAddEntry: () => void;
  onDeleteRecord: (id: string) => void;
  onExportCSV: () => void;
}

export const DataGridTable: React.FC<DataGridTableProps> = ({
  records,
  onAddEntry,
  onDeleteRecord,
  onExportCSV,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof FunnelDailyRecord>('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const handleSort = (field: keyof FunnelDailyRecord) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Filter records
  const filtered = records.filter((r) => {
    const matchesSearch =
      r.date.includes(searchTerm) ||
      r.month.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.channel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesChannel = channelFilter === 'all' || r.channel === channelFilter;
    return matchesSearch && matchesChannel;
  });

  // Sort records
  const sorted = [...filtered].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    return sortAsc
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  const totalPages = Math.ceil(sorted.length / pageSize) || 1;
  const paginated = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Calculate Column Totals for current filtered set
  const totals = filtered.reduce(
    (acc, cur) => {
      acc.investimento += cur.investimento;
      acc.impressoes += cur.impressoes;
      acc.cliques += cur.cliques;
      acc.leads += cur.leads;
      acc.mql += cur.mql;
      acc.sal += cur.sal;
      acc.sql += cur.sql;
      acc.reunioesRealizadas += cur.reunioesRealizadas;
      acc.vendas += cur.vendas;
      acc.faturamento += cur.faturamento;
      return acc;
    },
    {
      investimento: 0,
      impressoes: 0,
      cliques: 0,
      leads: 0,
      mql: 0,
      sal: 0,
      sql: 0,
      reunioesRealizadas: 0,
      vendas: 0,
      faturamento: 0,
    }
  );

  return (
    <div className="space-y-4">
      
      {/* Table Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por data ou mês..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-52"
            />
          </div>

          {/* Channel Filter */}
          <select
            value={channelFilter}
            onChange={(e) => {
              setChannelFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Todos os Canais</option>
            <option value="Meta (LP)">Meta (LP)</option>
            <option value="Meta (Form)">Meta (Form)</option>
            <option value="Google">Google Ads</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={onAddEntry}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Registro</span>
          </button>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold select-none">
                <th
                  onClick={() => handleSort('date')}
                  className="py-3 px-3.5 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Data</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-600" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('channel')}
                  className="py-3 px-3.5 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Canal</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-600" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('investimento')}
                  className="py-3 px-3.5 cursor-pointer hover:text-white transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Invest. (R$)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-600" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('cliques')}
                  className="py-3 px-3.5 cursor-pointer hover:text-white transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Cliques</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-600" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('leads')}
                  className="py-3 px-3.5 cursor-pointer hover:text-white transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Leads</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-600" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('mql')}
                  className="py-3 px-3.5 cursor-pointer hover:text-white transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>MQL</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-600" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('sql')}
                  className="py-3 px-3.5 cursor-pointer hover:text-white transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>SQL</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-600" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('reunioesRealizadas')}
                  className="py-3 px-3.5 cursor-pointer hover:text-white transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Reuniões</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-600" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('vendas')}
                  className="py-3 px-3.5 cursor-pointer hover:text-white transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Vendas</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-600" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('faturamento')}
                  className="py-3 px-3.5 cursor-pointer hover:text-white transition-colors text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Faturamento</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-600" />
                  </div>
                </th>
                <th className="py-3 px-3.5 text-right font-semibold">ROAS</th>
                <th className="py-3 px-3.5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
              {paginated.map((r) => {
                const rowRoas = r.investimento > 0 ? r.faturamento / r.investimento : 0;
                return (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3.5 text-slate-300">{r.date}</td>
                    <td className="py-2.5 px-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-sans font-medium ${
                          r.channel === 'Meta (LP)'
                            ? 'bg-blue-500/15 text-blue-300 border border-blue-500/20'
                            : r.channel === 'Meta (Form)'
                            ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/20'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20'
                        }`}
                      >
                        {r.channel}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-right text-slate-200">
                      {formatBRL(r.investimento)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right text-slate-400">
                      {formatNumber(r.cliques)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right text-violet-300 font-semibold">
                      {formatNumber(r.leads)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right text-purple-300">
                      {formatNumber(r.mql)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right text-pink-300">
                      {formatNumber(r.sql)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right text-amber-300">
                      {formatNumber(r.reunioesRealizadas)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-bold text-white">
                      {formatNumber(r.vendas)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right font-bold text-emerald-400">
                      {formatBRL(r.faturamento)}
                    </td>
                    <td className="py-2.5 px-3.5 text-right">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                          rowRoas >= 4.0
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : rowRoas >= 2.0
                            ? 'text-blue-400 bg-blue-500/10'
                            : 'text-amber-400 bg-amber-500/10'
                        }`}
                      >
                        {formatRatio(rowRoas)}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-center">
                      <button
                        onClick={() => onDeleteRecord(r.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Excluir linha"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* Summary Footer */}
            <tfoot>
              <tr className="bg-slate-950 border-t-2 border-slate-700 font-bold text-white text-xs font-mono">
                <td className="py-3 px-3.5 font-sans">TOTAL ({filtered.length} reg)</td>
                <td className="py-3 px-3.5 text-slate-400 font-sans">Todos</td>
                <td className="py-3 px-3.5 text-right text-blue-400">{formatBRL(totals.investimento)}</td>
                <td className="py-3 px-3.5 text-right">{formatNumber(totals.cliques)}</td>
                <td className="py-3 px-3.5 text-right text-violet-300">{formatNumber(totals.leads)}</td>
                <td className="py-3 px-3.5 text-right text-purple-300">{formatNumber(totals.mql)}</td>
                <td className="py-3 px-3.5 text-right text-pink-300">{formatNumber(totals.sql)}</td>
                <td className="py-3 px-3.5 text-right text-amber-300">{formatNumber(totals.reunioesRealizadas)}</td>
                <td className="py-3 px-3.5 text-right text-emerald-400">{formatNumber(totals.vendas)}</td>
                <td className="py-3 px-3.5 text-right text-emerald-400">{formatBRL(totals.faturamento)}</td>
                <td className="py-3 px-3.5 text-right text-amber-400">
                  {totals.investimento > 0 ? formatRatio(totals.faturamento / totals.investimento) : '0x'}
                </td>
                <td className="py-3 px-3.5"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Mostrando {(currentPage - 1) * pageSize + 1} a{' '}
            {Math.min(currentPage * pageSize, sorted.length)} de {sorted.length} registros
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
