import { FunnelDailyRecord } from '../types';
import { INITIAL_SEED_RECORDS } from '../data/seedData';

const LOCAL_STORAGE_KEY = 'growthops_funnel_records_v1';
const SHEET_URL_KEY = 'growthops_sheet_url_v1';
const WEBHOOK_URL_KEY = 'growthops_webhook_url_v1';

export const DEFAULT_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/14P7GusbrG0-jDt1aD6JZMt6aLt6d4Jnnzzu-EfKs8OM/edit?gid=0#gid=0';

/**
 * Robust, non-destructive Google Apps Script
 * - Reads and Writes into the EXACT cells for Meta (LP) [Col B], Meta (Form) [Col C], Google [Col D]
 * - Preserves headers, formulas, and columns E, F, G (Playbook de Ações)
 */
export const APPS_SCRIPT_TEMPLATE = `/**
 * GrowthOps Funnel Connector - Google Apps Script
 * Sincronizador Bidirecional de Alta Precisão
 */

function getTargetSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return (
    ss.getSheetByName("Painel nós da Jornada") ||
    ss.getSheetByName("Dados") ||
    ss.getSheets()[0]
  );
}

// Helper para normalizar texto de busca
function norm(str) {
  return String(str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .trim();
}

// 1. LEITURA DOS DADOS (GET)
function doGet(e) {
  try {
    var sheet = getTargetSheet();
    var lastRow = Math.min(sheet.getLastRow(), 55);
    var range = sheet.getRange(1, 1, lastRow, 4).getValues();
    
    var month = "Março";
    var data = {
      "Meta (LP)": {},
      "Meta (Form)": {},
      "Google": {}
    };

    for (var i = 0; i < range.length; i++) {
      var rowName = norm(range[i][0]);
      var valB = range[i][1];
      var valC = range[i][2];
      var valD = range[i][3];

      if (rowName.indexOf("mes") >= 0) {
        if (valB) month = String(valB).trim();
      } else if (rowName.indexOf("investimento") >= 0 && rowName.indexOf("distribuicao") < 0) {
        data["Meta (LP)"].investimento = parseNum(valB);
        data["Meta (Form)"].investimento = parseNum(valC);
        data["Google"].investimento = parseNum(valD);
      } else if (rowName.indexOf("captacao") >= 0) {
        data["Meta (LP)"].valorCaptacao = parseNum(valB);
        data["Meta (Form)"].valorCaptacao = parseNum(valC);
        data["Google"].valorCaptacao = parseNum(valD);
      } else if (rowName.indexOf("distribuicao") >= 0) {
        data["Meta (LP)"].distribuicao = parseNum(valB);
        data["Meta (Form)"].distribuicao = parseNum(valC);
        data["Google"].distribuicao = parseNum(valD);
      } else if (rowName.indexOf("impressoes") >= 0) {
        data["Meta (LP)"].impressoes = parseNum(valB);
        data["Meta (Form)"].impressoes = parseNum(valC);
        data["Google"].impressoes = parseNum(valD);
      } else if (rowName.indexOf("cliques") >= 0) {
        data["Meta (LP)"].cliques = parseNum(valB);
        data["Meta (Form)"].cliques = parseNum(valC);
        data["Google"].cliques = parseNum(valD);
      } else if (rowName.indexOf("acessos") >= 0 || rowName.indexOf("pagina") >= 0) {
        data["Meta (LP)"].acessosPagina = parseNum(valB);
        data["Meta (Form)"].acessosPagina = parseNum(valC);
        data["Google"].acessosPagina = parseNum(valD);
      } else if (rowName === "leads") {
        data["Meta (LP)"].leads = parseNum(valB);
        data["Meta (Form)"].leads = parseNum(valC);
        data["Google"].leads = parseNum(valD);
      } else if (rowName === "mql") {
        data["Meta (LP)"].mql = parseNum(valB);
        data["Meta (Form)"].mql = parseNum(valC);
        data["Google"].mql = parseNum(valD);
      } else if (rowName.indexOf("ligacoes realizadas") >= 0) {
        data["Meta (LP)"].ligacoesRealizadas = parseNum(valB);
        data["Meta (Form)"].ligacoesRealizadas = parseNum(valC);
        data["Google"].ligacoesRealizadas = parseNum(valD);
      } else if (rowName.indexOf("ligacoes atendidas") >= 0) {
        data["Meta (LP)"].ligacoesAtendidas = parseNum(valB);
        data["Meta (Form)"].ligacoesAtendidas = parseNum(valC);
        data["Google"].ligacoesAtendidas = parseNum(valD);
      } else if (rowName === "sal") {
        data["Meta (LP)"].sal = parseNum(valB);
        data["Meta (Form)"].sal = parseNum(valC);
        data["Google"].sal = parseNum(valD);
      } else if (rowName === "sql") {
        data["Meta (LP)"].sql = parseNum(valB);
        data["Meta (Form)"].sql = parseNum(valC);
        data["Google"].sql = parseNum(valD);
      } else if (rowName.indexOf("rm agendadas") >= 0) {
        data["Meta (LP)"].rmAgendadas = parseNum(valB);
        data["Meta (Form)"].rmAgendadas = parseNum(valC);
        data["Google"].rmAgendadas = parseNum(valD);
      } else if (rowName.indexOf("programadas") >= 0) {
        data["Meta (LP)"].reunioesProgramadas = parseNum(valB);
        data["Meta (Form)"].reunioesProgramadas = parseNum(valC);
        data["Google"].reunioesProgramadas = parseNum(valD);
      } else if (rowName.indexOf("realizadas no dia") >= 0 || rowName.indexOf("reunioes realizadas") >= 0) {
        data["Meta (LP)"].reunioesRealizadas = parseNum(valB);
        data["Meta (Form)"].reunioesRealizadas = parseNum(valC);
        data["Google"].reunioesRealizadas = parseNum(valD);
      } else if (rowName.indexOf("no show") >= 0) {
        data["Meta (LP)"].noShow = parseNum(valB);
        data["Meta (Form)"].noShow = parseNum(valC);
        data["Google"].noShow = parseNum(valD);
      } else if (rowName.indexOf("reagendamentos") >= 0) {
        data["Meta (LP)"].reagendamentos = parseNum(valB);
        data["Meta (Form)"].reagendamentos = parseNum(valC);
        data["Google"].reagendamentos = parseNum(valD);
      } else if (rowName.indexOf("vendas no dia") >= 0 || rowName === "vendas") {
        data["Meta (LP)"].vendas = parseNum(valB);
        data["Meta (Form)"].vendas = parseNum(valC);
        data["Google"].vendas = parseNum(valD);
      } else if (rowName.indexOf("faturamento") >= 0) {
        data["Meta (LP)"].faturamento = parseNum(valB);
        data["Meta (Form)"].faturamento = parseNum(valC);
        data["Google"].faturamento = parseNum(valD);
      }
    }

    var channels = ["Meta (LP)", "Meta (Form)", "Google"];
    var today = new Date().toISOString().slice(0, 10);
    var records = channels.map(function(ch, idx) {
      var d = data[ch] || {};
      return {
        id: "sheet_" + idx + "_" + new Date().getTime(),
        date: today,
        month: month,
        channel: ch,
        investimento: d.investimento || 0,
        valorCaptacao: d.valorCaptacao || (d.investimento ? d.investimento * 0.85 : 0),
        distribuicao: d.distribuicao || 0,
        impressoes: d.impressoes || 0,
        cliques: d.cliques || 0,
        acessosPagina: d.acessosPagina || (ch === "Meta (Form)" ? 0 : d.cliques || 0),
        leads: d.leads || 0,
        mql: d.mql || 0,
        ligacoesRealizadas: d.ligacoesRealizadas || 0,
        ligacoesAtendidas: d.ligacoesAtendidas || 0,
        sal: d.sal || 0,
        sql: d.sql || 0,
        rmAgendadas: d.rmAgendadas || 0,
        reunioesProgramadas: d.reunioesProgramadas || d.rmAgendadas || 0,
        reunioesRealizadas: d.reunioesRealizadas || 0,
        noShow: d.noShow || 0,
        reagendamentos: d.reagendamentos || 0,
        vendas: d.vendas || 0,
        faturamento: d.faturamento || 0
      };
    });

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      month: month,
      count: records.length,
      records: records
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 2. GRAVAÇÃO SEGURA NAS CÉLULAS EXATAS (POST)
function doPost(e) {
  try {
    var sheet = getTargetSheet();
    var payload = JSON.parse(e.postData.contents);
    var records = Array.isArray(payload.records) ? payload.records : [payload];

    // Agrupa dados por canal
    var map = { "Meta (LP)": null, "Meta (Form)": null, "Google": null };
    records.forEach(function(r) {
      if (r && r.channel) {
        map[r.channel] = r;
      }
    });

    var lastRow = Math.min(sheet.getLastRow(), 55);
    var colA = sheet.getRange(1, 1, lastRow, 1).getValues();

    function setRowVals(rowIdx, valLP, valForm, valGoogle) {
      sheet.getRange(rowIdx, 2).setValue(valLP);
      sheet.getRange(rowIdx, 3).setValue(valForm);
      sheet.getRange(rowIdx, 4).setValue(valGoogle);
    }

    for (var i = 0; i < colA.length; i++) {
      var rowName = norm(colA[i][0]);
      var rowNum = i + 1;

      var lp = map["Meta (LP)"];
      var form = map["Meta (Form)"];
      var goog = map["Google"];

      if (rowName === "investimento") {
        setRowVals(rowNum, lp ? lp.investimento : 0, form ? form.investimento : 0, goog ? goog.investimento : 0);
      } else if (rowName.indexOf("captacao") >= 0) {
        setRowVals(rowNum, lp ? lp.valorCaptacao : 0, form ? form.valorCaptacao : 0, goog ? goog.valorCaptacao : 0);
      } else if (rowName.indexOf("distribuicao") >= 0) {
        setRowVals(rowNum, lp ? lp.distribuicao : 0, form ? form.distribuicao : 0, goog ? goog.distribuicao : 0);
      } else if (rowName.indexOf("impressoes") >= 0) {
        setRowVals(rowNum, lp ? lp.impressoes : 0, form ? form.impressoes : 0, goog ? goog.impressoes : 0);
      } else if (rowName.indexOf("cliques") >= 0) {
        setRowVals(rowNum, lp ? lp.cliques : 0, form ? form.cliques : 0, goog ? goog.cliques : 0);
      } else if (rowName.indexOf("acessos") >= 0 || rowName.indexOf("pagina") >= 0) {
        setRowVals(rowNum, lp ? lp.acessosPagina : 0, "-", goog ? goog.acessosPagina : 0);
      } else if (rowName === "leads") {
        setRowVals(rowNum, lp ? lp.leads : 0, form ? form.leads : 0, goog ? goog.leads : 0);
      } else if (rowName === "mql") {
        setRowVals(rowNum, lp ? lp.mql : 0, form ? form.mql : 0, goog ? goog.mql : 0);
      } else if (rowName.indexOf("ligacoes realizadas") >= 0) {
        setRowVals(rowNum, lp ? lp.ligacoesRealizadas : 0, form ? form.ligacoesRealizadas : 0, goog ? goog.ligacoesRealizadas : 0);
      } else if (rowName.indexOf("ligacoes atendidas") >= 0) {
        setRowVals(rowNum, lp ? lp.ligacoesAtendidas : 0, form ? form.ligacoesAtendidas : 0, goog ? goog.ligacoesAtendidas : 0);
      } else if (rowName === "sal") {
        setRowVals(rowNum, lp ? lp.sal : 0, form ? form.sal : 0, goog ? goog.sal : 0);
      } else if (rowName === "sql") {
        setRowVals(rowNum, lp ? lp.sql : 0, form ? form.sql : 0, goog ? goog.sql : 0);
      } else if (rowName.indexOf("rm agendadas") >= 0) {
        setRowVals(rowNum, lp ? lp.rmAgendadas : 0, form ? form.rmAgendadas : 0, goog ? goog.rmAgendadas : 0);
      } else if (rowName.indexOf("programadas") >= 0) {
        setRowVals(rowNum, lp ? lp.reunioesProgramadas : 0, form ? form.reunioesProgramadas : 0, goog ? goog.reunioesProgramadas : 0);
      } else if (rowName.indexOf("realizadas no dia") >= 0 || rowName.indexOf("reunioes realizadas") >= 0) {
        setRowVals(rowNum, lp ? lp.reunioesRealizadas : 0, form ? form.reunioesRealizadas : 0, goog ? goog.reunioesRealizadas : 0);
      } else if (rowName.indexOf("no show") >= 0) {
        setRowVals(rowNum, lp ? lp.noShow : 0, form ? form.noShow : 0, goog ? goog.noShow : 0);
      } else if (rowName.indexOf("reagendamentos") >= 0) {
        setRowVals(rowNum, lp ? lp.reagendamentos : 0, form ? form.reagendamentos : 0, goog ? goog.reagendamentos : 0);
      } else if (rowName.indexOf("vendas no dia") >= 0 || rowName === "vendas") {
        setRowVals(rowNum, lp ? lp.vendas : 0, form ? form.vendas : 0, goog ? goog.vendas : 0);
      } else if (rowName.indexOf("faturamento") >= 0) {
        setRowVals(rowNum, lp ? lp.faturamento : 0, form ? form.faturamento : 0, goog ? goog.faturamento : 0);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Células da planilha atualizadas com precisão cirúrgica sem alterar fórmulas ou colunas de ação!"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function parseNum(v) {
  if (v === undefined || v === null) return 0;
  if (typeof v === "number") return isNaN(v) ? 0 : v;
  var s = String(v).replace(/R\\$/g, "").replace(/%/g, "").replace(/\\s/g, "").trim();
  if (!s || s === "-") return 0;
  if (s.indexOf(",") >= 0 && s.indexOf(".") >= 0) {
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) {
      s = s.replace(/\\./g, "").replace(",", ".");
    } else {
      s = s.replace(/,/g, "");
    }
  } else if (s.indexOf(",") >= 0) {
    s = s.replace(",", ".");
  }
  var n = parseFloat(s);
  return isNaN(n) ? 0 : n;
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
  public static parseNumber(val: any): number {
    if (val === undefined || val === null) return 0;
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    let s = String(val).trim();
    if (!s || s === '-') return 0;
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
   * Robust CSV Line Splitter handling quotes and delimiters (; or ,)
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
   * Dedicated parser for the User's exact Matrix layout (Aba: Painel nós da Jornada)
   * Col A: Indicators
   * Col B: Meta (LP)
   * Col C: Meta (Form)
   * Col D: Google
   */
  public static parseMatrixCsvToRecords(rows: string[][]): FunnelDailyRecord[] | null {
    if (rows.length < 3) return null;

    // Check if this matches matrix format (Column A contains indicator names)
    const norm = (s: string) =>
      (s || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

    const col0Items = rows.map((r) => norm(r[0] || ''));
    const isMatrix =
      col0Items.some((n) => n.includes('indicadores da jornada')) ||
      col0Items.some((n) => n === 'investimento') ||
      col0Items.some((n) => n.includes('valor de captacao'));

    if (!isMatrix) return null;

    // Extract month from row 0 / 1
    let month = 'Março';
    const monthRow = rows.find((r) => norm(r[0]).includes('mes'));
    if (monthRow && monthRow[1] && monthRow[1].trim()) {
      month = monthRow[1].trim();
    }

    const data: Record<string, Record<string, number>> = {
      'Meta (LP)': {},
      'Meta (Form)': {},
      Google: {},
    };

    rows.forEach((r) => {
      if (!r || r.length < 2) return;
      const key = norm(r[0]);
      const valLP = this.parseNumber(r[1]);
      const valForm = this.parseNumber(r[2]);
      const valGoogle = this.parseNumber(r[3]);

      if (key === 'investimento') {
        data['Meta (LP)'].investimento = valLP;
        data['Meta (Form)'].investimento = valForm;
        data['Google'].investimento = valGoogle;
      } else if (key.includes('captacao')) {
        data['Meta (LP)'].valorCaptacao = valLP;
        data['Meta (Form)'].valorCaptacao = valForm;
        data['Google'].valorCaptacao = valGoogle;
      } else if (key.includes('distribuicao')) {
        data['Meta (LP)'].distribuicao = valLP;
        data['Meta (Form)'].distribuicao = valForm;
        data['Google'].distribuicao = valGoogle;
      } else if (key.includes('impressoes')) {
        data['Meta (LP)'].impressoes = valLP;
        data['Meta (Form)'].impressoes = valForm;
        data['Google'].impressoes = valGoogle;
      } else if (key.includes('cliques')) {
        data['Meta (LP)'].cliques = valLP;
        data['Meta (Form)'].cliques = valForm;
        data['Google'].cliques = valGoogle;
      } else if (key.includes('acessos') || key.includes('pagina')) {
        data['Meta (LP)'].acessosPagina = valLP;
        data['Meta (Form)'].acessosPagina = valForm;
        data['Google'].acessosPagina = valGoogle;
      } else if (key === 'leads') {
        data['Meta (LP)'].leads = valLP;
        data['Meta (Form)'].leads = valForm;
        data['Google'].leads = valGoogle;
      } else if (key === 'mql') {
        data['Meta (LP)'].mql = valLP;
        data['Meta (Form)'].mql = valForm;
        data['Google'].mql = valGoogle;
      } else if (key.includes('ligacoes realizadas')) {
        data['Meta (LP)'].ligacoesRealizadas = valLP;
        data['Meta (Form)'].ligacoesRealizadas = valForm;
        data['Google'].ligacoesRealizadas = valGoogle;
      } else if (key.includes('ligacoes atendidas')) {
        data['Meta (LP)'].ligacoesAtendidas = valLP;
        data['Meta (Form)'].ligacoesAtendidas = valForm;
        data['Google'].ligacoesAtendidas = valGoogle;
      } else if (key === 'sal') {
        data['Meta (LP)'].sal = valLP;
        data['Meta (Form)'].sal = valForm;
        data['Google'].sal = valGoogle;
      } else if (key === 'sql') {
        data['Meta (LP)'].sql = valLP;
        data['Meta (Form)'].sql = valForm;
        data['Google'].sql = valGoogle;
      } else if (key.includes('rm agendadas')) {
        data['Meta (LP)'].rmAgendadas = valLP;
        data['Meta (Form)'].rmAgendadas = valForm;
        data['Google'].rmAgendadas = valGoogle;
      } else if (key.includes('programadas')) {
        data['Meta (LP)'].reunioesProgramadas = valLP;
        data['Meta (Form)'].reunioesProgramadas = valForm;
        data['Google'].reunioesProgramadas = valGoogle;
      } else if (key.includes('realizadas no dia') || key.includes('reunioes realizadas')) {
        data['Meta (LP)'].reunioesRealizadas = valLP;
        data['Meta (Form)'].reunioesRealizadas = valForm;
        data['Google'].reunioesRealizadas = valGoogle;
      } else if (key.includes('no show')) {
        data['Meta (LP)'].noShow = valLP;
        data['Meta (Form)'].noShow = valForm;
        data['Google'].noShow = valGoogle;
      } else if (key.includes('reagendamentos')) {
        data['Meta (LP)'].reagendamentos = valLP;
        data['Meta (Form)'].reagendamentos = valForm;
        data['Google'].reagendamentos = valGoogle;
      } else if (key.includes('vendas no dia') || key === 'vendas') {
        data['Meta (LP)'].vendas = valLP;
        data['Meta (Form)'].vendas = valForm;
        data['Google'].vendas = valGoogle;
      } else if (key.includes('faturamento')) {
        data['Meta (LP)'].faturamento = valLP;
        data['Meta (Form)'].faturamento = valForm;
        data['Google'].faturamento = valGoogle;
      }
    });

    const channels: ('Meta (LP)' | 'Meta (Form)' | 'Google')[] = ['Meta (LP)', 'Meta (Form)', 'Google'];
    const today = new Date().toISOString().slice(0, 10);

    return channels.map((ch, idx) => {
      const d = data[ch] || {};
      const investimento = d.investimento || 0;
      const valorCaptacao = d.valorCaptacao || investimento * 0.85;
      const distribuicao = d.distribuicao || investimento - valorCaptacao;
      const cliques = d.cliques || 0;
      const acessos = ch === 'Meta (Form)' ? 0 : d.acessosPagina || cliques;
      const rm = d.rmAgendadas || 0;

      return {
        id: `matrix_${ch.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}_${idx}`,
        date: today,
        month: month,
        channel: ch,
        investimento,
        valorCaptacao,
        distribuicao,
        impressoes: d.impressoes || 0,
        cliques,
        acessosPagina: acessos,
        leads: d.leads || 0,
        mql: d.mql || 0,
        ligacoesRealizadas: d.ligacoesRealizadas || 0,
        ligacoesAtendidas: d.ligacoesAtendidas || 0,
        sal: d.sal || 0,
        sql: d.sql || 0,
        rmAgendadas: rm,
        reunioesProgramadas: d.reunioesProgramadas || rm,
        reunioesRealizadas: d.reunioesRealizadas || 0,
        noShow: d.noShow || 0,
        reagendamentos: d.reagendamentos || 0,
        vendas: d.vendas || 0,
        faturamento: d.faturamento || 0,
      };
    });
  }

  /**
   * Universal CSV Parser: Automatically detects Matrix vs Standard Table layout
   */
  public static parseCsvToRecords(csvText: string): FunnelDailyRecord[] {
    const rows = this.parseCsvLines(csvText);
    if (rows.length === 0) return [];

    // 1. Try Matrix layout first (Exact format of User's "Painel nós da Jornada")
    const matrixResult = this.parseMatrixCsvToRecords(rows);
    if (matrixResult && matrixResult.length > 0) {
      return matrixResult;
    }

    // 2. Fallback to standard column-based table
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
   * Reads data from Google Apps Script Webhook (GET) with zero CORS issues
   */
  public static async fetchFromAppsScriptWebhook(
    webhookUrl: string
  ): Promise<{ success: boolean; message: string; records?: FunnelDailyRecord[] }> {
    if (!webhookUrl || !webhookUrl.startsWith('https://script.google.com/')) {
      return {
        success: false,
        message: 'A URL deve ser do Google Apps Script (começando com https://script.google.com/macros/s/...)',
      };
    }

    try {
      this.setSavedWebhookUrl(webhookUrl);
      const response = await fetch(webhookUrl, {
        method: 'GET',
        headers: { Accept: 'application/json, text/plain, */*' },
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status} ao consultar Webhook.`);
      }

      const json = await response.json();
      if (json && json.status === 'success' && Array.isArray(json.records) && json.records.length > 0) {
        this.saveRecords(json.records);
        return {
          success: true,
          message: `${json.records.length} canais sincronizados diretamente da sua planilha (Mês: ${json.month || 'Ativo'}) com sucesso!`,
          records: json.records,
        };
      }

      throw new Error(json.message || 'O Webhook respondeu, mas não retornou a estrutura esperada de canais.');
    } catch (err: any) {
      console.warn('Apps script GET error:', err);
      return {
        success: false,
        message: 'Falha ao ler via Webhook: ' + (err.message || 'Verifique se o App foi implantado para "Qualquer pessoa".'),
      };
    }
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
        throw new Error(
          `Erro HTTP ${response.status}: Não foi possível acessar o link de exportação. (Dica: Use a aba "Colar CSV" ou o "Webhook Apps Script" para conexão 100% direta).`
        );
      }

      const csvText = await response.text();
      if (!csvText || csvText.includes('<!DOCTYPE html>')) {
        throw new Error(
          'A planilha retornou uma página de login HTML. Para links diretos, compartilhe como "Qualquer pessoa com o link" ou use a aba de colar CSV.'
        );
      }

      const parsed = this.parseCsvToRecords(csvText);

      if (parsed.length === 0) {
        return {
          success: true,
          message: 'Planilha acessada com sucesso, porém nenhuma linha de dados foi identificada.',
          count: 0,
          records: [],
        };
      }

      // Save to localStorage
      this.saveRecords(parsed);

      return {
        success: true,
        message: `${parsed.length} canais/registros sincronizados e importados com sucesso da sua planilha Google!`,
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
   * Sends data directly to Google Sheet cells using Google Apps Script Webhook (POST)
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

      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      return {
        success: true,
        message: 'Dados enviados com sucesso para as células exatas da planilha via Google Apps Script!',
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
