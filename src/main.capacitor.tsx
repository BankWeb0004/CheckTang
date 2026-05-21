/**
 * Capacitor Entry Point
 * 
 * This is a pure client-side React entry point that bypasses TanStack Start's
 * server requirements. It renders the app directly without SSR/prerendering.
 */
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ExpenseProvider, useStore, Transaction } from '@/lib/expense-store';
import { Dashboard } from '@/components/expense/Dashboard';
import { History } from '@/components/expense/History';
import { Settings } from '@/components/expense/Settings';
import { AddTransactionSheet } from '@/components/expense/AddTransactionSheet';
import { Tutorial } from '@/components/expense/Tutorial';
import { UpdateModal } from '@/components/UpdateModal';
import { Toaster } from '@/components/ui/sonner';
import { useAppUpdate } from '@/hooks/use-app-update';
import { Hop as Home, ClipboardList, Settings as SettingsIcon, Plus } from 'lucide-react';
import './styles.css';

type Tab = 'dashboard' | 'history' | 'settings';

function AppShell() {
  const { t, wallpaper, showTutorial, closeTutorial } = useStore();
  const { showModal, updateInfo, currentVersion, applyUpdate, dismissUpdate } = useAppUpdate();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);

  const tabs: { id: Tab; label: string; icon: typeof Home }[] = [
    { id: 'dashboard', label: t.dashboard, icon: Home },
    { id: 'history', label: t.history, icon: ClipboardList },
    { id: 'settings', label: t.settings, icon: SettingsIcon },
  ];

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

      <div className="relative max-w-md mx-auto px-5 pt-4 pb-32">
        <main>
          {tab === 'dashboard' && <Dashboard />}
          {tab === 'history' && (
            <History
              onEdit={(tx) => {
                setEditTransaction(tx);
                setSheetOpen(true);
              }}
            />
          )}
          {tab === 'settings' && <Settings />}
        </main>
      </div>

      {tab !== 'settings' && (
        <button
          onClick={() => {
            setEditTransaction(null);
            setSheetOpen(true);
          }}
          aria-label={t.add}
          className="fixed bottom-24 right-5 z-30 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center justify-center"
          style={{ boxShadow: '0 10px 28px -8px color-mix(in oklab, var(--primary) 50%, transparent)' }}
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-20">
        <div
          className="max-w-md mx-auto m-3 rounded-2xl border border-border bg-card/90 backdrop-blur-md grid grid-cols-3"
          style={{ boxShadow: '0 8px 24px -10px rgba(0,0,0,0.12)' }}
        >
          {tabs.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="flex flex-col items-center gap-1 py-3 text-xs transition-colors"
                style={{
                  color: active ? 'var(--primary)' : 'var(--muted-foreground)',
                }}
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
        onOpenChange={(open) => {
          if (!open) setEditTransaction(null);
          setSheetOpen(open);
        }}
        editTransaction={editTransaction}
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

// Initialize QueryClient
const queryClient = new QueryClient();

// Mount the app
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
