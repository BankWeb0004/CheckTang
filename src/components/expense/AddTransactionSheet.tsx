import React, { useState } from 'react';
import { useStore } from '../../lib/expense-store';
import { X, Plus, Check } from 'lucide-react';

interface AddTransactionSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddTransactionSheet({ isOpen, onClose }: AddTransactionSheetProps) {
  const { wallets = [], addTransaction, t } = useStore();

  const [type, setType] = useState<'income' | 'expense' | 'transfer'>('expense');
  const [amount, setAmount] = useState('');
  const [walletId, setWalletId] = useState(wallets[0]?.id || '');
  const [toWalletId, setToWalletId] = useState(wallets[1]?.id || wallets[0]?.id || '');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [addAnother, setAddAnother] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;

    // สร้างข้อมูลส่งแบบผ่อนปรนที่สุด รองรับทั้งระบบที่ต้องการ category_name และไม่ต้องการ
    const transactionData: any = {
      type,
      amount: Number(amount),
      wallet_id: walletId,
      to_wallet_id: type === 'transfer' ? toWalletId : undefined,
      note,
      date,
      category_name: '',
    };

    addTransaction(transactionData);

    setAmount('');
    setNote('');

    if (!addAnother) {
      onClose();
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^\d*\.?\d{0,2}$/.test(val)) {
      setAmount(val);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center p-0 sm:p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 flex flex-col max-h-[90vh] sm:max-h-[85vh] animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-500" />
            {type === 'income' ? t?.income || 'รายรับ' : type === 'expense' ? t?.expense || 'รายจ่าย' : 'โอนเงิน'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Segmented Control */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
            {(['expense', 'income', 'transfer'] as const).map((tType) => (
              <button
                key={tType}
                type="button"
                onClick={() => setType(tType)}
                className={`py-2 text-sm font-medium rounded-lg transition-all ${
                  type === tType
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-50 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
                }`}
              >
                {tType === 'expense' ? t?.expense || 'รายจ่าย' : tType === 'income' ? t?.income || 'รายรับ' : 'โอนเงิน'}
              </button>
            ))}
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">จำนวนเงิน</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-2xl font-bold text-zinc-400">฿</span>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3.5 text-3xl font-bold rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-zinc-900 dark:text-zinc-50 transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Wallet Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {type === 'transfer' ? 'จากกระเป๋า' : 'กระเป๋าเงิน'}
              </label>
              <select
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 text-sm focus:outline-none text-zinc-800 dark:text-zinc-200"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            {type === 'transfer' && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">ไปยังกระเป๋า</label>
                <select
                  value={toWalletId}
                  onChange={(e) => setToWalletId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 text-sm focus:outline-none text-zinc-800 dark:text-zinc-200"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Date Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">วันที่</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 text-sm focus:outline-none text-zinc-800 dark:text-zinc-200"
            />
          </div>

          {/* Note Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">บันทึกเพิ่มเติม</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="บันทึกช่วยจำ..."
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 text-sm focus:outline-none focus:border-emerald-500 text-zinc-900 dark:text-zinc-50 transition-all"
            />
          </div>

          {/* Keep Window Open Switch */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-sm text-zinc-500 dark:text-zinc-400">เปิดหน้าต่างนี้ค้างไว้เพื่อกรอกรายการอื่นต่อ</span>
            <button
              type="button"
              onClick={() => setAddAnother(!addAnother)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                addAnother ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-700'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                addAnother ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-sm"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={!amount || Number(amount) <= 0}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-md hover:from-emerald-600 hover:to-teal-700 transition-all text-sm disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" /> บันทึกรายการ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// แอบใส่ Default Export เผื่อไว้ป้องกันตัวแอปเวอร์ชันเก่าเรียกหาด้วยครับ
export default AddTransactionSheet;