import React, { useState } from 'react';
import {
  X,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Database,
  RotateCcw,
  Send,
  Copy,
  Check,
  Trash2,
  Code,
  Zap,
  ClipboardPaste,
  FileSpreadsheet,
  Upload,
} from 'lucide-react';
import { SheetService, APPS_SCRIPT_TEMPLATE } from '../services/sheetService';
import { FunnelDailyRecord } from '../types';

interface SyncSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData: (records?: FunnelDailyRecord[]) => void;
  onResetDefaults: () => void;
  onClearData: () => void;
  currentRecords: FunnelDailyRecord[];
}

export const SyncSheetModal: React.FC<SyncSheetModalProps> = ({
  isOpen,
  onClose,
  onRefreshData,
  onResetDefaults,
  onClearData,
  currentRecords,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'paste_csv' | 'export_webhook' | 'sheet_url' | 'manage'>('paste_csv');
  const [sheetUrl, setSheetUrl] = useState<string>(() => SheetService.getSavedSheetUrl());
  const [webhookUrl, setWebhookUrl] = useState<string>(() => SheetService.getSavedWebhookUrl());
  const [csvInput, setCsvInput] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ loading: boolean; message?: string; success?: boolean }>({
    loading: false,
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // 1. Process Directly Pasted CSV or File
  const handleProcessCsvText = (textToProcess?: string) => {
    const raw = textToProcess !== undefined ? textToProcess : csvInput;
    if (!raw.trim()) {
      setSyncStatus({
        loading: false,
        success: false,
        message: 'Por favor, cole o texto CSV da planilha ou selecione um arquivo.',
      });
      return;
    }

    try {
      const records = SheetService.parseCsvToRecords(raw);
      if (records.length === 0) {
        setSyncStatus({
          loading: false,
          success: false,
          message: 'Nenhum dado válido de canais (Meta LP, Meta Form, Google) foi identificado no texto colado.',
        });
        return;
      }

      SheetService.saveRecords(records);
      onRefreshData(records);

      setSyncStatus({
        loading: false,
        success: true,
        message: `Sucesso! ${records.length} canais (Meta LP, Meta Form, Google) foram importados com precisão cirúrgica e o painel foi atualizado!`,
      });
    } catch (e: any) {
      setSyncStatus({
        loading: false,
        success: false,
        message: 'Erro ao interpretar o CSV: ' + (e.message || 'Formato desconhecido'),
      });
    }
  };

  // 2. Handle File Upload (.csv)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvInput(text);
      handleProcessCsvText(text);
    };
    reader.readAsText(file);
  };

  // 3. Sync from Google Sheet via Apps Script Webhook (GET)
  const handleFetchFromWebhook = async () => {
    if (!webhookUrl) {
      setSyncStatus({
        loading: false,
        success: false,
        message: 'Por favor, insira a URL do Webhook do Google Apps Script.',
      });
      return;
    }

    setSyncStatus({ loading: true, message: 'Consultando dados da planilha via Apps Script...' });
    const result = await SheetService.fetchFromAppsScriptWebhook(webhookUrl);
    setSyncStatus({
      loading: false,
      success: result.success,
      message: result.message,
    });

    if (result.success && result.records) {
      onRefreshData(result.records);
    }
  };

  // 4. Send to Google Sheet via Apps Script Webhook (POST)
  const handleSendAllToSheet = async () => {
    if (!webhookUrl) {
      setSyncStatus({
        loading: false,
        success: false,
        message: 'Por favor, insira a URL do Webhook do Google Apps Script.',
      });
      return;
    }

    setSyncStatus({ loading: true, message: 'Gravando dados nas células exatas da planilha...' });
    const result = await SheetService.sendToGoogleAppsScript(webhookUrl, {
      records: currentRecords,
    });

    setSyncStatus({
      loading: false,
      success: result.success,
      message: result.message,
    });
  };

  // 5. Sync from Google Sheet CSV URL (GET)
  const handleSyncFromUrl = async () => {
    setSyncStatus({ loading: true, message: 'Tentando download do arquivo CSV...' });
    const result = await SheetService.syncFromGoogleSheet(sheetUrl);
    setSyncStatus({
      loading: false,
      success: result.success,
      message: result.message,
    });

    if (result.success && result.records) {
      onRefreshData(result.records);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Conexão & Sincronização com a Planilha
              </h3>
              <p className="text-xs text-slate-400">
                Aba: <strong>"Painel nós da Jornada"</strong> (Meta LP, Meta Form, Google)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-4 pt-2 gap-1.5 overflow-x-auto">
          
          <button
            onClick={() => {
              setActiveTab('paste_csv');
              setSyncStatus({ loading: false });
            }}
            className={`px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
              activeTab === 'paste_csv'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ClipboardPaste className="w-3.5 h-3.5 text-emerald-400" />
            1. Colar CSV / Arquivo
          </button>

          <button
            onClick={() => {
              setActiveTab('export_webhook');
              setSyncStatus({ loading: false });
            }}
            className={`px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
              activeTab === 'export_webhook'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            2. Webhook Google Apps Script
          </button>

          <button
            onClick={() => {
              setActiveTab('sheet_url');
              setSyncStatus({ loading: false });
            }}
            className={`px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
              activeTab === 'sheet_url'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            3. Link da Planilha
          </button>

          <button
            onClick={() => {
              setActiveTab('manage');
              setSyncStatus({ loading: false });
            }}
            className={`px-3.5 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 shrink-0 ${
              activeTab === 'manage'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            4. Gerenciar
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          
          {/* Status Feedback Banner */}
          {syncStatus.message && (
            <div
              className={`p-3.5 rounded-2xl border flex items-start gap-2.5 transition-all ${
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
              <div className="flex-1 leading-relaxed">
                <span className="font-semibold block">{syncStatus.success ? 'Sucesso' : 'Atenção'}</span>
                <span>{syncStatus.message}</span>
              </div>
            </div>
          )}

          {/* TAB 1: PASTE CSV / UPLOAD FILE (INSTANT & 100% RELIABLE) */}
          {activeTab === 'paste_csv' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-1.5">
                <h4 className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <ClipboardPaste className="w-4 h-4 text-emerald-400" />
                  Importação Instantânea (100% à prova de erros de permissão ou CORS):
                </h4>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Basta colar o texto CSV da sua planilha abaixo (ou carregar o arquivo exportado) e clicar em <strong>"Importar Dados Agora"</strong>. O sistema identifica automaticamente a matriz de indicadores e os 3 canais (Meta LP, Meta Form, Google).
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-300 block">
                    Cole o conteúdo CSV da Planilha aqui:
                  </label>
                  <label className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors">
                    <Upload className="w-3 h-3 text-indigo-400" />
                    <span>Carregar Arquivo .CSV</span>
                    <input type="file" accept=".csv,text/csv" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
                <textarea
                  rows={6}
                  placeholder={`MÊS,Março,Março,Março,,...\nINDICADORES DA JORNADA,Meta (LP),Meta (Form),Google\nINVESTIMENTO,"R$ 0,00","R$ 0,00","R$ 0,00"\n...`}
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 font-mono text-[11px] text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                onClick={() => handleProcessCsvText()}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <Check className="w-4 h-4" />
                <span>Importar Dados do CSV Agora</span>
              </button>
            </div>
          )}

          {/* TAB 2: GOOGLE APPS SCRIPT WEBHOOK (BIDIRECTIONAL & SAFE) */}
          {activeTab === 'export_webhook' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-1.5">
                <h4 className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Conector Cirúrgico Google Apps Script (Leitura e Gravação Segura)
                </h4>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Este novo script foi reestruturado para ser <strong>100% não destrutivo</strong>: ele localiza as linhas exatas de cada indicador na aba <em>"Painel nós da Jornada"</em> e lê/grava <strong>apenas nas colunas B (Meta LP), C (Meta Form) e D (Google)</strong>, sem nunca apagar cabeçalhos, fórmulas ou o Playbook de ações das colunas F e G!
                </p>
              </div>

              {/* Step by Step Guide */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-[11px]">
                <span className="font-bold text-white block uppercase tracking-wider text-[10px] text-indigo-400">
                  Como Instalar na sua Planilha em 1 Minuto:
                </span>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                  <li>Na planilha, acesse <strong>Extensões &gt; Apps Script</strong>.</li>
                  <li>Substitua todo o conteúdo pelo <strong>código atualizado abaixo</strong>.</li>
                  <li>Clique em <strong>Implantar &gt; Nova implantação</strong> (tipo <strong>App da Web</strong>).</li>
                  <li>Defina <em>"Quem pode acessar"</em> como <strong>Qualquer pessoa (Anyone)</strong> e implante.</li>
                  <li>Copie a <strong>URL do App da Web</strong> gerada e cole no campo abaixo.</li>
                </ol>
              </div>

              {/* Code Snippet Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-indigo-400" />
                    Código Cirúrgico do Apps Script:
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 transition-colors font-medium text-[11px]"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? 'Código Copiado!' : 'Copiar Código'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 font-mono text-[10px] max-h-28 overflow-y-auto leading-normal">
                  {APPS_SCRIPT_TEMPLATE}
                </pre>
              </div>

              {/* Webhook Input */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">
                  URL do Webhook do Google Apps Script
                </label>
                <input
                  type="text"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 font-mono text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={handleFetchFromWebhook}
                  disabled={syncStatus.loading || !webhookUrl}
                  className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncStatus.loading ? 'animate-spin' : ''}`} />
                  <span>Puxar Dados da Planilha (GET)</span>
                </button>

                <button
                  onClick={handleSendAllToSheet}
                  disabled={syncStatus.loading || !webhookUrl}
                  className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gravar nas Células da Planilha (POST)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SHEET URL (CSV EXPORT) */}
          {activeTab === 'sheet_url' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-blue-950/20 border border-blue-500/20 space-y-1.5">
                <h4 className="font-bold text-blue-300 flex items-center gap-1.5">
                  <ExternalLink className="w-4 h-4" />
                  Importação por Link da Planilha
                </h4>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Para leitura direta por link público sem Webhook, certifique-se de que a planilha está configurada como <strong>"Qualquer pessoa com o link"</strong> ou utilize o menu <em>Arquivo &gt; Compartilhar &gt; Publicar na Web (formato CSV)</em>.
                </p>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">
                  URL da Planilha do Google
                </label>
                <input
                  type="text"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 font-mono text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                  <a
                    href={sheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 font-medium"
                  >
                    <span>Abrir planilha no Google Docs</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <button
                onClick={handleSyncFromUrl}
                disabled={syncStatus.loading || !sheetUrl}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${syncStatus.loading ? 'animate-spin' : ''}`} />
                <span>{syncStatus.loading ? 'Sincronizando...' : 'Sincronizar via Link CSV'}</span>
              </button>
            </div>
          )}

          {/* TAB 4: MANAGE DATA */}
          {activeTab === 'manage' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-indigo-400" />
                  Estado Atual dos Dados no Navegador
                </h4>
                <p className="text-slate-300 text-[11px]">
                  Atualmente o sistema está exibindo <strong>{currentRecords.length} canais/registros</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                
                {/* Clear demo data */}
                <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 flex flex-col justify-between space-y-3">
                  <div>
                    <h5 className="font-bold text-rose-300 flex items-center gap-1.5">
                      <Trash2 className="w-4 h-4 text-rose-400" />
                      Zerar / Limpar Dados
                    </h5>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      Limpa os registros para começar com o dashboard zerado ou pronto para carregar apenas os dados reais da sua planilha.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClearData();
                      setSyncStatus({
                        loading: false,
                        success: true,
                        message: 'Dados limpos com sucesso! O dashboard agora está zerado.',
                      });
                    }}
                    className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all text-xs"
                  >
                    Limpar Dados (Zerar)
                  </button>
                </div>

                {/* Restore Demo data */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-3">
                  <div>
                    <h5 className="font-bold text-slate-200 flex items-center gap-1.5">
                      <RotateCcw className="w-4 h-4 text-indigo-400" />
                      Restaurar Demonstração
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Recarrega a base completa de dados de exemplo com histórico consolidado dos canais Meta e Google.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onResetDefaults();
                      setSyncStatus({
                        loading: false,
                        success: true,
                        message: 'Dados de demonstração restaurados com sucesso!',
                      });
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-all text-xs"
                  >
                    Recarregar Dados Demo
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
