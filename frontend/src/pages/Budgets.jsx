import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import BudgetModal from '../components/BudgetModal';
import ProgressBar from '../components/ProgressBar';

const fmt = (v) =>
  `€${Number(v || 0).toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function Budgets() {
  const { budgets, loadingBudgets, removeBudget, selectedMonth } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const displayMonth = selectedMonth
    ? format(parseISO(`${selectedMonth}-01`), 'MMMM yyyy')
    : '';

  const openAdd = () => {
    setEditingBudget(null);
    setModalOpen(true);
  };
  const openEdit = (b) => {
    setEditingBudget(b);
    setModalOpen(true);
  };
  const handleDelete = async (id) => {
    if (!confirm('Delete this budget?')) return;
    setDeletingId(id);
    try {
      await removeBudget(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget Manager</h1>
          {displayMonth && (
            <p className="text-sm text-gray-500 mt-1">{displayMonth}</p>
          )}
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus size={16} />
          Add Budget
        </button>
      </div>

      {loadingBudgets ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : budgets.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm text-center py-16">
          <p className="text-gray-400 text-sm">No budgets set yet.</p>
          <button
            onClick={openAdd}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
          >
            Add your first budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {budgets.map((b) => {
            const spent = b.spent || 0;
            const limit = b.monthly_limit || 0;
            const pct = limit > 0 ? (spent / limit) * 100 : 0;
            const remaining = limit - spent;
            const statusColor =
              pct >= 100
                ? 'text-red-600 bg-red-50'
                : pct >= 80
                ? 'text-yellow-600 bg-yellow-50'
                : 'text-green-600 bg-green-50';

            return (
              <div key={b.id} className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {b.category_name || b.category}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Monthly limit: {fmt(limit)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(b)}
                      className="p-1.5 text-gray-400 hover:text-primary-600 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      disabled={deletingId === b.id}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors disabled:opacity-40"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <ProgressBar percent={pct} />

                <div className="flex items-center justify-between mt-3">
                  <div className="text-xs text-gray-500">
                    <span className="font-medium text-gray-700">{fmt(spent)}</span> spent
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor}`}
                  >
                    {pct >= 100
                      ? `${fmt(Math.abs(remaining))} over`
                      : `${fmt(remaining)} left`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <BudgetModal
          budget={editingBudget}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
