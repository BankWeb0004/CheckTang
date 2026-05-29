import React, { useState } from 'react';
import { useStore } from '../../lib/expense-store';
import { Wallet as WalletIcon, Plus, Trash2, Layers } from 'lucide-react';

export function Wallets() {
  const { wallets, transactions, addWallet, deleteWallet, t } = useStore();
  const [newWalletName, setNewWalletName] = useState('');

  // คำนวณยอดเงินของแต่ละกระเป๋าแบบ Real-time
  const getWalletBalance = (walletId: string) => {
    let balance = 0;
    transactions.forEach((tx) => {
      if (tx.wallet_id === walletId) {
        if (tx.type === 'expense' || tx.type === 'transfer') balance -= tx.amount;
        if (tx.type === 'income') balance += tx.amount;
      }
      if (tx.type === 'transfer' && tx.to_wallet_id === walletId) {
        balance += tx.amount;
      }
    });
    return balance;
  };

  const handleAddWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWalletName.trim()) return;
    
    // ส่งอาร์กิวเมนต์แบบรองรับโครงสร้างดั้งเดิม (2 arguments ตามสโตร์เดิมของคุณแบงค์)
    addWallet(newWalletName.trim(), '💳');
    setNewWalletName('');
  };

  const totalBalance = wallets.reduce((acc, w) => acc + getWalletBalance(w.id), 0);

  return (
    <div className="space-y-6">
      {/* Overview Balance Card */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-950 dark:from-zinc-950 dark:via-zinc-900 dark:to-black p-6 rounded-2xl shadow-lg border border-zinc-800 relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <Layers className="w-32 h-32" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">สินทรัพย์รวมทั้งหมด</p>
        <h2 className="text-3xl font-black mt-1.5 tracking-tight">
          ฿{totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </h2>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          กระเป๋าเงินของคุณ
        </h1>
      </div>

      {/* Add Wallet Form */}
      <form onSubmit={handleAddWallet} className="flex gap-2 max-w-md">
        <input
          type="text"
          placeholder="ชื่อกระเป๋าเงินใหม่..."
          value={newWalletName}
          onChange={(e) => setNewWalletName(e.target.value)}
          className="flex-1 px-4 py-2.5 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-zinc-900 dark:text-zinc-50"
          required
        />
        <button
          type="submit"
          className="px-4 py-2.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-semibold rounded-xl text-sm shadow-sm transition-colors flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> เพิ่ม
        </button>
      </form>

      {/* Wallets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {wallets.map((wallet) => {
          const currentBalance = getWalletBalance(wallet.id);
          return (
            <div
              key={wallet.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group relative"
            >
              <div className="flex items-start justify-between">
                <div className="p-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-zinc-600 dark:text-zinc-300">
                  <WalletIcon className="w-5 h-5" />
                </div>
                
                {wallets.length > 1 && (
                  <button
                    onClick={() => {
                      if (confirm('คุณแน่ใจว่าต้องการลบกระเป๋าเงินนี้? (ธุรกรรมภายในกระเป๋าจะยังคงอยู่ แต่ชื่อกระเป๋าจะหายไป)')) {
                        deleteWallet(wallet.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-zinc-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 truncate">
                  {wallet.name}
                </h3>
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">
                  ฿{currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}