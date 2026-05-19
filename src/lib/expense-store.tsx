import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";

export type TxType = "income" | "expense";
export type Lang = "en" | "th";
export type CurrencyCode = "THB" | "USD" | "JPY" | "EUR" | "KRW";

export const CURRENCIES: { code: CurrencyCode; symbol: string; label: string }[] = [
  { code: "THB", symbol: "฿", label: "฿ THB" },
  { code: "USD", symbol: "$", label: "$ USD" },
  { code: "JPY", symbol: "¥", label: "¥ JPY" },
  { code: "EUR", symbol: "€", label: "€ EUR" },
  { code: "KRW", symbol: "₩", label: "₩ KRW" },
];

export interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  category: string;
  method: string;
  note: string;
  date: string;
  createdAt: number;
}

export interface ThemePreset {
  id: string;
  nameEn: string;
  nameTh: string;
  accentColor: string;
  lightVars: Record<string, string>;
  darkVars: Record<string, string>;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "blue",
    nameEn: "Classic Blue",
    nameTh: "น้ำเงินคลาสสิก",
    accentColor: "#3b82f6",
    lightVars: {
      "--background": "oklch(0.985 0.005 240)",
      "--foreground": "oklch(0.22 0.025 240)",
      "--card": "oklch(1 0 0)",
      "--card-foreground": "oklch(0.22 0.025 240)",
      "--popover": "oklch(1 0 0)",
      "--popover-foreground": "oklch(0.22 0.025 240)",
      "--primary": "oklch(0.58 0.19 250)",
      "--primary-foreground": "oklch(0.99 0 0)",
      "--secondary": "oklch(0.94 0.015 240)",
      "--secondary-foreground": "oklch(0.3 0.025 240)",
      "--muted": "oklch(0.94 0.012 240)",
      "--muted-foreground": "oklch(0.52 0.025 240)",
      "--accent": "oklch(0.92 0.03 240)",
      "--accent-foreground": "oklch(0.28 0.025 240)",
      "--border": "oklch(0.89 0.015 240)",
      "--input": "oklch(0.89 0.015 240)",
      "--ring": "oklch(0.72 0.1 250)",
      "--income": "oklch(0.68 0.15 160)",
      "--expense": "oklch(0.62 0.18 28)",
    },
    darkVars: {
      "--background": "oklch(0.14 0.02 240)",
      "--foreground": "oklch(0.93 0.01 240)",
      "--card": "oklch(0.19 0.025 240)",
      "--card-foreground": "oklch(0.93 0.01 240)",
      "--popover": "oklch(0.19 0.025 240)",
      "--popover-foreground": "oklch(0.93 0.01 240)",
      "--primary": "oklch(0.65 0.2 250)",
      "--primary-foreground": "oklch(0.14 0.02 240)",
      "--secondary": "oklch(0.26 0.03 240)",
      "--secondary-foreground": "oklch(0.93 0.01 240)",
      "--muted": "oklch(0.26 0.025 240)",
      "--muted-foreground": "oklch(0.65 0.02 240)",
      "--accent": "oklch(0.3 0.04 240)",
      "--accent-foreground": "oklch(0.93 0.01 240)",
      "--border": "oklch(0.3 0.03 240)",
      "--input": "oklch(0.3 0.03 240)",
      "--ring": "oklch(0.58 0.15 250)",
      "--income": "oklch(0.72 0.16 160)",
      "--expense": "oklch(0.7 0.18 25)",
    },
  },
  {
    id: "green",
    nameEn: "Emerald Green",
    nameTh: "เขียวมรกต",
    accentColor: "#22c55e",
    lightVars: {
      "--background": "oklch(0.98 0.008 145)",
      "--foreground": "oklch(0.22 0.025 145)",
      "--card": "oklch(1 0 0)",
      "--card-foreground": "oklch(0.22 0.025 145)",
      "--popover": "oklch(1 0 0)",
      "--popover-foreground": "oklch(0.22 0.025 145)",
      "--primary": "oklch(0.55 0.18 155)",
      "--primary-foreground": "oklch(0.99 0 0)",
      "--secondary": "oklch(0.94 0.02 145)",
      "--secondary-foreground": "oklch(0.3 0.025 145)",
      "--muted": "oklch(0.94 0.015 145)",
      "--muted-foreground": "oklch(0.52 0.02 145)",
      "--accent": "oklch(0.92 0.03 145)",
      "--accent-foreground": "oklch(0.28 0.025 145)",
      "--border": "oklch(0.89 0.018 145)",
      "--input": "oklch(0.89 0.018 145)",
      "--ring": "oklch(0.68 0.12 155)",
      "--income": "oklch(0.6 0.18 155)",
      "--expense": "oklch(0.62 0.18 28)",
    },
    darkVars: {
      "--background": "oklch(0.14 0.02 145)",
      "--foreground": "oklch(0.93 0.01 145)",
      "--card": "oklch(0.19 0.025 145)",
      "--card-foreground": "oklch(0.93 0.01 145)",
      "--popover": "oklch(0.19 0.025 145)",
      "--popover-foreground": "oklch(0.93 0.01 145)",
      "--primary": "oklch(0.62 0.2 155)",
      "--primary-foreground": "oklch(0.14 0.02 145)",
      "--secondary": "oklch(0.26 0.03 145)",
      "--secondary-foreground": "oklch(0.93 0.01 145)",
      "--muted": "oklch(0.26 0.025 145)",
      "--muted-foreground": "oklch(0.65 0.02 145)",
      "--accent": "oklch(0.3 0.04 145)",
      "--accent-foreground": "oklch(0.93 0.01 145)",
      "--border": "oklch(0.3 0.03 145)",
      "--input": "oklch(0.3 0.03 145)",
      "--ring": "oklch(0.55 0.15 155)",
      "--income": "oklch(0.72 0.18 155)",
      "--expense": "oklch(0.7 0.18 25)",
    },
  },
  {
    id: "rose",
    nameEn: "Soft Rose",
    nameTh: "กุหลาบอ่อน",
    accentColor: "#f43f5e",
    lightVars: {
      "--background": "oklch(0.985 0.008 10)",
      "--foreground": "oklch(0.22 0.025 10)",
      "--card": "oklch(1 0 0)",
      "--card-foreground": "oklch(0.22 0.025 10)",
      "--popover": "oklch(1 0 0)",
      "--popover-foreground": "oklch(0.22 0.025 10)",
      "--primary": "oklch(0.58 0.22 10)",
      "--primary-foreground": "oklch(0.99 0 0)",
      "--secondary": "oklch(0.95 0.02 10)",
      "--secondary-foreground": "oklch(0.3 0.025 10)",
      "--muted": "oklch(0.95 0.015 10)",
      "--muted-foreground": "oklch(0.52 0.025 10)",
      "--accent": "oklch(0.93 0.03 10)",
      "--accent-foreground": "oklch(0.28 0.025 10)",
      "--border": "oklch(0.9 0.018 10)",
      "--input": "oklch(0.9 0.018 10)",
      "--ring": "oklch(0.7 0.15 10)",
      "--income": "oklch(0.68 0.15 160)",
      "--expense": "oklch(0.58 0.22 10)",
    },
    darkVars: {
      "--background": "oklch(0.14 0.02 10)",
      "--foreground": "oklch(0.93 0.01 10)",
      "--card": "oklch(0.19 0.025 10)",
      "--card-foreground": "oklch(0.93 0.01 10)",
      "--popover": "oklch(0.19 0.025 10)",
      "--popover-foreground": "oklch(0.93 0.01 10)",
      "--primary": "oklch(0.65 0.23 10)",
      "--primary-foreground": "oklch(0.14 0.02 10)",
      "--secondary": "oklch(0.26 0.03 10)",
      "--secondary-foreground": "oklch(0.93 0.01 10)",
      "--muted": "oklch(0.26 0.025 10)",
      "--muted-foreground": "oklch(0.65 0.02 10)",
      "--accent": "oklch(0.3 0.04 10)",
      "--accent-foreground": "oklch(0.93 0.01 10)",
      "--border": "oklch(0.3 0.03 10)",
      "--input": "oklch(0.3 0.03 10)",
      "--ring": "oklch(0.58 0.18 10)",
      "--income": "oklch(0.72 0.16 160)",
      "--expense": "oklch(0.7 0.22 10)",
    },
  },
];

// Default category keys split by transaction type
export const EXPENSE_CATEGORY_KEYS = ["Food", "Transport", "Shopping", "Housing", "Entertainment"] as const;
export const INCOME_CATEGORY_KEYS = ["Salary", "SideIncome", "Bonus", "Investment"] as const;
// Legacy export for back-compat (kept so other imports don't break)
export const CATEGORY_KEYS = [...EXPENSE_CATEGORY_KEYS, ...INCOME_CATEGORY_KEYS] as const;
export const METHOD_KEYS = ["Cash", "Bank", "Card"] as const;

export const translations = {
  en: {
    appName: "เช็คตังค์",
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
    selectCategory: "Select Category",
    addNewCategory: "Add new category",
    newCategoryPrompt: "Enter the new category name",
    newCategoryPlaceholder: "Category name",
    categoryRequired: "Please select a category before saving",
    paymentMethod: "Payment Method",
    note: "Note",
    date: "Date",
    save: "Save",
    cancel: "Cancel",
    recent: "Recent Transactions",
    noTransactions: "No transactions yet. Tap + to add one.",
    delete: "Delete",
    editTransaction: "Edit Transaction",
    confirmDelete: "Delete this transaction?",
    theme: "Color Theme",
    wallpaper: "Custom Wallpaper",
    uploadWallpaper: "Upload Image",
    removeWallpaper: "Remove Wallpaper",
    language: "Language",
    today: "Today",
    yesterday: "Yesterday",
    optional: "optional",
    addAnother: "Add another",
    itemCount: "items",
    amountRequired: "Please enter an amount greater than zero",
    viewTutorial: "View Tutorial Guide",
    tutorial: {
      skip: "Skip",
      next: "Next",
      back: "Back",
      getStarted: "Get Started",
      s1Title: "Welcome to CheckTang!",
      s1Body: "The simplest way to track your daily expenses and income.",
      s2Title: "Smart Input",
      s2Body:
        "Our dynamic number pad with auto-comma and cash/transfer tags makes logging transactions lightning fast.",
      s3Title: "Beautiful Summaries",
      s3Body:
        "Instantly see where your money goes on your clean, simplified financial dashboard.",
      s4Title: "You're all set!",
      s4Body:
        "Take control of your money today. Let's start tracking together!",
    },
    categories: {
      Food: "Food",
      Transport: "Transport",
      Shopping: "Shopping",
      Housing: "Housing",
      Entertainment: "Entertainment",
      Salary: "Salary",
      SideIncome: "Side Income",
      Bonus: "Bonus",
      Investment: "Investment",
      Utilities: "Utilities",
      Other: "Other",
    },
    methods: { Cash: "Cash", Bank: "Bank", Card: "Card" },
  },
  th: {
    appName: "เช็คตังค์",
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
    selectCategory: "เลือกหมวดหมู่",
    addNewCategory: "เพิ่มหมวดหมู่ใหม่",
    newCategoryPrompt: "ตั้งชื่อหมวดหมู่ใหม่",
    newCategoryPlaceholder: "ชื่อหมวดหมู่",
    categoryRequired: "กรุณาเลือกหมวดหมู่ก่อนบันทึก",
    paymentMethod: "ช่องทางจ่าย",
    note: "บันทึก",
    date: "วันที่",
    save: "บันทึก",
    cancel: "ยกเลิก",
    recent: "รายการล่าสุด",
    noTransactions: "ยังไม่มีรายการ กดปุ่ม + เพื่อเพิ่ม",
    delete: "ลบ",
    editTransaction: "แก้ไขรายการ",
    confirmDelete: "ลบรายการนี้?",
    theme: "ธีมสี",
    wallpaper: "วอลเปเปอร์",
    uploadWallpaper: "อัปโหลดรูปภาพ",
    removeWallpaper: "ลบวอลเปเปอร์",
    language: "ภาษา",
    today: "วันนี้",
    yesterday: "เมื่อวาน",
    optional: "ไม่บังคับ",
    addAnother: "เพิ่มอีก",
    itemCount: "รายการ",
    amountRequired: "กรุณากรอกจำนวนเงินที่มากกว่าศูนย์",
    viewTutorial: "ดูคู่มือการใช้งานอีกครั้ง",
    tutorial: {
      skip: "ข้าม",
      next: "ถัดไป",
      back: "ย้อนกลับ",
      getStarted: "เริ่มใช้งานเลย",
      s1Title: "สวัสดีครับ! เช็คตังค์พร้อมช่วยคุมเงินแล้ว",
      s1Body: "แอปนี้ใช้ง่ายมาก เดี๋ยวเราเล่าให้ฟังแบบกระชับใน 3 สเต็ปนะ ไปดูกันเลย!",
      s2Title: "บันทึกง่ายๆ ในไม่กี่วิ",
      s2Body:
        "คุณแค่เลือกแท็บ ใส่ตัวเลขเงิน แล้วเลือกหมวดหมู่ที่ใช่ จากนั้นกดบันทึกก็เรียบร้อยแล้ว",
      s3Title: "ดูยอดสรุปเข้าใจง่ายสุดๆ",
      s3Body:
        "อยากรู้ว่าเงินหายไปไหน? แดชบอร์ดวงกลมจะแยกยอดรวม รายรับ-รายจ่ายให้คุณเห็นชัดๆ เลยล่ะ",
      s4Title: "ลองบันทึกรายการแรกดู!",
      s4Body:
        "พร้อมแล้วกดปุ่มเครื่องหมาย '+' สีฟ้าอันใหญ่ด้านล่างนี้เพื่อเริ่มคุมเงินวันนี้กันเลย!",
    },
    categories: {
      Food: "อาหาร",
      Transport: "เดินทาง",
      Shopping: "ช้อปปิ้ง",
      Housing: "ที่อยู่อาศัย",
      Entertainment: "บันเทิง",
      Salary: "เงินเดือน",
      SideIncome: "รายได้เสริม",
      Bonus: "โบนัส",
      Investment: "การลงทุน",
      Utilities: "ค่าสาธารณูปโภค",
      Other: "อื่นๆ",
    },
    methods: { Cash: "เงินสด", Bank: "ธนาคาร", Card: "บัตร" },
  },
} as const;

export interface CustomCategories {
  income: string[];
  expense: string[];
}

interface StoreCtx {
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, "id" | "createdAt">) => void;
  addTransactions: (items: Array<Omit<Transaction, "id" | "createdAt">>) => void;
  updateTransaction: (id: string, updatedData: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  theme: string;
  setTheme: (id: string) => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (typeof translations)["en"] | (typeof translations)["th"];
  wallpaper: string | null;
  setWallpaper: (w: string | null) => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  customCategories: CustomCategories;
  addCustomCategory: (type: TxType, name: string) => boolean;
  getCategoriesFor: (type: TxType) => string[];
  hasSeenTutorial: boolean;
  setHasSeenTutorial: (v: boolean) => void;
  showTutorial: boolean;
  openTutorial: () => void;
  closeTutorial: (markSeen?: boolean) => void;
}

const Ctx = createContext<StoreCtx | null>(null);

const LS = {
  tx: "et.transactions",
  theme: "et.theme",
  darkMode: "et.darkMode",
  lang: "et.lang",
  wallpaper: "et.wallpaper",
  currency: "et.currency",
  customCats: "et.customCategories",
  tutorial: "hasSeenTutorial",
};

function applyTheme(themeId: string, darkMode: boolean) {
  const preset = THEME_PRESETS.find((p) => p.id === themeId) ?? THEME_PRESETS[0];
  const root = document.documentElement;
  root.classList.toggle("dark", darkMode);
  const vars = darkMode ? preset.darkVars : preset.lightVars;
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
}

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [theme, setThemeState] = useState<string>("blue");
  const [darkMode, setDarkModeState] = useState<boolean>(false);
  const [lang, setLangState] = useState<Lang>("en");
  const [wallpaper, setWallpaperState] = useState<string | null>(null);
  const [currency, setCurrencyState] = useState<CurrencyCode>("THB");
  const [customCategories, setCustomCategories] = useState<CustomCategories>({
    income: [],
    expense: [],
  });
  const [hasSeenTutorial, setHasSeenTutorialState] = useState<boolean>(true);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const tx = localStorage.getItem(LS.tx);
      if (tx) setTransactions(JSON.parse(tx));
      const th = localStorage.getItem(LS.theme);
      if (th && THEME_PRESETS.some((p) => p.id === th)) setThemeState(th);
      const dm = localStorage.getItem(LS.darkMode);
      if (dm !== null) setDarkModeState(dm === "true");
      const lg = localStorage.getItem(LS.lang) as Lang | null;
      if (lg === "th" || lg === "en") setLangState(lg);
      const wp = localStorage.getItem(LS.wallpaper);
      if (wp) setWallpaperState(wp);
      const cur = localStorage.getItem(LS.currency) as CurrencyCode | null;
      if (cur && CURRENCIES.some((c) => c.code === cur)) setCurrencyState(cur);
      const cc = localStorage.getItem(LS.customCats);
      if (cc) {
        const parsed = JSON.parse(cc);
        if (parsed && Array.isArray(parsed.income) && Array.isArray(parsed.expense)) {
          setCustomCategories({
            income: parsed.income.filter((s: unknown) => typeof s === "string"),
            expense: parsed.expense.filter((s: unknown) => typeof s === "string"),
          });
        }
      }
      const seen = localStorage.getItem(LS.tutorial);
      const seenBool = seen === "true";
      setHasSeenTutorialState(seenBool);
      if (!seenBool) setShowTutorial(true);
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) applyTheme(theme, darkMode);
  }, [theme, darkMode, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(LS.tx, JSON.stringify(transactions));
  }, [transactions, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(LS.customCats, JSON.stringify(customCategories));
  }, [customCategories, hydrated]);

  const addTransaction: StoreCtx["addTransaction"] = (t) => {
    setTransactions((prev) => [
      { ...t, id: crypto.randomUUID(), createdAt: Date.now() },
      ...prev,
    ]);
  };

  const addTransactions: StoreCtx["addTransactions"] = (items) => {
    if (!items.length) return;
    const now = Date.now();
    const prepared = items.map((item) => ({
      ...item,
      id: crypto.randomUUID(),
      createdAt: now,
    }));
    setTransactions((prev) => [...prepared, ...prev]);
  };

  const updateTransaction: StoreCtx["updateTransaction"] = (id, updatedData) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...updatedData } : tx))
    );
  };

  const deleteTransaction = (id: string) =>
    setTransactions((prev) => prev.filter((t) => t.id !== id));

  const setTheme = (id: string) => {
    setThemeState(id);
    localStorage.setItem(LS.theme, id);
  };
  const setDarkMode = (v: boolean) => {
    setDarkModeState(v);
    localStorage.setItem(LS.darkMode, String(v));
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
  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    localStorage.setItem(LS.currency, c);
  };

  const getCategoriesFor = useCallback(
    (type: TxType): string[] => {
      const defaults =
        type === "expense" ? [...EXPENSE_CATEGORY_KEYS] : [...INCOME_CATEGORY_KEYS];
      const customs = type === "expense" ? customCategories.expense : customCategories.income;
      // Deduplicate while preserving order
      const seen = new Set<string>();
      return [...defaults, ...customs].filter((c) => {
        if (seen.has(c)) return false;
        seen.add(c);
        return true;
      });
    },
    [customCategories]
  );

  const addCustomCategory: StoreCtx["addCustomCategory"] = (type, rawName) => {
    const name = rawName.trim();
    if (!name || name.length > 40) return false;
    const list = getCategoriesFor(type);
    if (list.includes(name)) return false;
    setCustomCategories((prev) => ({
      ...prev,
      [type]: [...prev[type], name],
    }));
    return true;
  };

  const setHasSeenTutorial = (v: boolean) => {
    setHasSeenTutorialState(v);
    localStorage.setItem(LS.tutorial, String(v));
  };

  const openTutorial = () => setShowTutorial(true);
  const closeTutorial = (markSeen = true) => {
    setShowTutorial(false);
    if (markSeen) setHasSeenTutorial(true);
  };

  return (
    <Ctx.Provider
      value={{
        transactions,
        addTransaction,
        addTransactions,
        updateTransaction,
        deleteTransaction,
        theme,
        setTheme,
        darkMode,
        setDarkMode,
        lang,
        setLang,
        t: translations[lang],
        wallpaper,
        setWallpaper,
        currency,
        setCurrency,
        customCategories,
        addCustomCategory,
        getCategoriesFor,
        hasSeenTutorial,
        setHasSeenTutorial,
        showTutorial,
        openTutorial,
        closeTutorial,
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

export function formatCurrency(n: number, lang: Lang, currency: CurrencyCode = "THB") {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  const symbol = CURRENCIES.find((c) => c.code === currency)?.symbol ?? "฿";
  const locale = lang === "th" ? "th-TH" : "en-US";
  const decimals = currency === "JPY" || currency === "KRW" ? 0 : 2;
  const formatted = abs.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${sign}${symbol}${formatted}`;
}

// Helper to display a category label (default key → translated, custom → as-is)
export function getCategoryLabel(
  category: string,
  tCategories: Readonly<Record<string, string>>
): string {
  return tCategories[category] ?? category;
}
