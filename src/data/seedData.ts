import { FunnelDailyRecord } from '../types';

export const INITIAL_SEED_RECORDS: FunnelDailyRecord[] = [];

// Helper to generate consistent realistic daily funnel data
function generateChannelDailyData(
  day: number,
  monthName: string,
  monthNum: string,
  channel: 'Meta (LP)' | 'Meta (Form)' | 'Google',
  baseInvestment: number,
  cpmBase: number,
  ctrBase: number,
  connectRateBase: number,
  lpConvBase: number,
  mqlRateBase: number,
  contactRateBase: number,
  salRateBase: number,
  sqlRateBase: number,
  showRateBase: number,
  closeRateBase: number,
  avgTicket: number
): FunnelDailyRecord {
  // Add realistic micro-variations per day of week (weekends lower B2B activity)
  const dateStr = `2026-${monthNum}-${String(day).padStart(2, '0')}`;
  const dateObj = new Date(dateStr);
  const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 6 is Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const weekendMultiplier = isWeekend ? 0.45 : 1.05;

  const investimento = Math.round(baseInvestment * weekendMultiplier * (0.9 + Math.random() * 0.2));
  const valorCaptacao = Math.round(investimento * 0.85);
  const distribuicao = investimento - valorCaptacao;

  const cpm = cpmBase * (0.95 + Math.random() * 0.1);
  const impressoes = Math.round((investimento / cpm) * 1000);
  const ctr = ctrBase * (0.92 + Math.random() * 0.16);
  const cliques = Math.round(impressoes * (ctr / 100));

  const connectRate = channel === 'Meta (Form)' ? 100 : connectRateBase * (0.93 + Math.random() * 0.14);
  const acessosPagina = channel === 'Meta (Form)' ? cliques : Math.round(cliques * (connectRate / 100));

  const lpConv = lpConvBase * (0.9 + Math.random() * 0.2);
  const leads = Math.max(1, Math.round(acessosPagina * (lpConv / 100)));

  const mqlRate = mqlRateBase * (0.92 + Math.random() * 0.15);
  const mql = Math.max(1, Math.round(leads * (mqlRate / 100)));

  // SDR Dials & Connects
  const dialRate = isWeekend ? 0.3 : 0.95;
  const ligacoesRealizadas = Math.round(mql * dialRate);
  const connectCallRate = contactRateBase * (0.9 + Math.random() * 0.2);
  const ligacoesAtendidas = Math.round(ligacoesRealizadas * (connectCallRate / 100));

  const salRate = salRateBase * (0.92 + Math.random() * 0.15);
  const sal = Math.max(0, Math.round(ligacoesAtendidas * (salRate / 100)));

  const sqlRate = sqlRateBase * (0.9 + Math.random() * 0.2);
  const sql = Math.max(0, Math.round(sal * (sqlRate / 100)));

  const rmAgendadas = isWeekend ? Math.round(sql * 0.4) : Math.round(sql * (0.8 + Math.random() * 0.3));
  const reunioesProgramadas = rmAgendadas + Math.floor(Math.random() * 2);
  
  const showRate = showRateBase * (0.9 + Math.random() * 0.18);
  const reunioesRealizadas = Math.round(reunioesProgramadas * (showRate / 100));
  const noShow = Math.max(0, reunioesProgramadas - reunioesRealizadas);
  const reagendamentos = Math.floor(noShow * 0.5);

  const closeRate = closeRateBase * (0.85 + Math.random() * 0.3);
  const vendas = isWeekend ? (Math.random() > 0.8 ? 1 : 0) : Math.max(0, Math.round(reunioesRealizadas * (closeRate / 100)));
  const faturamento = vendas * (avgTicket * (0.95 + Math.random() * 0.1));

  return {
    id: `${channel.replace(/[^a-zA-Z0-9]/g, '_')}_${dateStr}`,
    date: dateStr,
    month: monthName,
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
    faturamento: Math.round(faturamento),
  };
}

// Generate data for March (Days 1 to 31)
for (let d = 1; d <= 31; d++) {
  // Meta LP: High Volume, good LP conv, higher qualified
  INITIAL_SEED_RECORDS.push(
    generateChannelDailyData(
      d, 'Março', '03', 'Meta (LP)',
      420, // base invest
      28.5, // cpm
      1.85, // ctr %
      78.0, // connect rate %
      19.5, // lp conv %
      64.0, // mql %
      48.0, // contact %
      72.0, // sal %
      65.0, // sql %
      74.0, // show rate %
      24.0, // close rate %
      4500 // avg ticket
    )
  );

  // Meta Form: Lower CPM, native form, faster leads but lower MQL filter
  INITIAL_SEED_RECORDS.push(
    generateChannelDailyData(
      d, 'Março', '03', 'Meta (Form)',
      350, // base invest
      21.0, // cpm
      2.4, // ctr %
      100, // connect rate (native)
      28.0, // form conv %
      42.0, // mql % (lower qualification)
      40.0, // contact %
      55.0, // sal %
      52.0, // sql %
      62.0, // show rate %
      18.0, // close rate %
      4200 // avg ticket
    )
  );

  // Google Ads: Higher search intent, higher CPC/CPM, supreme conversion & ticket
  INITIAL_SEED_RECORDS.push(
    generateChannelDailyData(
      d, 'Março', '03', 'Google',
      550, // base invest
      48.0, // cpm
      4.2, // ctr %
      86.0, // connect rate %
      22.0, // lp conv %
      78.0, // mql %
      58.0, // contact %
      82.0, // sal %
      75.0, // sql %
      82.0, // show rate %
      32.0, // close rate %
      5800 // avg ticket
    )
  );
}

// Generate data for April (Days 1 to 28)
for (let d = 1; d <= 28; d++) {
  INITIAL_SEED_RECORDS.push(
    generateChannelDailyData(
      d, 'Abril', '04', 'Meta (LP)',
      460, 26.0, 2.05, 82.0, 21.0, 68.0, 52.0, 75.0, 68.0, 78.0, 26.0, 4800
    )
  );
  INITIAL_SEED_RECORDS.push(
    generateChannelDailyData(
      d, 'Abril', '04', 'Meta (Form)',
      380, 19.5, 2.6, 100, 29.0, 45.0, 44.0, 60.0, 56.0, 66.0, 20.0, 4400
    )
  );
  INITIAL_SEED_RECORDS.push(
    generateChannelDailyData(
      d, 'Abril', '04', 'Google',
      620, 46.0, 4.6, 88.0, 24.5, 82.0, 62.0, 85.0, 78.0, 85.0, 35.0, 6200
    )
  );
}
