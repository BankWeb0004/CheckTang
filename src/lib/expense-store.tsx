import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type TxType = "income" | "expense";
export type Lang = "en" | "th";

export interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  category: string;
  method: string;
  note: string;
  date: string; // ISO date (yyyy-mm-dd)
  createdAt: number;
}

export interface ThemePreset {
  id: string;
  nameEn: string;
  nameTh: string;
  vars: Record<string, string>;
  swatch: string[];
}

// All themes use oklch tokens compatible with src/styles.css variables
export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "warm-sand",
    nameEn: "Warm Sand",
    nameTh: "ทรายอุ่น",
    swatch: ["#faf8f5", "#f0ebe3", "#c9b99a", "#8b7355"],
    vars: {
      "--background": "oklch(0.98 0.008 80)",
      "--foreground": "oklch(0.28 0.02 60)",
      "--card": "oklch(0.995 0.005 80)",
      "--card-foreground": "oklch(0.28 0.02 60)",
      "--popover": "oklch(0.995 0.005 80)",
      "--popover-foreground": "oklch(0.28 0.02 60)",
      "--primary": "oklch(0.55 0.05 60)",
      "--primary-foreground": "oklch(0.98 0.008 80)",
      "--secondary": "oklch(0.94 0.015 75)",
      "--secondary-foreground": "oklch(0.35 0.025 60)",
      "--muted": "oklch(0.94 0.015 75)",
      "--muted-foreground": "oklch(0.5 0.02 65)",
      "--accent": "oklch(0.92 0.025 70)",
      "--accent-foreground": "oklch(0.32 0.025 60)",
      "--border": "oklch(0.9 0.015 75)",
      "--input": "oklch(0.9 0.015 75)",
      "--ring": "oklch(0.7 0.03 65)",
      "--income": "oklch(0.7 0.07 145)",
      "--expense": "oklch(0.62 0.09 28)",
    },
  },
  {
    id: "cloud-white",
    nameEn: "Cloud White",
    nameTh: "เมฆขาว",
    swatch: ["#fafbfc", "#e8ecf1", "#94a3b8", "#3b82f6"],
    vars: {
      "--background": "oklch(0.985 0.005 250)",
      "--foreground": "oklch(0.25 0.02 250)",
      "--card": "oklch(1 0 0)",
      "--card-foreground": "oklch(0.25 0.02 250)",
      "--popover": "oklch(1 0 0)",
      "--popover-foreground": "oklch(0.25 0.02 250)",
      "--primary": "oklch(0.6 0.08 240)",
      "--primary-foreground": "oklch(0.99 0 0)",
      "--secondary": "oklch(0.95 0.01 250)",
      "--secondary-foreground": "oklch(0.3 0.02 250)",
      "--muted": "oklch(0.95 0.01 250)",
      "--muted-foreground": "oklch(0.5 0.02 250)",
      "--accent": "oklch(0.93 0.015 240)",
      "--accent-foreground": "oklch(0.3 0.02 250)",
      "--border": "oklch(0.9 0.012 250)",
      "--input": "oklch(0.9 0.012 250)",
      "--ring": "oklch(0.7 0.04 240)",
      "--income": "oklch(0.72 0.08 150)",
      "--expense": "oklch(0.65 0.1 25)",
    },
  },
  {
    id: "sage-cream",
    nameEn: "Sage & Cream",
    nameTh: "เซจครีม",
    swatch: ["#f5f0e8", "#dce5d4", "#a8c0a0", "#7d9b76"],
    vars: {
      "--background": "oklch(0.97 0.012 100)",
      "--foreground": "oklch(0.28 0.025 140)",
      "--card": "oklch(0.99 0.008 100)",
      "--card-foreground": "oklch(0.28 0.025 140)",
      "--popover": "oklch(0.99 0.008 100)",
      "--popover-foreground": "oklch(0.28 0.025 140)",
      "--primary": "oklch(0.55 0.05 140)",
      "--primary-foreground": "oklch(0.98 0.008 100)",
      "--secondary": "oklch(0.92 0.02 130)",
      "--secondary-foreground": "oklch(0.32 0.03 140)",
      "--muted": "oklch(0.93 0.018 120)",
      "--muted-foreground": "oklch(0.5 0.02 130)",
      "--accent": "oklch(0.9 0.03 140)",
      "--accent-foreground": "oklch(0.3 0.03 140)",
      "--border": "oklch(0.88 0.02 130)",
      "--input": "oklch(0.88 0.02 130)",
      "--ring": "oklch(0.7 0.04 140)",
      "--income": "oklch(0.65 0.08 145)",
      "--expense": "oklch(0.62 0.08 30)",
    },
  },
  {
    id: "blush-lavender",
    nameEn: "Blush & Lavender",
    nameTh: "ชมพูลาเวนเดอร์",
    swatch: ["#f8e8ee", "#e8c5d0", "#c9a0dc", "#9b72cf"],
    vars: {
      "--background": "oklch(0.97 0.012 340)",
      "--foreground": "oklch(0.3 0.04 320)",
      "--card": "oklch(0.99 0.006 340)",
      "--card-foreground": "oklch(0.3 0.04 320)",
      "--popover": "oklch(0.99 0.006 340)",
      "--popover-foreground": "oklch(0.3 0.04 320)",
      "--primary": "oklch(0.6 0.08 310)",
      "--primary-foreground": "oklch(0.99 0 0)",
      "--secondary": "oklch(0.93 0.025 340)",
      "--secondary-foreground": "oklch(0.35 0.04 320)",
      "--muted": "oklch(0.93 0.02 340)",
      "--muted-foreground": "oklch(0.5 0.03 320)",
      "--accent": "oklch(0.9 0.04 320)",
      "--accent-foreground": "oklch(0.32 0.04 320)",
      "--border": "oklch(0.88 0.025 330)",
      "--input": "oklch(0.88 0.025 330)",
      "--ring": "oklch(0.7 0.05 320)",
      "--income": "oklch(0.7 0.08 150)",
      "--expense": "oklch(0.65 0.09 20)",
    },
  },
  {
    id: "ocean-deep",
    nameEn: "Ocean Mist",
    nameTh: "หมอกทะเล",
    swatch: ["#eaf2f5", "#c8dce4", "#5cbdb9", "#2d6e8a"],
    vars: {
      "--background": "oklch(0.96 0.012 220)",
      "--foreground": "oklch(0.27 0.04 230)",
      "--card": "oklch(0.99 0.006 220)",
      "--card-foreground": "oklch(0.27 0.04 230)",
      "--popover": "oklch(0.99 0.006 220)",
      "--popover-foreground": "oklch(0.27 0.04 230)",
      "--primary": "oklch(0.55 0.07 220)",
      "--primary-foreground": "oklch(0.99 0 0)",
      "--secondary": "oklch(0.92 0.02 210)",
      "--secondary-foreground": "oklch(0.32 0.04 230)",
      "--muted": "oklch(0.92 0.018 215)",
      "--muted-foreground": "oklch(0.5 0.03 225)",
      "--accent": "oklch(0.9 0.03 200)",
      "--accent-foreground": "oklch(0.3 0.04 230)",
      "--border": "oklch(0.88 0.02 215)",
      "--input": "oklch(0.88 0.02 215)",
      "--ring": "oklch(0.7 0.04 220)",
      "--income": "oklch(0.7 0.08 160)",
      "--expense": "oklch(0.63 0.09 25)",
    },
  },
  {
    id: "paper-ink",
    nameEn: "Paper & Ink",
    nameTh: "กระดาษหมึก",
    swatch: ["#f5f3ee", "#e8e4dd", "#7a7873", "#2d2d2d"],
    vars: {
      "--background": "oklch(0.965 0.005 90)",
      "--foreground": "oklch(0.22 0.005 90)",
      "--card": "oklch(0.99 0.003 90)",
      "--card-foreground": "oklch(0.22 0.005 90)",
      "--popover": "oklch(0.99 0.003 90)",
      "--popover-foreground": "oklch(0.22 0.005 90)",
      "--primary": "oklch(0.3 0.005 90)",
      "--primary-foreground": "oklch(0.97 0.005 90)",
      "--secondary": "oklch(0.93 0.008 90)",
      "--secondary-foreground": "oklch(0.28 0.005 90)",
      "--muted": "oklch(0.93 0.008 90)",
      "--muted-foreground": "oklch(0.5 0.005 90)",
      "--accent": "oklch(0.91 0.01 90)",
      "--accent-foreground": "oklch(0.28 0.005 90)",
      "--border": "oklch(0.88 0.008 90)",
      "--input": "oklch(0.88 0.008 90)",
      "--ring": "oklch(0.65 0.008 90)",
      "--income": "oklch(0.65 0.07 145)",
      "--expense": "oklch(0.6 0.08 28)",
    },
  },
  {
    id: "midnight",
    nameEn: "Midnight Indigo",
    nameTh: "ราตรีคราม",
    swatch: ["#1a1a2e", "#252548", "#4f46e5", "#a5b4fc"],
    vars: {
      "--background": "oklch(0.2 0.03 270)",
      "--foreground": "oklch(0.94 0.01 270)",
      "--card": "oklch(0.25 0.035 270)",
      "--card-foreground": "oklch(0.94 0.01 270)",
      "--popover": "oklch(0.25 0.035 270)",
      "--popover-foreground": "oklch(0.94 0.01 270)",
      "--primary": "oklch(0.7 0.12 270)",
      "--primary-foreground": "oklch(0.2 0.03 270)",
      "--secondary": "oklch(0.3 0.04 270)",
      "--secondary-foreground": "oklch(0.94 0.01 270)",
      "--muted": "oklch(0.3 0.04 270)",
      "--muted-foreground": "oklch(0.7 0.02 270)",
      "--accent": "oklch(0.35 0.05 270)",
      "--accent-foreground": "oklch(0.94 0.01 270)",
      "--border": "oklch(0.35 0.04 270)",
      "--input": "oklch(0.35 0.04 270)",
      "--ring": "oklch(0.6 0.1 270)",
      "--income": "oklch(0.75 0.1 150)",
      "--expense": "oklch(0.7 0.12 20)",
    },
  },
  {
    id: "terracotta-sage",
    nameEn: "Terracotta & Sage",
    nameTh: "ดินเผาเซจ",
    swatch: ["#f5ede4", "#e8a87c", "#87a878", "#4a6741"],
    vars: {
      "--background": "oklch(0.96 0.018 70)",
      "--foreground": "oklch(0.3 0.04 50)",
      "--card": "oklch(0.99 0.008 70)",
      "--card-foreground": "oklch(0.3 0.04 50)",
      "--popover": "oklch(0.99 0.008 70)",
      "--popover-foreground": "oklch(0.3 0.04 50)",
      "--primary": "oklch(0.6 0.1 40)",
      "--primary-foreground": "oklch(0.98 0.008 70)",
      "--secondary": "oklch(0.92 0.025 70)",
      "--secondary-foreground": "oklch(0.32 0.04 50)",
      "--muted": "oklch(0.92 0.02 70)",
      "--muted-foreground": "oklch(0.5 0.03 60)",
      "--accent": "oklch(0.9 0.035 60)",
      "--accent-foreground": "oklch(0.3 0.04 50)",
      "--border": "oklch(0.87 0.025 65)",
      "--input": "oklch(0.87 0.025 65)",
      "--ring": "oklch(0.7 0.06 50)",
      "--income": "oklch(0.62 0.08 145)",
      "--expense": "oklch(0.62 0.1 30)",
    },
  },
  {
    id: "arctic-frost",
    nameEn: "Arctic Frost",
    nameTh: "น้ำแข็งอาร์กติก",
    swatch: ["#e8f0f8", "#cfe0ee", "#6ba3c8", "#2e6b8a"],
    vars: {
      "--background": "oklch(0.97 0.01 230)",
      "--foreground": "oklch(0.28 0.03 235)",
      "--card": "oklch(0.99 0.005 230)",
      "--card-foreground": "oklch(0.28 0.03 235)",
      "--popover": "oklch(0.99 0.005 230)",
      "--popover-foreground": "oklch(0.28 0.03 235)",
      "--primary": "oklch(0.55 0.08 230)",
      "--primary-foreground": "oklch(0.99 0 0)",
      "--secondary": "oklch(0.93 0.018 230)",
      "--secondary-foreground": "oklch(0.32 0.03 235)",
      "--muted": "oklch(0.93 0.015 230)",
      "--muted-foreground": "oklch(0.5 0.025 230)",
      "--accent": "oklch(0.9 0.025 220)",
      "--accent-foreground": "oklch(0.3 0.03 235)",
      "--border": "oklch(0.88 0.02 230)",
      "--input": "oklch(0.88 0.02 230)",
      "--ring": "oklch(0.7 0.04 230)",
      "--income": "oklch(0.72 0.08 155)",
      "--expense": "oklch(0.65 0.09 25)",
    },
  },
  {
    id: "cherry-blossom",
    nameEn: "Cherry Blossom",
    nameTh: "ซากุระ",
    swatch: ["#fef0f5", "#f8c8d8", "#e88aab", "#a85c7c"],
    vars: {
      "--background": "oklch(0.975 0.01 0)",
      "--foreground": "oklch(0.3 0.04 0)",
      "--card": "oklch(0.99 0.005 0)",
      "--card-foreground": "oklch(0.3 0.04 0)",
      "--popover": "oklch(0.99 0.005 0)",
      "--popover-foreground": "oklch(0.3 0.04 0)",
      "--primary": "oklch(0.6 0.1 0)",
      "--primary-foreground": "oklch(0.99 0 0)",
      "--secondary": "oklch(0.93 0.02 0)",
      "--secondary-foreground": "oklch(0.32 0.04 0)",
      "--muted": "oklch(0.93 0.018 0)",
      "--muted-foreground": "oklch(0.5 0.03 0)",
      "--accent": "oklch(0.9 0.03 0)",
      "--accent-foreground": "oklch(0.32 0.04 0)",
      "--border": "oklch(0.88 0.022 0)",
      "--input": "oklch(0.88 0.022 0)",
      "--ring": "oklch(0.7 0.05 0)",
      "--income": "oklch(0.7 0.08 150)",
      "--expense": "oklch(0.62 0.1 25)",
    },
  },
];

export const translations = {
  en: {
    appName: "Mindful Spend",
    dashboard: "Dashboard",
    history: "History",
    settings: "Settings",
    balance: "Current Balance",
    income: "Income",
    expense: "Expense",
    expenses: "Expenses",
    thisMonth: "This Month",
    expensesByCategory: "Expenses by Category",
    noData: "No data yet",
    add: "Add",
    addTransaction: "Add Transaction",
    amount: "Amount",
    category: "Category",
    paymentMethod: "Payment Method",
    note: "Note",
    date: "Date",
    save: "Save",
    cancel: "Cancel",
    recent: "Recent Transactions",
    noTransactions: "No transactions yet. Tap + to add one.",
    delete: "Delete",
    confirmDelete: "Delete this transaction?",
    theme: "Color Theme",
    wallpaper: "Custom Wallpaper",
    uploadWallpaper: "Upload Image",
    removeWallpaper: "Remove Wallpaper",
    language: "Language",
    today: "Today",
    yesterday: "Yesterday",
    optional: "optional",
    amountRequired: "Please enter an amount greater than zero",
    categories: {
      Food: "Food",
      Transport: "Transport",
      Utilities: "Utilities",
      Shopping: "Shopping",
      Salary: "Salary",
      Other: "Other",
    },
    methods: { Cash: "Cash", Bank: "Bank", Card: "Card" },
  },
  th: {
    appName: "บันทึกรายรับ-รายจ่าย",
    dashboard: "แดชบอร์ด",
    history: "ประวัติ",
    settings: "ตั้งค่า",
    balance: "ยอดเงินคงเหลือ",
    income: "รายรับ",
    expense: "รายจ่าย",
    expenses: "รายจ่าย",
    thisMonth: "เดือนนี้",
    expensesByCategory: "รายจ่ายตามหมวดหมู่",
    noData: "ยังไม่มีข้อมูล",
    add: "เพิ่ม",
    addTransaction: "เพิ่มรายการ",
    amount: "จำนวนเงิน",
    category: "หมวดหมู่",
    paymentMethod: "ช่องทางจ่าย",
    note: "บันทึก",
    date: "วันที่",
    save: "บันทึก",
    cancel: "ยกเลิก",
    recent: "รายการล่าสุด",
    noTransactions: "ยังไม่มีรายการ กดปุ่ม + เพื่อเพิ่ม",
    delete: "ลบ",
    confirmDelete: "ลบรายการนี้?",
    theme: "ธีมสี",
    wallpaper: "วอลเปเปอร์",
    uploadWallpaper: "อัปโหลดรูปภาพ",
    removeWallpaper: "ลบวอลเปเปอร์",
    language: "ภาษา",
    today: "วันนี้",
    yesterday: "เมื่อวาน",
    optional: "ไม่บังคับ",
    amountRequired: "กรุณากรอกจำนวนเงินที่มากกว่าศูนย์",
    categories: {
      Food: "อาหาร",
      Transport: "เดินทาง",
      Utilities: "ค่าสาธารณูปโภค",
      Shopping: "ช้อปปิ้ง",
      Salary: "เงินเดือน",
      Other: "อื่นๆ",
    },
    methods: { Cash: "เงินสด", Bank: "ธนาคาร", Card: "บัตร" },
  },
} as const;

export const CATEGORY_KEYS = ["Food", "Transport", "Utilities", "Shopping", "Salary", "Other"] as const;
export const METHOD_KEYS = ["Cash", "Bank", "Card"] as const;

interface StoreCtx {
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, "id" | "createdAt">) => void;
  deleteTransaction: (id: string) => void;
  theme: string;
  setTheme: (id: string) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (typeof translations)["en"] | (typeof translations)["th"];
  wallpaper: string | null;
  setWallpaper: (w: string | null) => void;
}

const Ctx = createContext<StoreCtx | null>(null);

const LS = {
  tx: "et.transactions",
  theme: "et.theme",
  lang: "et.lang",
  wallpaper: "et.wallpaper",
};

function applyTheme(themeId: string) {
  const preset = THEME_PRESETS.find((p) => p.id === themeId) ?? THEME_PRESETS[0];
  const root = document.documentElement;
  Object.entries(preset.vars).forEach(([k, v]) => root.style.setProperty(k, v));
}

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [theme, setThemeState] = useState<string>("warm-sand");
  const [lang, setLangState] = useState<Lang>("en");
  const [wallpaper, setWallpaperState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const tx = localStorage.getItem(LS.tx);
      if (tx) setTransactions(JSON.parse(tx));
      const th = localStorage.getItem(LS.theme);
      if (th) setThemeState(th);
      const lg = localStorage.getItem(LS.lang) as Lang | null;
      if (lg === "th" || lg === "en") setLangState(lg);
      const wp = localStorage.getItem(LS.wallpaper);
      if (wp) setWallpaperState(wp);
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) applyTheme(theme);
  }, [theme, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(LS.tx, JSON.stringify(transactions));
  }, [transactions, hydrated]);

  const addTransaction: StoreCtx["addTransaction"] = (t) => {
    setTransactions((prev) => [
      { ...t, id: crypto.randomUUID(), createdAt: Date.now() },
      ...prev,
    ]);
  };

  const deleteTransaction = (id: string) =>
    setTransactions((prev) => prev.filter((t) => t.id !== id));

  const setTheme = (id: string) => {
    setThemeState(id);
    localStorage.setItem(LS.theme, id);
  };
  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem(LS.lang, l);
  };
  const setWallpaper = (w: string | null) => {
    setWallpaperState(w);
    if (w) localStorage.setItem(LS.wallpaper, w);
    else localStorage.removeItem(LS.wallpaper);
  };

  return (
    <Ctx.Provider
      value={{
        transactions,
        addTransaction,
        deleteTransaction,
        theme,
        setTheme,
        lang,
        setLang,
        t: translations[lang],
        wallpaper,
        setWallpaper,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore must be inside ExpenseProvider");
  return v;
}

export function formatCurrency(n: number, lang: Lang) {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString(lang === "th" ? "th-TH" : "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${sign}${lang === "th" ? "฿" : "$"}${formatted}`;
}
