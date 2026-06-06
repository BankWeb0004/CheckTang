/**
 * Capacitor Entry Point
 *
 * Pure client-side React entry that mirrors src/routes/index.tsx so the
 * native APK exposes the same features as the web build (Wallets tab,
 * WalletDetailSheet, preselected wallet on Add, etc.).
 */
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ExpenseProvider, useStore, Transaction } from '@/lib/expense-store';
import { CheckTangLogo } from '@/components/expense/CheckTangLogo';
import { Dashboard } from '@/components/expense/Dashboard';
import { History } from '@/components/expense/History';
import { Wallets } from '@/components/expense/Wallets';
import { WalletDetailSheet } from '@/components/expense/WalletDetailSheet';
import { Settings } from '@/components/expense/Settings';
import { AddTransactionSheet } from '@/components/expense/AddTransactionSheet';
import { Tutorial } from '@/components/expense/Tutorial';
import { UpdateModal } from '@/components/UpdateModal';
import { Toaster } from '@/components/ui/sonner';
import { useAppUpdate } from '@/hooks/use-app-update';
import {
  Hop as Home,
  ClipboardList,
  Settings as SettingsIcon,
  Plus,
  Wallet as WalletIcon,
} from 'lucide-react';
import './styles.css';

type Tab = 'dashboard' | 'history' | 'wallets' | 'settings';

function AppShell() {
  const { t, lang, wallpaper, showTutorial, closeTutorial } = useStore();
  const { showModal, updateInfo, currentVersion, applyUpdate, dismissUpdate } = useAppUpdate();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [preselectedWallet, setPreselectedWallet] = useState<string | null>(null);
  const [detailWalletId, setDetailWalletId] = useState<string | null>(null);

  const tabs: { id: Tab; label: string; icon: typeof Home }[] = [
    { id: 'dashboard', label: t.dashboard, icon: Home },
    { id: 'history', label: t.history, icon: ClipboardList },
    { id: 'wallets', label: t.wallets, icon: WalletIcon },
    { id: 'settings', label: t.settings, icon: SettingsIcon },
  ];

  const openAddTx = (walletId?: string) => {
    setEditTransaction(null);
    setPreselectedWallet(walletId ?? null);
    setSheetOpen(true);
  };

  const today = new Date();
  const dateLabel = today.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const renderMain = () => {
    switch (tab) {
      case 'dashboard':
        return <Dashboard />;
      case 'history':
        return (
          <History
            onEdit={(tx) => {
              setEditTransaction(tx);
              setPreselectedWallet(null);
              setSheetOpen(true);
            }}
          />
        );
      case 'wallets':
        return <Wallets onOpenWallet={(id) => setDetailWalletId(id)} />;
      case 'settings':
        return <Settings />;
    }
  };

  return (
    <div
      className="min-h-screen relative"
      style={
        wallpaper
          ? {
              backgroundImage: `url(${wallpaper})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
            }
          : undefined
      }
    >
      {wallpaper && <div className="fixed inset-0 wallpaper-overlay pointer-events-none" />}

      <div className="relative max-w-md mx-auto px-5 pt-3 pb-32">
        <header className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 text-foreground">
            <CheckTangLogo showLabel={false} className="text-primary scale-[0.65] -ml-3" />
            <span
              className="text-base font-bold tracking-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui" }}
            >
              Check Tang
            </span>
          </div>
          <span className="text-[10.5px] text-muted-foreground tracking-wide">{dateLabel}</span>
        </header>

        <main className="min-w-0">{renderMain()}</main>
      </div>

      <button
        onClick={() => openAddTx()}
        aria-label={t.add}
        className="fixed bottom-24 right-5 z-30 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center justify-center"
        style={{ boxShadow: '0 10px 28px -8px color-mix(in oklab, var(--primary) 50%, transparent)' }}
      >
        <Plus className="h-6 w-6" />
      </button>

      <nav className="fixed bottom-0 left-0 right-0 z-20">
        <div
          className="max-w-md mx-auto m-3 rounded-2xl border border-border bg-card/90 backdrop-blur-md grid grid-cols-4"
          style={{ boxShadow: '0 8px 24px -10px rgba(0,0,0,0.12)' }}
        >
          {tabs.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="flex flex-col items-center gap-1 py-3 text-[11px] transition-colors"
                style={{ color: active ? 'var(--primary)' : 'var(--muted-foreground)' }}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <AddTransactionSheet
        open={sheetOpen}
        onOpenChange={(o) => {
          if (!o) {
            setEditTransaction(null);
            setPreselectedWallet(null);
          }
          setSheetOpen(o);
        }}
        editTransaction={editTransaction}
        initialWalletId={preselectedWallet}
      />

      <WalletDetailSheet
        walletId={detailWalletId}
        open={!!detailWalletId}
        onOpenChange={(o) => {
          if (!o) setDetailWalletId(null);
        }}
        onEdit={(tx) => {
          setDetailWalletId(null);
          setEditTransaction(tx);
          setPreselectedWallet(null);
          setSheetOpen(true);
        }}
      />

      <Toaster />
      <Tutorial open={showTutorial} onClose={() => closeTutorial(true)} />
      <UpdateModal
        open={showModal}
        updateInfo={updateInfo}
        currentVersion={currentVersion}
        onUpdate={applyUpdate}
        onDismiss={dismissUpdate}
      />
    </div>
  );
}

function App() {
  return (
    <ExpenseProvider>
      <AppShell />
    </ExpenseProvider>
  );
}

const queryClient = new QueryClient();

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </React.StrictMode>
  );
}
