import { FunnelDailyRecord } from '../types';
import { INITIAL_SEED_RECORDS } from '../data/seedData';

const LOCAL_STORAGE_KEY = 'growthops_funnel_records_v1';
const GOOGLE_SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/18c3Jv7LSmh7OwDVI3cMobiPZXklO4yyf3fWWwwAizo4/export?format=csv&gid=1314698631';

export class SheetService {
  public static loadRecords(): FunnelDailyRecord[] {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading from localStorage:', e);
    }
    // Fallback to seed records
    return INITIAL_SEED_RECORDS;
  }

  public static saveRecords(records: FunnelDailyRecord[]): void {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }

  public static resetToDefault(): FunnelDailyRecord[] {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.error('Error removing from localStorage:', e);
    }
    return INITIAL_SEED_RECORDS;
  }

  public static async syncFromGoogleSheet(customUrl?: string): Promise<{ success: boolean; message: string; data?: any }> {
    const url = customUrl || GOOGLE_SHEET_CSV_URL;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/csv, text/plain',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP status ${response.status}`);
      }

      const csvText = await response.text();
      if (!csvText || csvText.includes('<!DOCTYPE html>')) {
        throw new Error('A planilha retornou uma página HTML em vez de CSV (verifique as permissões de compartilhamento público)');
      }

      return {
        success: true,
        message: 'Planilha sincronizada com sucesso!',
        data: csvText,
      };
    } catch (err: any) {
      console.warn('Sync failed:', err);
      return {
        success: false,
        message: err.message || 'Falha ao conectar com o Google Sheets',
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
