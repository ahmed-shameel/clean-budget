import { useMemo, useState } from 'react';
import { format, addMonths, subMonths, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n/index.jsx';
import TransactionModal from '../components/TransactionModal';
import PageHeader from '../components/PageHeader';
import SurfaceCard from '../components/SurfaceCard';

export default function Transactions() {
  const {
    transactions,
    loadingTransactions,
    selectedMonth,
    setSelectedMonth,
    removeTransaction,
    categories,
  } = useApp();
  const { t, formatMoney, translateCategory } = useT();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const currentDate = parseISO(`${selectedMonth}-01`);

  const prevMonth = () => {
    setSelectedMonth(format(subMonths(currentDate, 1), 'yyyy-MM'));
  };
  const nextMonth = () => {
    setSelectedMonth(format(addMonths(currentDate, 1), 'yyyy-MM'));
  };

  const sortedForRemaining = useMemo(() => {
    return [...transactions].sort((a, b) => {
      const dateCmp = String(a.date || '').localeCompare(String(b.date || ''));
      if (dateCmp !== 0) return dateCmp;
      return String(a.created_at || '').localeCompare(String(b.created_at || ''));
    });
  }, [transactions]);

  const runningRemainingById = useMemo(() => {
    let runningBalance = 0;
    const map = new Map();

    for (const tx of sortedForRemaining) {
      if (tx.type === 'expense') {
        runningBalance -= Number(tx.amount || 0);
        map.set(tx.id, runningBalance);
      }
    }

    return map;
  }, [sortedForRemaining]);

  const openAddExpense = () => {
    setEditingTx(null);
    setModalOpen(true);
  };

  const openEdit = (tx) => {
    setEditingTx(tx);
    setModalOpen(true);
  };
  const handleDelete = async (id) => {
    if (!confirm(t('transactions_delete_confirm'))) return;
    setDeletingId(id);
    try {
      await removeTransaction(id);
    } finally {
      setDeletingId(null);
    }
  };

  const getCategoryColor = (tx) => {
    const cat = categories.find((c) => c.id === (tx.category_id || tx.categoryId));
    return cat?.color || '#6b7280';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('transactions_title')}
        actions={(
          <button
            onClick={openAddExpense}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            <Plus size={16} />
            {t('transactions_add_expense')}
          </button>
        )}
      />

      {/* Month selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-medium text-gray-700 w-32 text-center">
          {format(currentDate, 'MMMM yyyy')}
        </span>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* List */}
      <SurfaceCard className="overflow-hidden" padding="">
        {loadingTransactions ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">{t('transactions_empty')}</p>
            <button
              onClick={openAddExpense}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
            >
              {t('transactions_add_first')}
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {transactions.map((tx) => (
              <li
                key={tx.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                {/* Color dot */}
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getCategoryColor(tx) }}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {tx.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {translateCategory(tx.category_name || tx.category)} ·{' '}
                    {tx.date
                      ? format(parseISO(tx.date.slice(0, 10)), 'MMM d, yyyy')
                      : ''}
                  </p>
                  {tx.type === 'expense' && tx.expense_kind && (
                    <span className="inline-flex mt-1 text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                      {tx.expense_kind === 'fixed'
                        ? t('transaction_expense_fixed')
                        : t('transaction_expense_variable')}
                    </span>
                  )}
                </div>

                {/* Amount */}
                <div className="text-right flex-shrink-0">
                  <span
                    className="text-sm font-semibold block text-red-600"
                  >
                    -
                    {formatMoney(tx.amount)}
                  </span>
                  {runningRemainingById.has(tx.id) && (
                    <span className="text-[11px] text-gray-500 block mt-0.5">
                      {t('transactions_remaining_after')}: {formatMoney(runningRemainingById.get(tx.id))}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => openEdit(tx)}
                    className="p-1.5 text-gray-400 hover:text-primary-600 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(tx.id)}
                    disabled={deletingId === tx.id}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors disabled:opacity-40"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </SurfaceCard>

      {modalOpen && (
        <TransactionModal
          transaction={editingTx}
          initialType="expense"
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
