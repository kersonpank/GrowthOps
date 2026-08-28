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
  HelpCircle,
  Zap,
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

  const [activeTab, setActiveTab] = useState<'import' | 'export_webhook' | 'manage'>('import');
  const [sheetUrl, setSheetUrl] = useState<string>(() => SheetService.getSavedSheetUrl());
  const [webhookUrl, setWebhookUrl] = useState<string>(() => SheetService.getSavedWebhookUrl());
  const [copiedCode, setCopiedCode] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ loading: boolean; message?: string; success?: boolean }>({
    loading: false,
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSyncFromSheet = async () => {
    setSyncStatus({ loading: true });
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

  const handleSendAllToSheet = async () => {
    if (!webhookUrl) {
      setSyncStatus({
        loading: false,
        success: false,
        message: 'Por favor, insira a URL do Webhook do Google Apps Script.',
      });
      return;
    }

    setSyncStatus({ loading: true, message: 'Enviando registros para a planilha...' });
    const result = await SheetService.sendToGoogleAppsScript(webhookUrl, {
      records: currentRecords,
      action: 'overwrite',
    });

    setSyncStatus({
      loading: false,
      success: result.success,
      message: result.message,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Conexão & Sincronização com Google Sheets
              </h3>
              <p className="text-xs text-slate-400">
                Leia dados da sua planilha ou envie novos registros em tempo real
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
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-4 pt-2 gap-2">
          <button
            onClick={() => {
              setActiveTab('import');
              setSyncStatus({ loading: false });
            }}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'import'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            1. Puxar Dados da Planilha
          </button>

          <button
            onClick={() => {
              setActiveTab('export_webhook');
              setSyncStatus({ loading: false });
            }}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'export_webhook'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            2. Gravar na Planilha (Webhook)
          </button>

          <button
            onClick={() => {
              setActiveTab('manage');
              setSyncStatus({ loading: false });
            }}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'manage'
                ? 'border-indigo-500 text-indigo-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            3. Gerenciar Dados
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-xs">
          
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

          {/* TAB 1: IMPORT FROM GOOGLE SHEETS */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-1.5">
                <h4 className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Como importar as linhas da sua Planilha para o Cockpit:
                </h4>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  1. No Google Sheets, clique no botão azul <strong>Compartilhar</strong> no canto superior direito.<br />
                  2. Mude o Acesso Geral para <strong>"Qualquer pessoa com o link"</strong> como <strong>Leitor</strong> ou <strong>Editor</strong>.<br />
                  3. Cole o link da planilha abaixo e clique em <strong>"Importar Dados da Planilha"</strong>.
                </p>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">
                  URL da Planilha do Google (Link de Compartilhamento)
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
                  <span>Lê automaticamente colunas e valores diários</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSyncFromSheet}
                  disabled={syncStatus.loading || !sheetUrl}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${syncStatus.loading ? 'animate-spin' : ''}`} />
                  <span>{syncStatus.loading ? 'Importando...' : 'Importar Dados da Planilha Agora'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: EXPORT / WEBHOOK (GOOGLE APPS SCRIPT) */}
          {activeTab === 'export_webhook' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 space-y-2">
                <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Por que é necessário o Webhook do Google Apps Script?
                </h4>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Por regras de segurança da Google, nenhuma aplicação web externa consegue <strong>escrever dados diretamente</strong> em uma planilha apenas com o link de compartilhamento. Para permitir a escrita automática em tempo real, basta ativar um micro-script gratuito de 1 minuto na sua planilha:
                </p>
              </div>

              {/* Step by Step Guide */}
              <div className="space-y-2.5 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-[11px]">
                <span className="font-bold text-white block uppercase tracking-wider text-[10px] text-indigo-400">
                  Passo a Passo Rápido (Leva 1 minuto):
                </span>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                  <li>Na sua planilha do Google, clique no menu <strong>Extensões &gt; Apps Script</strong>.</li>
                  <li>Apague o código que estiver lá e <strong>cole o código abaixo</strong>.</li>
                  <li>Clique no botão azul superior <strong>Implantar &gt; Nova implantação</strong>.</li>
                  <li>Selecione o tipo <strong>App da Web</strong> (ícone de engrenagem).</li>
                  <li>Em <em>"Quem pode acessar"</em>, selecione <strong>Qualquer pessoa (Anyone)</strong> e clique em <em>Implantar</em>.</li>
                  <li>Copie a <strong>URL do App da Web</strong> fornecida pelo Google e cole no campo abaixo!</li>
                </ol>
              </div>

              {/* Code Snippet Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-indigo-400" />
                    Código para colar no Apps Script:
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 transition-colors font-medium text-[11px]"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? 'Código Copiado!' : 'Copiar Código'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 font-mono text-[10px] max-h-32 overflow-y-auto leading-normal">
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

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleSendAllToSheet}
                  disabled={syncStatus.loading || !webhookUrl}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Todos os Registros do Cockpit para a Planilha</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: MANAGE / CLEAR DATA */}
          {activeTab === 'manage' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-indigo-400" />
                  Estado Atual dos Dados no Navegador
                </h4>
                <p className="text-slate-300 text-[11px]">
                  Atualmente o sistema está exibindo <strong>{currentRecords.length} registros diários</strong>.
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
                      Remove os dados de exemplo pré-carregados para que você comece com o dashboard zerado ou apenas com os dados da sua planilha.
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
                    Limpar Dados de Exemplo (Zerar)
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
                      Recarrega a base completa de dados simulados com histórico consolidado dos canais Meta e Google.
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

