import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ExpenseProvider, useStore } from "@/lib/expense-store";
import { Dashboard } from "@/components/expense/Dashboard";
import { History } from "@/components/expense/History";
import { Settings } from "@/components/expense/Settings";
import { AddTransactionSheet } from "@/components/expense/AddTransactionSheet";
import { Toaster } from "@/components/ui/sonner";
import { Hop as Home, ClipboardList, Settings as SettingsIcon, Plus } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "เช็คตังค์ — CHECK TANG" },
      {
        name: "description",
        content:
          "เช็คตังค์ — แอปบันทึกรายรับ-รายจ่ายที่เรียบง่าย รองรับหลายสกุลเงิน ธีม และภาษาไทย/อังกฤษ",
      },
      { property: "og:title", content: "เช็คตังค์ — CHECK TANG" },
      {
        property: "og:description",
        content: "Track income & expenses with a clean, modern interface.",
      },
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: Index,
});

type Tab = "dashboard" | "history" | "settings";

function AppShell() {
  const { t, wallpaper } = useStore();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [addOpen, setAddOpen] = useState(false);

  const tabs: { id: Tab; label: string; icon: typeof Home }[] = [
    { id: "dashboard", label: t.dashboard, icon: Home },
    { id: "history", label: t.history, icon: ClipboardList },
    { id: "settings", label: t.settings, icon: SettingsIcon },
  ];

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
      {wallpaper && <div className="fixed inset-0 wallpaper-overlay pointer-events-none" />}

      <div className="relative max-w-md mx-auto px-5 pt-4 pb-32">
        <main>
          {tab === "dashboard" && <Dashboard />}
          {tab === "history" && <History />}
          {tab === "settings" && <Settings />}
        </main>
      </div>

      {tab !== "settings" && (
        <button
          onClick={() => setAddOpen(true)}
          aria-label={t.add}
          className="fixed bottom-24 right-5 z-30 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center justify-center"
          style={{ boxShadow: "0 10px 28px -8px color-mix(in oklab, var(--primary) 50%, transparent)" }}
        >
          <Plus className="h-6 w-6" />
        </button>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-20">
        <div
          className="max-w-md mx-auto m-3 rounded-2xl border border-border bg-card/90 backdrop-blur-md grid grid-cols-3"
          style={{ boxShadow: "0 8px 24px -10px rgba(0,0,0,0.12)" }}
        >
          {tabs.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="flex flex-col items-center gap-1 py-3 text-xs transition-colors"
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

      <AddTransactionSheet open={addOpen} onOpenChange={setAddOpen} />
      <Toaster />
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
