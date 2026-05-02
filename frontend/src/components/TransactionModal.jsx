/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n/index.jsx';

const defaultForm = {
  type: 'expense',
  amount: '',
  category_id: '',
  description: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  notes: '',
};

const makeDefaultForm = () => ({
  ...defaultForm,
  type: 'expense',
});

export default function TransactionModal({ transaction, onClose }) {
  const { categories, addTransaction, editTransaction } = useApp();
  const { t, currencySymbol, translateCategory } = useT();
  const [form, setForm] = useState(makeDefaultForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (transaction) {
      setForm({
        type: 'expense',
        amount: transaction.amount || '',
        category_id: transaction.category_id || '',
        description: transaction.description || '',
        date: transaction.date
          ? transaction.date.slice(0, 10)
          : format(new Date(), 'yyyy-MM-dd'),
        notes: transaction.notes || '',
      });
    } else {
      setForm(makeDefaultForm());
    }
  }, [transaction]);

  const filteredCategories = categories.filter(
    (c) => !c.type || c.type === form.type
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.description || !form.date) {
      setError(t('required_fields_error'));
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        type: 'expense',
        expense_kind: null,
        amount: parseFloat(form.amount),
        category_id: form.category_id ? parseInt(form.category_id, 10) : null,
      };
      if (transaction) {
        await editTransaction(transaction.id, payload);
      } else {
        await addTransaction(payload);
      }
      onClose();
    } catch (err) {
      setError(err.message || t('transactions_failed_save'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            {transaction ? t('transaction_edit_title') : t('transaction_add_title')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('transaction_amount')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{currencySymbol}</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                className="form-control-with-prefix"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('transaction_category_optional')}
            </label>
            <div className="relative">
              <select
                value={form.category_id}
                onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                className="form-select"
              >
                <option value="">{t('transaction_select_category')}</option>
                {filteredCategories.map((c) => (
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
              {t('transaction_description')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="form-control px-3 py-2"
              placeholder={t('transaction_description_placeholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('transaction_date')} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="form-control px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('transaction_notes')}
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="form-textarea"
              placeholder={t('transaction_notes_placeholder')}
            />
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
