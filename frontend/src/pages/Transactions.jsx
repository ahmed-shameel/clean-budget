import { useState } from 'react';
import { format, addMonths, subMonths, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import TransactionModal from '../components/TransactionModal';

const fmt = (v) =>
  `€${Number(v || 0).toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Transactions() {
  const {
    transactions,
    loadingTransactions,
    selectedMonth,
    setSelectedMonth,
    removeTransaction,
    categories,
  } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const currentDate = parseISO(`${selectedMonth}-01`);

  const prevMonth = () =>
    setSelectedMonth(format(subMonths(currentDate, 1), 'yyyy-MM'));
  const nextMonth = () =>
    setSelectedMonth(format(addMonths(currentDate, 1), 'yyyy-MM'));

  const openAdd = () => {
    setEditingTx(null);
    setModalOpen(true);
  };
  const openEdit = (tx) => {
    setEditingTx(tx);
    setModalOpen(true);
  };
  const handleDelete = async (id) => {
    if (!confirm('Delete this transaction?')) return;
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus size={16} />
          Add Transaction
        </button>
      </div>

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
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loadingTransactions ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">No transactions for this month.</p>
            <button
              onClick={openAdd}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
            >
              Add your first transaction
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
                    {tx.category_name || tx.category} ·{' '}
                    {tx.date
                      ? format(parseISO(tx.date.slice(0, 10)), 'MMM d, yyyy')
                      : ''}
                  </p>
                </div>

                {/* Amount */}
                <span
                  className={`text-sm font-semibold flex-shrink-0 ${
                    tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'}
                  {fmt(tx.amount)}
                </span>

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
      </div>

      {modalOpen && (
        <TransactionModal
          transaction={editingTx}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
