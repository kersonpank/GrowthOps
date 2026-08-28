import { FunnelDailyRecord } from '../types';
import { INITIAL_SEED_RECORDS } from '../data/seedData';

const LOCAL_STORAGE_KEY = 'growthops_funnel_records_v1';
const SHEET_URL_KEY = 'growthops_sheet_url_v1';
const WEBHOOK_URL_KEY = 'growthops_webhook_url_v1';

export const DEFAULT_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/18c3Jv7LSmh7OwDVI3cMobiPZXklO4yyf3fWWwwAizo4/edit?gid=1314698631#gid=1314698631';

export const APPS_SCRIPT_TEMPLATE = `function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Dados") || ss.getActiveSheet();
    var payload = JSON.parse(e.postData.contents);
    
    // Se receber múltiplos registros (array) ou registro único
    var records = Array.isArray(payload.records) ? payload.records : [payload];
    
    // Cria cabeçalho se a planilha estiver vazia
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Data", "Mês", "Canal", "Investimento Total (R$)", "Valor Captação (R$)", 
        "Distribuição (R$)", "Impressões", "Cliques", "Acessos LP", "Leads", 
        "MQL", "Ligações Realizadas", "Ligações Atendidas", "SAL", "SQL", 
        "RM Agendadas", "Reuniões Programadas", "Reuniões Realizadas", 
        "No Show", "Reagendamentos", "Vendas", "Faturamento (R$)"
      ]);
    }
    
    // Se ação for sobrescrever todos os dados
    if (payload.action === 'overwrite') {
      var headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 22);
      var headers = headerRange.getValues()[0];
      sheet.clearContents();
      sheet.appendRow(headers);
    }
    
    records.forEach(function(r) {
      sheet.appendRow([
        r.date || '',
        r.month || '',
        r.channel || 'Meta (LP)',
        r.investimento || 0,
        r.valorCaptacao || 0,
        r.distribuicao || 0,
        r.impressoes || 0,
        r.cliques || 0,
        r.acessosPagina || 0,
        r.leads || 0,
        r.mql || 0,
        r.ligacoesRealizadas || 0,
        r.ligacoesAtendidas || 0,
        r.sal || 0,
        r.sql || 0,
        r.rmAgendadas || 0,
        r.reunioesProgramadas || 0,
        r.reunioesRealizadas || 0,
        r.noShow || 0,
        r.reagendamentos || 0,
        r.vendas || 0,
        r.faturamento || 0
      ]);
    });
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", count: records.length }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: "ready", message: "GrowthOps Webhook Ativo" }))
    .setMimeType(ContentService.MimeType.JSON);
}`;

export class SheetService {
  public static getSavedSheetUrl(): string {
    return localStorage.getItem(SHEET_URL_KEY) || DEFAULT_SHEET_URL;
  }

  public static setSavedSheetUrl(url: string): void {
    localStorage.setItem(SHEET_URL_KEY, url);
  }

  public static getSavedWebhookUrl(): string {
    return localStorage.getItem(WEBHOOK_URL_KEY) || '';
  }

  public static setSavedWebhookUrl(url: string): void {
    localStorage.setItem(WEBHOOK_URL_KEY, url);
  }

  public static loadRecords(): FunnelDailyRecord[] {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading from localStorage:', e);
    }
    return INITIAL_SEED_RECORDS;
  }

  public static saveRecords(records: FunnelDailyRecord[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }

  public static clearAllRecords(): FunnelDailyRecord[] {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
    } catch (e) {
      console.error('Error clearing localStorage:', e);
    }
    return [];
  }

  public static resetToDefault(): FunnelDailyRecord[] {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_SEED_RECORDS));
    } catch (e) {
      console.error('Error resetting to seed in localStorage:', e);
    }
    return INITIAL_SEED_RECORDS;
  }

  /**
   * Helper to parse numerical and monetary values from spreadsheet strings
   */
  private static parseNumber(val: any): number {
    if (val === undefined || val === null) return 0;
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    let s = String(val).trim();
    if (!s) return 0;
    // Remove R$, %, spaces
    s = s.replace(/R\$/g, '').replace(/%/g, '').trim();
    // Handle Brazilian format (1.234,56 -> 1234.56)
    if (s.includes(',') && s.includes('.')) {
      if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
        s = s.replace(/\./g, '').replace(',', '.');
      } else {
        s = s.replace(/,/g, '');
      }
    } else if (s.includes(',')) {
      s = s.replace(',', '.');
    }
    const num = parseFloat(s);
    return isNaN(num) ? 0 : num;
  }

  /**
   * Converts Google Sheet View URL to CSV export link
   */
  public static normalizeSheetCsvUrl(rawUrl: string): string {
    let url = rawUrl.trim();
    if (url.includes('/edit') || url.includes('/view')) {
      const gidMatch = url.match(/gid=([0-9]+)/);
      const gid = gidMatch ? gidMatch[1] : '0';
      url = url.replace(/\/(edit|view).*$/, `/export?format=csv&gid=${gid}`);
    } else if (!url.includes('/export?format=csv')) {
      if (url.includes('docs.google.com/spreadsheets/d/')) {
        const idMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (idMatch) {
          url = `https://docs.google.com/spreadsheets/d/${idMatch[1]}/export?format=csv`;
        }
      }
    }
    return url;
  }

  /**
   * Robust CSV Line Splitter handling quotes and delimiters
   */
  public static parseCsvLines(csvText: string): string[][] {
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length === 0) return [];

    // Detect delimiter (, or ;)
    const firstLine = lines[0];
    const semicolonCount = (firstLine.match(/;/g) || []).length;
    const commaCount = (firstLine.match(/,/g) || []).length;
    const delimiter = semicolonCount > commaCount ? ';' : ',';

    return lines.map((line) => {
      const result: string[] = [];
      let current = '';
      let insideQuote = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          insideQuote = !insideQuote;
        } else if (char === delimiter && !insideQuote) {
          result.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^"|"$/g, ''));
      return result;
    });
  }

  /**
   * Parse CSV content from Google Sheets into structured FunnelDailyRecord objects
   */
  public static parseCsvToRecords(csvText: string): FunnelDailyRecord[] {
    const rows = this.parseCsvLines(csvText);
    if (rows.length < 2) return [];

    const headers = rows[0].map((h) => h.toLowerCase().trim());
    const findCol = (...keywords: string[]): number => {
      return headers.findIndex((h) => keywords.some((k) => h.includes(k.toLowerCase())));
    };

    const idxDate = findCol('data', 'date', 'dia');
    const idxMonth = findCol('mês', 'mes', 'month');
    const idxChannel = findCol('canal', 'origem', 'channel', 'fonte');
    const idxInvest = findCol('investimento', 'invest', 'gasto', 'custo total');
    const idxCaptacao = findCol('captação', 'captacao');
    const idxDistrib = findCol('distribuição', 'distribuicao');
    const idxImp = findCol('impress', 'imp');
    const idxCliques = findCol('clique', 'clicks');
    const idxAcessos = findCol('acesso', 'pageview', 'visita', 'sess');
    const idxLeads = findCol('lead', 'cadastro');
    const idxMql = findCol('mql');
    const idxLigacoes = findCol('ligações realizadas', 'ligacoes', 'dials', 'chamadas');
    const idxAtendidas = findCol('atendida', 'connect');
    const idxSal = findCol('sal', 'aceito');
    const idxSql = findCol('sql', 'qualificado');
    const idxRmAgendadas = findCol('rm agendadas', 'agendadas', 'marcadas');
    const idxProgramadas = findCol('programadas');
    const idxRealizadas = findCol('realizadas', 'compareceram', 'feitas');
    const idxNoShow = findCol('no show', 'noshow', 'faltas');
    const idxReagend = findCol('reagendamento', 'reagend');
    const idxVendas = findCol('venda', 'fechamento', 'clientes', 'deals');
    const idxFat = findCol('faturamento', 'receita', 'revenue', 'valor total');

    const parsedRecords: FunnelDailyRecord[] = [];

    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r || r.length === 0 || !r.some((cell) => cell.trim().length > 0)) continue;

      const rawDate = idxDate >= 0 && r[idxDate] ? r[idxDate].trim() : '';
      if (!rawDate && !r[idxInvest >= 0 ? idxInvest : 0]) continue;

      let dateFormatted = rawDate;
      // Handle DD/MM/YYYY to YYYY-MM-DD
      if (rawDate.includes('/')) {
        const parts = rawDate.split('/');
        if (parts.length === 3) {
          const day = parts[0].padStart(2, '0');
          const month = parts[1].padStart(2, '0');
          const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
          dateFormatted = `${year}-${month}-${day}`;
        }
      }

      let channelRaw = idxChannel >= 0 && r[idxChannel] ? r[idxChannel].trim() : 'Meta (LP)';
      let channel: 'Meta (LP)' | 'Meta (Form)' | 'Google' = 'Meta (LP)';
      if (channelRaw.toLowerCase().includes('form')) channel = 'Meta (Form)';
      else if (channelRaw.toLowerCase().includes('google')) channel = 'Google';
      else channel = 'Meta (LP)';

      const investimento = idxInvest >= 0 ? this.parseNumber(r[idxInvest]) : 0;
      const valorCaptacao = idxCaptacao >= 0 ? this.parseNumber(r[idxCaptacao]) : investimento * 0.85;
      const distribuicao = idxDistrib >= 0 ? this.parseNumber(r[idxDistrib]) : investimento - valorCaptacao;
      const impressoes = idxImp >= 0 ? this.parseNumber(r[idxImp]) : 0;
      const cliques = idxCliques >= 0 ? this.parseNumber(r[idxCliques]) : 0;
      const acessosPagina = idxAcessos >= 0 ? this.parseNumber(r[idxAcessos]) : cliques;
      const leads = idxLeads >= 0 ? this.parseNumber(r[idxLeads]) : 0;
      const mql = idxMql >= 0 ? this.parseNumber(r[idxMql]) : 0;
      const ligacoesRealizadas = idxLigacoes >= 0 ? this.parseNumber(r[idxLigacoes]) : 0;
      const ligacoesAtendidas = idxAtendidas >= 0 ? this.parseNumber(r[idxAtendidas]) : 0;
      const sal = idxSal >= 0 ? this.parseNumber(r[idxSal]) : 0;
      const sql = idxSql >= 0 ? this.parseNumber(r[idxSql]) : 0;
      const rmAgendadas = idxRmAgendadas >= 0 ? this.parseNumber(r[idxRmAgendadas]) : 0;
      const reunioesProgramadas = idxProgramadas >= 0 ? this.parseNumber(r[idxProgramadas]) : rmAgendadas;
      const reunioesRealizadas = idxRealizadas >= 0 ? this.parseNumber(r[idxRealizadas]) : 0;
      const noShow = idxNoShow >= 0 ? this.parseNumber(r[idxNoShow]) : 0;
      const reagendamentos = idxReagend >= 0 ? this.parseNumber(r[idxReagend]) : 0;
      const vendas = idxVendas >= 0 ? this.parseNumber(r[idxVendas]) : 0;
      const faturamento = idxFat >= 0 ? this.parseNumber(r[idxFat]) : 0;
      const month = idxMonth >= 0 && r[idxMonth] ? r[idxMonth] : 'Geral';

      parsedRecords.push({
        id: `row_${i}_${Date.now()}`,
        date: dateFormatted || new Date().toISOString().slice(0, 10),
        month,
        channel,
        investimento,
        valorCaptacao,
        distribuicao,
        impressoes,
        cliques,
        acessosPagina,
        leads,
        mql,
        ligacoesRealizadas,
        ligacoesAtendidas,
        sal,
        sql,
        rmAgendadas,
        reunioesProgramadas,
        reunioesRealizadas,
        noShow,
        reagendamentos,
        vendas,
        faturamento,
      });
    }

    return parsedRecords;
  }

  /**
   * Syncs from Google Sheets CSV URL, parses the rows and updates storage
   */
  public static async syncFromGoogleSheet(
    customUrl?: string
  ): Promise<{ success: boolean; message: string; count?: number; records?: FunnelDailyRecord[] }> {
    const rawUrl = customUrl || this.getSavedSheetUrl();
    this.setSavedSheetUrl(rawUrl);

    const exportUrl = this.normalizeSheetCsvUrl(rawUrl);

    try {
      const response = await fetch(exportUrl, {
        method: 'GET',
        headers: {
          Accept: 'text/csv, text/plain, */*',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}: Não foi possível acessar a planilha.`);
      }

      const csvText = await response.text();
      if (!csvText || csvText.includes('<!DOCTYPE html>')) {
        throw new Error(
          'A planilha retornou uma página de login HTML. Certifique-se de configurar o compartilhamento como "Qualquer pessoa com o link pode ver".'
        );
      }

      const parsed = this.parseCsvToRecords(csvText);

      if (parsed.length === 0) {
        return {
          success: true,
          message: 'Planilha acessada com sucesso, porém nenhuma linha de dados foi encontrada.',
          count: 0,
          records: [],
        };
      }

      // Save to localStorage
      this.saveRecords(parsed);

      return {
        success: true,
        message: `${parsed.length} registros sincronizados e importados com sucesso da sua planilha Google!`,
        count: parsed.length,
        records: parsed,
      };
    } catch (err: any) {
      console.warn('Sync failed:', err);
      return {
        success: false,
        message: err.message || 'Falha ao conectar com o Google Sheets.',
      };
    }
  }

  /**
   * Sends data directly to Google Sheet using a Google Apps Script Web App (Webhook)
   */
  public static async sendToGoogleAppsScript(
    webhookUrl: string,
    data: { records?: FunnelDailyRecord[]; action?: 'append' | 'overwrite' } | FunnelDailyRecord
  ): Promise<{ success: boolean; message: string }> {
    if (!webhookUrl || !webhookUrl.startsWith('https://script.google.com/')) {
      return {
        success: false,
        message: 'A URL do Webhook deve começar com https://script.google.com/macros/s/...',
      };
    }

    try {
      this.setSavedWebhookUrl(webhookUrl);
      
      const payload = Array.isArray((data as any).records)
        ? data
        : (data as any).date
        ? { records: [data], action: 'append' }
        : data;

      // Use fetch with no-cors or standard POST
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors', // Apps Script redirect requires no-cors in browser
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      return {
        success: true,
        message: 'Dados enviados com sucesso para a planilha via Google Apps Script!',
      };
    } catch (err: any) {
      console.error('Webhook error:', err);
      return {
        success: false,
        message: 'Erro ao enviar dados para o Webhook: ' + (err.message || 'Falha de rede'),
      };
    }
  }

  public static exportToCSV(records: FunnelDailyRecord[]): void {
    const headers = [
      'Data',
      'Mês',
      'Canal',
      'Investimento (R$)',
      'Valor Captação (R$)',
      'Distribuição (R$)',
      'Impressões',
      'Cliques',
      'Acessos Página',
      'Leads',
      'MQL',
      'Ligações Realizadas',
      'Ligações Atendidas',
      'SAL',
      'SQL',
      'RM Agendadas',
      'Reuniões Programadas',
      'Reuniões Realizadas',
      'No Show',
      'Reagendamentos',
      'Vendas',
      'Faturamento (R$)',
    ];

    const rows = records.map((r) => [
      r.date,
      r.month,
      r.channel,
      r.investimento,
      r.valorCaptacao,
      r.distribuicao,
      r.impressoes,
      r.cliques,
      r.acessosPagina,
      r.leads,
      r.mql,
      r.ligacoesRealizadas,
      r.ligacoesAtendidas,
      r.sal,
      r.sql,
      r.rmAgendadas,
      r.reunioesProgramadas,
      r.reunioesRealizadas,
      r.noShow,
      r.reagendamentos,
      r.vendas,
      r.faturamento,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `growthops_funil_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

