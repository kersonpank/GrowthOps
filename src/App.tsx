import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { ExecutiveOverview } from './components/ExecutiveOverview';
import { FunnelVisualizer } from './components/FunnelVisualizer';
import { UnitEconomics } from './components/UnitEconomics';
import { OptimizationPlaybook } from './components/OptimizationPlaybook';
import { GoalSimulator } from './components/GoalSimulator';
import { DataGridTable } from './components/DataGridTable';
import { NewEntryModal } from './components/NewEntryModal';
import { SyncSheetModal } from './components/SyncSheetModal';
import { ChannelType, DateRangePreset, FunnelDailyRecord, ViewTab } from './types';
import { SheetService } from './services/sheetService';
import { computeFunnelMetrics } from './utils/calculator';

export default function App() {
  const [records, setRecords] = useState<FunnelDailyRecord[]>(() => SheetService.loadRecords());
  const [activeTab, setActiveTab] = useState<ViewTab>('overview');
  const [selectedChannel, setSelectedChannel] = useState<ChannelType>('Todos');
  const [datePreset, setDatePreset] = useState<DateRangePreset>('all');
  
  // Modals state
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(new Date());

  // Filter records by channel and date preset
  const filteredRecords = useMemo(() => {
    let result = records;

    // Filter by Channel
    if (selectedChannel !== 'Todos') {
      result = result.filter((r) => r.channel === selectedChannel);
    }

    // Filter by Date Preset
    if (datePreset === '7d') {
      const sorted = [...result].sort((a, b) => b.date.localeCompare(a.date));
      const recentDates = Array.from(new Set(sorted.map((r) => r.date))).slice(0, 7);
      result = result.filter((r) => recentDates.includes(r.date));
    } else if (datePreset === '14d') {
      const sorted = [...result].sort((a, b) => b.date.localeCompare(a.date));
      const recentDates = Array.from(new Set(sorted.map((r) => r.date))).slice(0, 14);
      result = result.filter((r) => recentDates.includes(r.date));
    } else if (datePreset === '30d') {
      const sorted = [...result].sort((a, b) => b.date.localeCompare(a.date));
      const recentDates = Array.from(new Set(sorted.map((r) => r.date))).slice(0, 30);
      result = result.filter((r) => recentDates.includes(r.date));
    } else if (datePreset === 'month') {
      result = result.filter((r) => r.month === 'Abril' || r.date.startsWith('2026-04'));
    }

    return result;
  }, [records, selectedChannel, datePreset]);

  // Compute all metrics dynamically
  const metrics = useMemo(() => {
    return computeFunnelMetrics(filteredRecords);
  }, [filteredRecords]);

  // Handlers
  const handleSaveEntry = (newRecord: FunnelDailyRecord) => {
    const updated = [newRecord, ...records];
    setRecords(updated);
    SheetService.saveRecords(updated);
  };

  const handleDeleteRecord = (id: string) => {
    const updated = records.filter((r) => r.id !== id);
    setRecords(updated);
    SheetService.saveRecords(updated);
  };

  const handleResetDefaults = () => {
    const reset = SheetService.resetToDefault();
    setRecords(reset);
    setLastSyncTime(new Date());
  };

  const handleExportCSV = () => {
    SheetService.exportToCSV(filteredRecords);
  };

  const handleRefreshFromSheet = () => {
    setLastSyncTime(new Date());
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header with Navigation & Filters */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedChannel={selectedChannel}
        setSelectedChannel={setSelectedChannel}
        datePreset={datePreset}
        setDatePreset={setDatePreset}
        onOpenNewEntry={() => setIsNewEntryOpen(true)}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onExportCSV={handleExportCSV}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <ExecutiveOverview
            metrics={metrics}
            records={filteredRecords}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'funnel' && (
          <FunnelVisualizer
            metrics={metrics}
            onNavigateToPlaybookStage={() => setActiveTab('playbook')}
          />
        )}

        {activeTab === 'uniteconomics' && (
          <UnitEconomics
            metrics={metrics}
            allRecords={records}
          />
        )}

        {activeTab === 'playbook' && (
          <OptimizationPlaybook
            metrics={metrics}
          />
        )}

        {activeTab === 'simulator' && (
          <GoalSimulator
            metrics={metrics}
          />
        )}

        {activeTab === 'datagrid' && (
          <DataGridTable
            records={records}
            onAddEntry={() => setIsNewEntryOpen(true)}
            onDeleteRecord={handleDeleteRecord}
            onExportCSV={handleExportCSV}
          />
        )}
      </main>

      {/* Modals */}
      <NewEntryModal
        isOpen={isNewEntryOpen}
        onClose={() => setIsNewEntryOpen(false)}
        onSave={handleSaveEntry}
      />

      <SyncSheetModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onRefreshData={handleRefreshFromSheet}
        onResetDefaults={handleResetDefaults}
      />
    </div>
  );
}
