import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function BudgetModal({ budget, onClose }) {
  const { categories, budgets, saveBudget } = useApp();
  const [form, setForm] = useState({ category_id: '', monthly_limit: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (budget) {
      setForm({
        category_id: budget.category_id || '',
        monthly_limit: budget.monthly_limit || '',
      });
    } else {
      setForm({ category_id: '', monthly_limit: '' });
    }
  }, [budget]);

  // Only show categories not already budgeted (unless editing that category)
  const budgetedCategoryIds = new Set(
    budgets
      .filter((b) => !budget || b.category_id !== budget.category_id)
      .map((b) => b.category_id)
  );
  const availableCategories = categories.filter(
    (c) => c.type !== 'income' && !budgetedCategoryIds.has(c.id)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category_id || !form.monthly_limit) {
      setError('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await saveBudget({
        ...(budget ? { id: budget.id } : {}),
        category_id: parseInt(form.category_id, 10),
        monthly_limit: parseFloat(form.monthly_limit),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save budget.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {budget ? 'Edit Budget' : 'Add Budget'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={form.category_id}
              onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
              disabled={!!budget}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50"
            >
              <option value="">Select category</option>
              {(budget
                ? categories.filter((c) => c.id === budget.category_id)
                : availableCategories
              ).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Limit <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.monthly_limit}
                onChange={(e) =>
                  setForm((f) => ({ ...f, monthly_limit: e.target.value }))
                }
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="0.00"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
