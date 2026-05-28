import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ExpenseProvider, useStore, Transaction } from "@/lib/expense-store";
import { Dashboard } from "@/components/expense/Dashboard";
import { History } from "@/components/expense/History";
import { Wallets } from "@/components/expense/Wallets";
import { WalletsPane } from "@/components/expense/WalletsPane";
import { Settings } from "@/components/expense/Settings";
import { AddTransactionSheet } from "@/components/expense/AddTransactionSheet";
import { Tutorial } from "@/components/expense/Tutorial";
import { UpdateModal } from "@/components/UpdateModal";
import { Toaster } from "@/components/ui/sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAppUpdate } from "@/hooks/use-app-update";
import {
  Hop as Home,
  ClipboardList,
  Settings as SettingsIcon,
  Plus,
  Wallet as WalletIcon,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "เช็คตังค์ — CHECK TANG" },
      {
        name: "description",
        content:
          "เช็คตังค์ — แอปบันทึกรายรับ-รายจ่ายหลายกระเป๋า รองรับโอนเงิน หลายสกุล และภาษาไทย/อังกฤษ",
      },
      { property: "og:title", content: "เช็คตังค์ — CHECK TANG" },
      {
        property: "og:description",
        content: "Track income, expenses, and wallet transfers in a clean modern interface.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: Index,
});

type Tab = "dashboard" | "history" | "wallets" | "settings";

function AppShell() {
  const { t, wallpaper, showTutorial, closeTutorial } = useStore();
  const { showModal, updateInfo, currentVersion, applyUpdate, dismissUpdate } =
    useAppUpdate();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [preselectedWallet, setPreselectedWallet] = useState<string | null>(null);
  const [mobileWalletsOpen, setMobileWalletsOpen] = useState(false);

  const tabs: { id: Tab; label: string; icon: typeof Home }[] = [
    { id: "dashboard", label: t.dashboard, icon: Home },
    { id: "history", label: t.history, icon: ClipboardList },
    { id: "wallets", label: t.wallets, icon: WalletIcon },
    { id: "settings", label: t.settings, icon: SettingsIcon },
  ];

  const openAddTx = (walletId?: string) => {
    setEditTransaction(null);
    setPreselectedWallet(walletId ?? null);
    setSheetOpen(true);
    setMobileWalletsOpen(false);
  };

  const renderMain = () => {
    switch (tab) {
      case "dashboard":
        return <Dashboard />;
      case "history":
        return (
          <History
            onEdit={(tx) => {
              setEditTransaction(tx);
              setPreselectedWallet(null);
              setSheetOpen(true);
            }}
          />
        );
      case "wallets":
        return <Wallets />;
      case "settings":
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
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "fixed",
            }
          : undefined
      }
    >
      {wallpaper && (
        <div className="fixed inset-0 wallpaper-overlay pointer-events-none" />
      )}

      {/* Container: single column < lg, 2-col grid >= lg */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-5 pt-4 pb-32 lg:pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,_1fr)_360px] gap-5">
          {/* LEFT panel */}
          <main className="min-w-0">{renderMain()}</main>

          {/* RIGHT sticky pane (lg+) */}
          <aside className="hidden lg:block">
            <div className="sticky top-4">
              <WalletsPane
                onAddTransaction={openAddTx}
                onManageWallets={() => setTab("wallets")}
              />
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile FAB (hidden on lg+ since right pane has actions) */}
      <button
        onClick={() => openAddTx()}
        aria-label={t.add}
        className="fixed bottom-24 right-5 z-30 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center justify-center lg:hidden"
        style={{
          boxShadow:
            "0 10px 28px -8px color-mix(in oklab, var(--primary) 50%, transparent)",
        }}
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Mobile wallets-pane trigger (FAB style) */}
      <button
        onClick={() => setMobileWalletsOpen(true)}
        aria-label={t.quickSummary}
        className="fixed bottom-24 left-5 z-30 h-12 w-12 rounded-full bg-card text-foreground border border-border shadow-md hover:scale-105 active:scale-95 transition-transform flex items-center justify-center lg:hidden"
      >
        <WalletIcon className="h-5 w-5" />
      </button>

      {/* Bottom nav (mobile & tablet) — also visible on lg as compact secondary nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 lg:static lg:mt-0">
        <div
          className="max-w-md mx-auto m-3 lg:hidden rounded-2xl border border-border bg-card/90 backdrop-blur-md grid grid-cols-4"
          style={{ boxShadow: "0 8px 24px -10px rgba(0,0,0,0.12)" }}
        >
          {tabs.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="flex flex-col items-center gap-1 py-3 text-[11px] transition-colors"
                style={{
                  color: active ? "var(--primary)" : "var(--muted-foreground)",
                }}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop top-tab bar (lg+) */}
      <div className="hidden lg:flex fixed top-4 left-1/2 -translate-x-1/2 z-30 items-center gap-1 p-1 rounded-2xl border border-border bg-card/90 backdrop-blur-md shadow">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-colors"
              style={{
                background: active ? "var(--muted)" : "transparent",
                color: active ? "var(--primary)" : "var(--muted-foreground)",
              }}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </div>

      {/* Mobile wallets bottom sheet */}
      <Sheet open={mobileWalletsOpen} onOpenChange={setMobileWalletsOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-center">{t.quickSummary}</SheetTitle>
          </SheetHeader>
          <div className="mt-3 pb-4">
            <WalletsPane
              onAddTransaction={openAddTx}
              onManageWallets={() => {
                setTab("wallets");
                setMobileWalletsOpen(false);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

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

function Index() {
  return (
    <ExpenseProvider>
      <AppShell />
    </ExpenseProvider>
  );
}
