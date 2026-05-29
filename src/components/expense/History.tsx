import React, { useState } from 'react';
import { useStore } from '../../lib/expense-store';
import { Search, Filter, Trash2, ArrowUpRight, ArrowDownLeft, RefreshCw, Calendar } from 'lucide-react';

export function History() {
  const { transactions = [], wallets = [], deleteTransaction, t } = useStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [walletFilter, setWalletFilter] = useState<string>('all');

  const labels = {
    expense: t?.expense || 'รายจ่าย',
    income: t?.income || 'รายรับ',
    transfer: 'โอนเงิน'
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (!tx) return false;
    const wallet = wallets.find((w) => w.id === tx.wallet_id);

    const matchesSearch =
      (tx.note && tx.note.toLowerCase().includes(search.toLowerCase())) ||
      (wallet && wallet.name.toLowerCase().includes(search.toLowerCase()));

    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    
    const matchesWallet =
      walletFilter === 'all' ||
      tx.wallet_id === walletFilter ||
      (tx.type === 'transfer' && (tx as any).to_wallet_id === walletFilter);

    return matchesSearch && matchesType && matchesWallet;
  });

  const getWalletName = (id: string) => wallets.find((w) => w.id === id)?.name || 'ไม่ระบุ';

  const displayDate = (tx: any) => {
    const rawDate = tx.date || tx.createdAt || tx.created_at;
    if (!rawDate) return new Date().toISOString().split('T')[0];
    if (typeof rawDate === 'string') return rawDate.split('T')[0];
    return new Date(rawDate).toISOString().split('T')[0];
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          ประวัติธุรกรรม
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="ค้นหาบันทึก หรือ กระเป๋าเงิน..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none text-zinc-900 dark:text-zinc-50"
          />
        </div>

        <div className="flex gap-2">
          <div className="w-1/2 relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full pl-3 pr-8 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none text-zinc-800 dark:text-zinc-200 appearance-none cursor-pointer"
            >
              <option value="all">ทุกประเภท</option>
              <option value="expense">{labels.expense}</option>
              <option value="income">{labels.income}</option>
              <option value="transfer">{labels.transfer}</option>
            </select>
            <Filter className="absolute right-3 top-3 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
          </div>

          <div className="w-1/2 relative">
            <select
              value={walletFilter}
              onChange={(e) => setWalletFilter(e.target.value)}
              className="w-full pl-3 pr-8 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none text-zinc-800 dark:text-zinc-200 appearance-none cursor-pointer"
            >
              <option value="all">ทุกกระเป๋า</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            <Filter className="absolute right-3 top-3 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 dark:text-zinc-600">ไม่มีประวัติรายการข้อมูล</div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors group">
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-xl ${
                    tx.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' :
                    tx.type === 'expense' ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600' :
                    'bg-amber-50 dark:bg-amber-950/30 text-amber-600'
                  }`}>
                    {tx.type === 'income' && <ArrowDownLeft className="w-4 h-4" />}
                    {tx.type === 'expense' && <ArrowUpRight className="w-4 h-4" />}
                    {tx.type === 'transfer' && <RefreshCw className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      {tx.type === 'transfer' 
                        ? `${getWalletName(tx.wallet_id)} ➔ ${getWalletName((tx as any).to_wallet_id)}`
                        : tx.type === 'income' ? 'รายรับ' : 'รายจ่าย'}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                      <span className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[10px] font-medium text-zinc-500">
                        {getWalletName(tx.wallet_id)}
                      </span>
                      {tx.note && <span className="truncate max-w-[150px] sm:max-w-[300px]">| {tx.note}</span>}
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {displayDate(tx)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${
                    tx.type === 'income' ? 'text-emerald-600' :
                    tx.type === 'expense' ? 'text-rose-600' :
                    'text-amber-600'
                  }`}>
                    {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                    ฿{tx.amount ? tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                  </span>

                  <button
                    onClick={() => {
                      if (confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
                        deleteTransaction(tx.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-zinc-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}