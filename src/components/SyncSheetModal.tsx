import React, { useState } from 'react';
import { X, RefreshCw, ExternalLink, CheckCircle, AlertTriangle, Database, RotateCcw } from 'lucide-react';
import { SheetService } from '../services/sheetService';

interface SyncSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData: () => void;
  onResetDefaults: () => void;
}

export const SyncSheetModal: React.FC<SyncSheetModalProps> = ({
  isOpen,
  onClose,
  onRefreshData,
  onResetDefaults,
}) => {
  if (!isOpen) return null;

  const defaultUrl = 'https://docs.google.com/spreadsheets/d/18c3Jv7LSmh7OwDVI3cMobiPZXklO4yyf3fWWwwAizo4/edit?gid=1314698631#gid=1314698631';
  const [sheetUrl, setSheetUrl] = useState(defaultUrl);
  const [syncStatus, setSyncStatus] = useState<{ loading: boolean; message?: string; success?: boolean }>({
    loading: false,
  });

  const handleSync = async () => {
    setSyncStatus({ loading: true });
    // Convert view URL to CSV export URL if needed
    let exportUrl = sheetUrl;
    if (exportUrl.includes('/edit')) {
      const gidMatch = exportUrl.match(/gid=([0-9]+)/);
      const gid = gidMatch ? gidMatch[1] : '1314698631';
      exportUrl = exportUrl.replace(/\/edit.*$/, `/export?format=csv&gid=${gid}`);
    }

    const result = await SheetService.syncFromGoogleSheet(exportUrl);
    setSyncStatus({
      loading: false,
      success: result.success,
      message: result.message,
    });

    if (result.success) {
      onRefreshData();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Sincronização com Google Sheets
              </h3>
              <p className="text-xs text-slate-400">
                Conexão direta com a planilha de jornada de aquisição e vendas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              URL da Planilha Google (Link de Visualização ou Exportação)
            </label>
            <input
              type="text"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <div className="mt-1.5 flex items-center justify-between text-[11px]">
              <a
                href={sheetUrl}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
              >
                <span>Abrir planilha no Google Docs</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <span className="text-slate-500">GID: 1314698631</span>
            </div>
          </div>

          {/* Sync Result Feedback */}
          {syncStatus.message && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                syncStatus.success
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
              }`}
            >
              {syncStatus.success ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <span>{syncStatus.message}</span>
            </div>
          )}

          {/* Info Card */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 space-y-2">
            <span className="text-slate-300 font-semibold block">Instruções de Acesso:</span>
            <ul className="list-disc list-inside space-y-1 text-[11px]">
              <li>Certifique-se de que a planilha possui permissão de compartilhamento pública ("Qualquer pessoa com o link").</li>
              <li>A aba ativa (GID 1314698631) contém a matriz de colunas: Meta (LP), Meta (Form) e Google.</li>
              <li>O cockpit calcula e projeta todos os gráficos e KPIs em tempo real a partir desses dados.</li>
            </ul>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              onClick={() => {
                onResetDefaults();
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Histórico Padrão</span>
            </button>

            <button
              onClick={handleSync}
              disabled={syncStatus.loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncStatus.loading ? 'animate-spin' : ''}`} />
              <span>{syncStatus.loading ? 'Sincronizando...' : 'Sincronizar Agora'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
