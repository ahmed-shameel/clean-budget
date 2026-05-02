/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n/index.jsx';

export default function BudgetModal({ budget, onClose }) {
  const { categories, budgets, saveBudget } = useApp();
  const { t, currencySymbol, translateCategory } = useT();
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
      setError(t('required_fields_error'));
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
      setError(err.message || t('budgets_failed_save'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {budget ? t('budget_edit_title') : t('budget_add_title')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('budget_category')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={form.category_id}
                onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                disabled={!!budget}
                className="form-select disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <option value="">{t('budget_select_category')}</option>
                {(budget
                  ? categories.filter((c) => c.id === budget.category_id)
                  : availableCategories
                ).map((c) => (
                  <option key={c.id} value={c.id}>
                    {translateCategory(c.name)}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('budget_monthly_limit')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{currencySymbol}</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.monthly_limit}
                onChange={(e) =>
                  setForm((f) => ({ ...f, monthly_limit: e.target.value }))
                }
                className="form-control-with-prefix"
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
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-60"
            >
              {saving ? t('saving') : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
