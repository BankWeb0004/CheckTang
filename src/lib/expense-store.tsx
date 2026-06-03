import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
  useCallback,
} from "react";

/* =======================================================================
 *  TYPES
 * ===================================================================== */

export type TxType = "income" | "expense" | "transfer";
export type Lang = "en" | "th";
export type CurrencyCode = "THB" | "USD" | "JPY" | "EUR" | "KRW";

export const CURRENCIES: { code: CurrencyCode; symbol: string; label: string }[] = [
  { code: "THB", symbol: "฿", label: "฿ THB" },
  { code: "USD", symbol: "$", label: "$ USD" },
  { code: "JPY", symbol: "¥", label: "¥ JPY" },
  { code: "EUR", symbol: "€", label: "€ EUR" },
  { code: "KRW", symbol: "₩", label: "₩ KRW" },
];

export interface Wallet {
  id: string;
  name: string;
  emoji: string;
  created_at: number;
}

export interface WalletWithBalance extends Wallet {
  balance: number;
}

export interface Transaction {
  id: string;
  wallet_id: string;
  to_wallet_id: string | null;
  type: TxType;
  amount: number;
  category_name: string;
  category_emoji: string;
  note: string;
  date: string; // ISO yyyy-mm-dd
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

/* =======================================================================
 *  THEME PRESETS (unchanged from v1)
 * ===================================================================== */

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

/* =======================================================================
 *  CATEGORIES (default keys)
 * ===================================================================== */

export const EXPENSE_CATEGORY_KEYS = [
  "Food",
  "Transport",
  "Shopping",
  "Housing",
  "Entertainment",
] as const;
export const INCOME_CATEGORY_KEYS = [
  "Salary",
  "SideIncome",
  "Bonus",
  "Investment",
] as const;
export const CATEGORY_KEYS = [
  ...EXPENSE_CATEGORY_KEYS,
  ...INCOME_CATEGORY_KEYS,
] as const;

export const DEFAULT_CATEGORY_EMOJI: Record<string, string> = {
  Food: "🍜",
  Transport: "🚌",
  Shopping: "🛍️",
  Housing: "🏠",
  Entertainment: "🎮",
  Salary: "💼",
  SideIncome: "💡",
  Bonus: "🎁",
  Investment: "📈",
  Utilities: "💡",
  Other: "📦",
};

/* =======================================================================
 *  TRANSLATIONS
 * ===================================================================== */

export const translations = {
  en: {
    appName: "เช็คตังค์",
    dashboard: "Dashboard",
    history: "History",
    wallets: "Wallets",
    settings: "Settings",
    balance: "Net Worth",
    income: "Income",
    expense: "Expense",
    transfer: "Transfer",
    expenses: "Expenses",
    thisMonth: "This Month",
    expensesByCategory: "Expenses by Category",
    incomeByCategory: "Income by Category",
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
    walletRequired: "Please select a wallet before saving",
    toWalletRequired: "Please pick a destination wallet",
    sameWalletError: "Source and destination cannot be the same",
    fromWallet: "From Wallet",
    toWallet: "To Wallet",
    wallet: "Wallet",
    addWallet: "Add Wallet",
    walletName: "Wallet name",
    walletEmoji: "Emoji",
    quickSummary: "Wallets Quick Summary",
    deleteWallet: "Delete wallet",
    confirmDeleteWallet:
      "Delete this wallet? All linked transactions will be moved to your default wallet.",
    cannotDeleteLastWallet: "You cannot delete the only wallet",
    defaultWalletName: "Cash",
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
    emojiPlaceholder: "💰",
    filterAll: "All",
    monthlyIncome: "Monthly Income",
    monthlyExpense: "Monthly Expense",
    walletHistory: "Wallet Ledger",
    edit: "Edit",
    sentTo: "Sent to",
    receivedFrom: "Received from",
    appSettings: "App Settings",
    financialManagement: "Financial Management",
    aboutApp: "About App",
    wallpaperGallery: "Wallpapers (max 5)",
    addWallpaperSlot: "Add",
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
    } as Record<string, string>,
    methods: { Cash: "Cash", Bank: "Bank", Card: "Card" },
    monthlySavings: "Net Savings",
    totalIncome: "Total Income",
    totalExpense: "Total Expenses",
    adjustBalance: "Adjust Balance",
    newActualBalance: "New Actual Balance",
    adjustBalanceHint: "We'll log a correction entry for the difference.",
    adjustBalanceSuccess: "Balance adjusted",
    adjustmentCategory: "Balance Adjustment",
    noChange: "Balance is already up to date",
  },
  th: {
    appName: "เช็คตังค์",
    dashboard: "แดชบอร์ด",
    history: "ประวัติ",
    wallets: "กระเป๋าเงิน",
    settings: "ตั้งค่า",
    balance: "ยอดรวมทุกกระเป๋า",
    income: "รายรับ",
    expense: "รายจ่าย",
    transfer: "โอนเงิน",
    expenses: "รายจ่าย",
    thisMonth: "เดือนนี้",
    expensesByCategory: "รายจ่ายตามหมวดหมู่",
    incomeByCategory: "รายรับตามหมวดหมู่",
    noData: "ยังไม่มีข้อมูล",
    add: "เพิ่ม",
    addTransaction: "เพิ่มรายการ",
    amount: "จำนวนเงิน",
    category: "หมวดหมู่",
    selectCategory: "เลือกหมวดหมู่",
    addNewCategory: "เพิ่มหมวดหมู่ใหม่",
    newCategoryPrompt: "ตั้งชื่อหมวดหมู่ใหม่",
    newCategoryPlaceholder: "ชื่อหมวดหมู่ (ใส่ Emoji ได้)",
    categoryRequired: "กรุณาเลือกหมวดหมู่ก่อนบันทึก",
    walletRequired: "กรุณาเลือกกระเป๋าเงินก่อนบันทึก",
    toWalletRequired: "กรุณาเลือกกระเป๋าปลายทาง",
    sameWalletError: "กระเป๋าต้นทางและปลายทางต้องไม่ใช่ใบเดียวกัน",
    fromWallet: "กระเป๋าต้นทาง",
    toWallet: "กระเป๋าปลายทาง",
    wallet: "กระเป๋าเงิน",
    addWallet: "เพิ่มกระเป๋า",
    walletName: "ชื่อกระเป๋า",
    walletEmoji: "อิโมจิ",
    quickSummary: "สรุปกระเป๋าทั้งหมด",
    deleteWallet: "ลบกระเป๋า",
    confirmDeleteWallet:
      "ลบกระเป๋านี้? รายการที่ผูกอยู่จะถูกย้ายไปกระเป๋าหลักโดยอัตโนมัติ",
    cannotDeleteLastWallet: "ลบไม่ได้ — ต้องมีกระเป๋าอย่างน้อย 1 ใบ",
    defaultWalletName: "เงินสด",
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
    emojiPlaceholder: "💰",
    filterAll: "ทั้งหมด",
    monthlyIncome: "รายรับเดือนนี้",
    monthlyExpense: "รายจ่ายเดือนนี้",
    walletHistory: "รายการในกระเป๋านี้",
    edit: "แก้ไข",
    sentTo: "โอนไป",
    receivedFrom: "รับโอนจาก",
    appSettings: "ตั้งค่าแอป",
    financialManagement: "การจัดการข้อมูล",
    aboutApp: "เกี่ยวกับแอป",
    wallpaperGallery: "วอลเปเปอร์ (สูงสุด 5)",
    addWallpaperSlot: "เพิ่ม",
    tutorial: {
      skip: "ข้าม",
      next: "ถัดไป",
      back: "ย้อนกลับ",
      getStarted: "เริ่มใช้งานเลย",
      s1Title: "",
      s1Body: "",
      s2Title: "",
      s2Body: "",
      s3Title: "",
      s3Body: "",
      s4Title: "",
      s4Body: "",
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
    } as Record<string, string>,
    methods: { Cash: "เงินสด", Bank: "ธนาคาร", Card: "บัตร" },
    monthlySavings: "เงินคงเหลือของเดือน",
    totalIncome: "รายรับรวม",
    totalExpense: "รายจ่ายรวม",
    adjustBalance: "ปรับยอดเงิน",
    newActualBalance: "ยอดเงินจริงปัจจุบัน",
    adjustBalanceHint: "ระบบจะบันทึกรายการปรับยอดส่วนต่างให้อัตโนมัติ",
    adjustBalanceSuccess: "ปรับยอดเรียบร้อย",
    adjustmentCategory: "ปรับยอดเงิน",
    noChange: "ยอดตรงกับยอดในแอปแล้ว",
  },
} as const;

export interface CustomCategory {
  name: string;
  emoji: string;
}

export interface CustomCategories {
  income: CustomCategory[];
  expense: CustomCategory[];
}

/* =======================================================================
 *  STORE CONTEXT
 * ===================================================================== */

export interface NewTransactionInput {
  wallet_id: string;
  to_wallet_id?: string | null;
  type: TxType;
  amount: number;
  category_name: string;
  category_emoji?: string;
  note?: string;
  date: string;
}

interface StoreCtx {
  // wallets
  wallets: Wallet[];
  walletsWithBalance: WalletWithBalance[];
  defaultWalletId: string;
  addWallet: (name: string, emoji: string) => Wallet | null;
  updateWallet: (id: string, patch: Partial<Pick<Wallet, "name" | "emoji">>) => void;
  deleteWallet: (id: string) => boolean;
  getWalletById: (id: string) => Wallet | undefined;
  getWalletBalance: (id: string) => number;
  netWorth: number;

  // transactions
  transactions: Transaction[];
  addTransaction: (input: NewTransactionInput) => void;
  addTransactions: (items: NewTransactionInput[]) => void;
  updateTransaction: (id: string, patch: Partial<NewTransactionInput>) => void;
  deleteTransaction: (id: string) => void;
  adjustWalletBalance: (walletId: string, newBalance: number, note?: string) => boolean;
  setWallets: (wallets: Wallet[]) => void;
  setTransactions: (transactions: Transaction[]) => void;

  // preferences
  theme: string;
  setTheme: (id: string) => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (typeof translations)["en"] | (typeof translations)["th"];
  wallpaper: string | null;
  setWallpaper: (w: string | null) => void;
  wallpapers: string[];
  addWallpaper: (dataUrl: string) => void;
  removeWallpaper: (idx: number) => void;
  setActiveWallpaperIndex: (idx: number | null) => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;

  // categories
  customCategories: CustomCategories;
  addCustomCategory: (type: TxType, name: string, emoji: string) => boolean;
  editCustomCategory: (type: TxType, oldName: string, newName: string, newEmoji: string) => boolean;
  deleteCustomCategory: (type: TxType, name: string) => boolean;
  getCategoriesFor: (type: TxType) => string[];
  getCustomCategoryEmoji: (type: TxType, name: string) => string | undefined;

  // tutorial
  hasSeenTutorial: boolean;
  setHasSeenTutorial: (v: boolean) => void;
  showTutorial: boolean;
  openTutorial: () => void;
  closeTutorial: (markSeen?: boolean) => void;
}

const Ctx = createContext<StoreCtx | null>(null);

const LS = {
  wallets: "et.wallets",
  tx: "et.transactions.v2",
  txLegacy: "et.transactions",
  migrated: "et.migrated.v2",
  theme: "et.theme",
  darkMode: "et.darkMode",
  lang: "et.lang",
  wallpaper: "et.wallpaper",
  wallpapers: "et.wallpapers.v2",
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

function makeDefaultWallet(lang: Lang): Wallet {
  return {
    id: crypto.randomUUID(),
    name: lang === "th" ? "เงินสด" : "Cash",
    emoji: "💵",
    created_at: Date.now(),
  };
}

/* =======================================================================
 *  PROVIDER
 * ===================================================================== */

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [theme, setThemeState] = useState<string>("blue");
  const [darkMode, setDarkModeState] = useState<boolean>(false);
  const [lang, setLangState] = useState<Lang>("en");
  const [wallpaper, setWallpaperState] = useState<string | null>(null);
  const [wallpapers, setWallpapersState] = useState<string[]>([]);
  const [currency, setCurrencyState] = useState<CurrencyCode>("THB");
  const [customCategories, setCustomCategories] = useState<CustomCategories>({
    income: [],
    expense: [],
  });
  const [hasSeenTutorial, setHasSeenTutorialState] = useState<boolean>(true);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [hydrated, setHydrated] = useState(false);

  /* -------- HYDRATE -------- */
  useEffect(() => {
    try {
      // language first (used for default wallet name on migration)
      const lg = localStorage.getItem(LS.lang) as Lang | null;
      const effectiveLang: Lang = lg === "th" || lg === "en" ? lg : "en";
      if (lg === "th" || lg === "en") setLangState(lg);

      const th = localStorage.getItem(LS.theme);
      if (th && THEME_PRESETS.some((p) => p.id === th)) setThemeState(th);
      const dm = localStorage.getItem(LS.darkMode);
      const wp = localStorage.getItem(LS.wallpaper);
      if (wp) setWallpaperState(wp);
      const wps = localStorage.getItem(LS.wallpapers);
      if (wps) {
        try {
          const arr = JSON.parse(wps);
          if (Array.isArray(arr)) setWallpapersState(arr.filter((s) => typeof s === "string").slice(0, 5));
        } catch {}
      } else if (wp) {
        // seed gallery from previously single wallpaper
        setWallpapersState([wp]);
      }
      if (wp) setWallpaperState(wp);
      const cur = localStorage.getItem(LS.currency) as CurrencyCode | null;
      if (cur && CURRENCIES.some((c) => c.code === cur)) setCurrencyState(cur);
      const cc = localStorage.getItem(LS.customCats);
      if (cc) {
        try {
          const parsed = JSON.parse(cc);
          if (parsed && Array.isArray(parsed.income) && Array.isArray(parsed.expense)) {
            // Handle both old string[] format and new CustomCategory[] format
            const normalizeCats = (arr: unknown[]): CustomCategory[] => {
              return arr
                .map((item) => {
                  if (typeof item === "string") {
                    // Old format: just a string name
                    return { name: item, emoji: "" };
                  }
                  if (item && typeof item === "object" && "name" in item) {
                    return { name: String(item.name), emoji: String((item as { emoji?: string }).emoji || "") };
                  }
                  return null;
                })
                .filter((c): c is CustomCategory => c !== null);
            };
            setCustomCategories({
              income: normalizeCats(parsed.income),
              expense: normalizeCats(parsed.expense),
            });
          }
        } catch {}
      }
      const seen = localStorage.getItem(LS.tutorial);
      const seenBool = seen === "true";
      setHasSeenTutorialState(seenBool);
      if (!seenBool) setShowTutorial(true);

      // Wallets + Transactions with v1 migration
      const walletsRaw = localStorage.getItem(LS.wallets);
      let loadedWallets: Wallet[] = [];
      if (walletsRaw) {
        try {
          const parsed = JSON.parse(walletsRaw);
          if (Array.isArray(parsed)) loadedWallets = parsed;
        } catch {}
      }

      const txV2Raw = localStorage.getItem(LS.tx);
      let loadedTx: Transaction[] = [];
      if (txV2Raw) {
        try {
          const parsed = JSON.parse(txV2Raw);
          if (Array.isArray(parsed)) loadedTx = parsed;
        } catch {}
      }

      // Cold start / migration
      if (loadedWallets.length === 0) {
        const def = makeDefaultWallet(effectiveLang);
        loadedWallets = [def];

        // v1 migration
        const legacyRaw = localStorage.getItem(LS.txLegacy);
        const alreadyMigrated = localStorage.getItem(LS.migrated) === "true";
        if (legacyRaw && !alreadyMigrated) {
          try {
            const legacy = JSON.parse(legacyRaw);
            if (Array.isArray(legacy)) {
              loadedTx = legacy.map((old: {
                id?: string;
                type?: string;
                amount?: number;
                category?: string;
                note?: string;
                date?: string;
                createdAt?: number;
              }) => {
                const cat = String(old.category ?? "Other");
                return {
                  id: old.id ?? crypto.randomUUID(),
                  wallet_id: def.id,
                  to_wallet_id: null,
                  type:
                    old.type === "income" ? "income" : "expense",
                  amount: Number(old.amount ?? 0),
                  category_name: cat,
                  category_emoji: DEFAULT_CATEGORY_EMOJI[cat] ?? "",
                  note: String(old.note ?? ""),
                  date: String(old.date ?? new Date().toISOString().slice(0, 10)),
                  createdAt: Number(old.createdAt ?? Date.now()),
                };
              });
            }
            localStorage.setItem(LS.migrated, "true");
          } catch {}
        }
      }

      setWallets(loadedWallets);
      setTransactions(loadedTx);
    } catch {}
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------- PERSIST -------- */
  useEffect(() => {
    if (hydrated) applyTheme(theme, darkMode);
  }, [theme, darkMode, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(LS.wallets, JSON.stringify(wallets));
  }, [wallets, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(LS.tx, JSON.stringify(transactions));
  }, [transactions, hydrated]);

  useEffect(() => {
    if (hydrated)
      localStorage.setItem(LS.customCats, JSON.stringify(customCategories));
  }, [customCategories, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(LS.wallpapers, JSON.stringify(wallpapers));
  }, [wallpapers, hydrated]);

  /* -------- DERIVED -------- */
  const defaultWalletId = wallets[0]?.id ?? "";

  const walletBalances = useMemo(() => {
    const map = new Map<string, number>();
    wallets.forEach((w) => map.set(w.id, 0));
    transactions.forEach((tx) => {
      if (tx.type === "income") {
        map.set(tx.wallet_id, (map.get(tx.wallet_id) ?? 0) + tx.amount);
      } else if (tx.type === "expense") {
        map.set(tx.wallet_id, (map.get(tx.wallet_id) ?? 0) - tx.amount);
      } else if (tx.type === "transfer") {
        map.set(tx.wallet_id, (map.get(tx.wallet_id) ?? 0) - tx.amount);
        if (tx.to_wallet_id) {
          map.set(tx.to_wallet_id, (map.get(tx.to_wallet_id) ?? 0) + tx.amount);
        }
      }
    });
    return map;
  }, [wallets, transactions]);

  const walletsWithBalance: WalletWithBalance[] = useMemo(
    () => wallets.map((w) => ({ ...w, balance: walletBalances.get(w.id) ?? 0 })),
    [wallets, walletBalances]
  );

  const netWorth = useMemo(
    () =>
      walletsWithBalance.reduce((s, w) => s + w.balance, 0),
    [walletsWithBalance]
  );

  /* -------- WALLET OPS -------- */
  const addWallet: StoreCtx["addWallet"] = (rawName, rawEmoji) => {
    const name = rawName.trim();
    if (!name || name.length > 40) return null;
    const emoji = (rawEmoji || "👛").trim().slice(0, 8) || "👛";
    const w: Wallet = {
      id: crypto.randomUUID(),
      name,
      emoji,
      created_at: Date.now(),
    };
    setWallets((prev) => [...prev, w]);
    return w;
  };

  const updateWallet: StoreCtx["updateWallet"] = (id, patch) => {
    setWallets((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              ...(patch.name !== undefined
                ? { name: patch.name.trim().slice(0, 40) || w.name }
                : {}),
              ...(patch.emoji !== undefined
                ? { emoji: patch.emoji.trim().slice(0, 8) || w.emoji }
                : {}),
            }
          : w
      )
    );
  };

  const deleteWallet: StoreCtx["deleteWallet"] = (id) => {
    if (wallets.length <= 1) return false;
    const survivors = wallets.filter((w) => w.id !== id);
    const fallback = survivors[0].id;
    setTransactions((prev) =>
      prev
        .map((tx) => {
          // case 1: source wallet deleted
          if (tx.wallet_id === id) {
            if (tx.type === "transfer") {
              // collapse transfer into income on destination (or fallback)
              const dest =
                tx.to_wallet_id && tx.to_wallet_id !== id
                  ? tx.to_wallet_id
                  : fallback;
              return {
                ...tx,
                wallet_id: dest,
                to_wallet_id: null,
                type: "income" as TxType,
              };
            }
            return { ...tx, wallet_id: fallback };
          }
          // case 2: destination wallet deleted (transfer FROM survivor → deleted)
          if (tx.type === "transfer" && tx.to_wallet_id === id) {
            return {
              ...tx,
              to_wallet_id: null,
              type: "expense" as TxType,
            };
          }
          return tx;
        })
    );
    setWallets(survivors);
    return true;
  };

  const getWalletById: StoreCtx["getWalletById"] = (id) =>
    wallets.find((w) => w.id === id);

  const getWalletBalance: StoreCtx["getWalletBalance"] = (id) =>
    walletBalances.get(id) ?? 0;

  /* -------- TX OPS -------- */
  const normalizeInput = (input: NewTransactionInput): Transaction => ({
    id: crypto.randomUUID(),
    wallet_id: input.wallet_id,
    to_wallet_id: input.type === "transfer" ? input.to_wallet_id ?? null : null,
    type: input.type,
    amount: Math.max(0, Number(input.amount) || 0),
    category_name: input.category_name,
    category_emoji: input.category_emoji ?? "",
    note: input.note ?? "",
    date: input.date,
    createdAt: Date.now(),
  });

  const addTransaction: StoreCtx["addTransaction"] = (input) => {
    setTransactions((prev) => [normalizeInput(input), ...prev]);
  };

  const addTransactions: StoreCtx["addTransactions"] = (items) => {
    if (!items.length) return;
    const prepared = items.map(normalizeInput);
    setTransactions((prev) => [...prepared, ...prev]);
  };

  const updateTransaction: StoreCtx["updateTransaction"] = (id, patch) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id !== id) return tx;
        const merged: Transaction = {
          ...tx,
          ...patch,
          to_wallet_id:
            (patch.type ?? tx.type) === "transfer"
              ? patch.to_wallet_id ?? tx.to_wallet_id ?? null
              : null,
          amount:
            patch.amount !== undefined
              ? Math.max(0, Number(patch.amount) || 0)
              : tx.amount,
        };
        return merged;
      })
    );
  };

  const deleteTransaction = (id: string) =>
    setTransactions((prev) => prev.filter((t) => t.id !== id));

  const setWalletsImpl = (newWallets: Wallet[]) => {
    setWallets(newWallets);
  };

  const setTransactionsImpl = (newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
  };

  /* -------- PREFS -------- */
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
  const addWallpaper = (dataUrl: string) => {
    setWallpapersState((prev) => {
      if (prev.includes(dataUrl)) return prev;
      const next = [...prev, dataUrl].slice(-5);
      return next;
    });
    setWallpaper(dataUrl);
  };
  const removeWallpaper = (idx: number) => {
    setWallpapersState((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      // if active wallpaper was removed, clear it
      if (prev[idx] && prev[idx] === wallpaper) setWallpaper(null);
      return next;
    });
  };
  const setActiveWallpaperIndex = (idx: number | null) => {
    if (idx === null) {
      setWallpaper(null);
      return;
    }
    const target = wallpapers[idx];
    if (target) setWallpaper(target);
  };
  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    localStorage.setItem(LS.currency, c);
  };

  const getCategoriesFor = useCallback(
    (type: TxType): string[] => {
      if (type === "transfer") return [];
      const defaults =
        type === "expense"
          ? [...EXPENSE_CATEGORY_KEYS]
          : [...INCOME_CATEGORY_KEYS];
      const customs =
        type === "expense" ? customCategories.expense : customCategories.income;
      const customNames = customs.map((c) => c.name);
      const seen = new Set<string>();
      return [...defaults, ...customNames].filter((c) => {
        if (seen.has(c)) return false;
        seen.add(c);
        return true;
      });
    },
    [customCategories]
  );

  const getCustomCategoryEmoji = useCallback(
    (type: TxType, name: string): string | undefined => {
      if (type === "transfer") return undefined;
      const list = type === "expense" ? customCategories.expense : customCategories.income;
      const found = list.find((c) => c.name === name);
      return found?.emoji;
    },
    [customCategories]
  );

  const addCustomCategory: StoreCtx["addCustomCategory"] = (type, rawName, rawEmoji) => {
    if (type === "transfer") return false;
    const name = rawName.trim();
    if (!name || name.length > 40) return false;
    const list = getCategoriesFor(type);
    if (list.includes(name)) return false;
    const emoji = (rawEmoji || "").slice(0, 8);
    setCustomCategories((prev) => ({
      ...prev,
      [type]: [...prev[type], { name, emoji }],
    }));
    return true;
  };

  const editCustomCategory: StoreCtx["editCustomCategory"] = (type, oldName, newName, newEmoji) => {
    if (type === "transfer") return false;
    const trimmedName = newName.trim();
    if (!trimmedName || trimmedName.length > 40) return false;
    
    const list = type === "expense" ? customCategories.expense : customCategories.income;
    const exists = list.find((c) => c.name === trimmedName);
    if (exists && exists.name !== oldName) return false;
    
    setCustomCategories((prev) => ({
      ...prev,
      [type]: prev[type].map((c) =>
        c.name === oldName ? { name: trimmedName, emoji: (newEmoji || "").slice(0, 8) } : c
      ),
    }));
    return true;
  };

  const deleteCustomCategory: StoreCtx["deleteCustomCategory"] = (type, name) => {
    if (type === "transfer") return false;
    const list = type === "expense" ? customCategories.expense : customCategories.income;
    if (list.length === 0) return false;
    
    setCustomCategories((prev) => ({
      ...prev,
      [type]: prev[type].filter((c) => c.name !== name),
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
        wallets,
        walletsWithBalance,
        defaultWalletId,
        addWallet,
        updateWallet,
        deleteWallet,
        getWalletById,
        getWalletBalance,
        netWorth,

        transactions,
        addTransaction,
        addTransactions,
        updateTransaction,
        deleteTransaction,
        setWallets: setWalletsImpl,
        setTransactions: setTransactionsImpl,

        theme,
        setTheme,
        darkMode,
        setDarkMode,
        lang,
        setLang,
        t: translations[lang],
        wallpaper,
        setWallpaper,
        wallpapers,
        addWallpaper,
        removeWallpaper,
        setActiveWallpaperIndex,
        currency,
        setCurrency,

        customCategories,
        addCustomCategory,
        editCustomCategory,
        deleteCustomCategory,
        getCategoriesFor,
        getCustomCategoryEmoji,

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

/* =======================================================================
 *  FORMATTING HELPERS
 * ===================================================================== */

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

/** Split currency into { sign, symbol, integer, fraction } for smart typography. */
export function splitCurrency(
  n: number,
  lang: Lang,
  currency: CurrencyCode = "THB"
): { sign: string; symbol: string; integer: string; fraction: string } {
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);
  const symbol = CURRENCIES.find((c) => c.code === currency)?.symbol ?? "฿";
  const locale = lang === "th" ? "th-TH" : "en-US";
  const decimals = currency === "JPY" || currency === "KRW" ? 0 : 2;
  const formatted = abs.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const dotIdx = formatted.indexOf(".");
  if (dotIdx === -1) return { sign, symbol, integer: formatted, fraction: "" };
  return {
    sign,
    symbol,
    integer: formatted.slice(0, dotIdx),
    fraction: formatted.slice(dotIdx),
  };
}

/** Resolve a display label for a category (default key → translated, custom → as-is). */
export function getCategoryLabel(
  category: string,
  tCategories: Readonly<Record<string, string>>
): string {
  return tCategories[category] ?? category;
}
