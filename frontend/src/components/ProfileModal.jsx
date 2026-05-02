/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n/index.jsx';
import * as api from '../api/client';

export default function ProfileModal({ profile, onClose }) {
  const { categories, saveProfile } = useApp();
  const { t, currencySymbol, translateCategory } = useT();
  const [name, setName] = useState('');
  const [limits, setLimits] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const expenseCategories = categories.filter((c) => c.name !== 'Income');

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      // Load existing profile budgets
      api.getProfileBudgets(profile.id).then((data) => {
        const map = {};
        for (const b of data) map[b.category_id] = String(b.monthly_limit);
        setLimits(map);
      });
    } else {
      setName('');
      setLimits({});
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t('profile_name_required'));
      return;
    }
    const budgets = Object.entries(limits)
      .filter(([, v]) => v && parseFloat(v) > 0)
      .map(([category_id, monthly_limit]) => ({
        category_id: parseInt(category_id, 10),
        monthly_limit: parseFloat(monthly_limit),
      }));

    setSaving(true);
    setError('');
    try {
      await saveProfile({ name: name.trim(), budgets }, profile?.id ?? null);
      onClose();
    } catch (err) {
      setError(err.message || t('profile_failed_save'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">
            {profile ? t('profile_edit_title') : t('profile_new_title')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Profile name */}
          <div className="px-6 pt-5 flex-shrink-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('profile_name_label')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('profile_name_placeholder')}
              className="form-control px-3 py-2"
            />
          </div>

          {/* Category limits */}
          <div className="px-6 pt-4 pb-2 flex-shrink-0">
            <p className="text-sm font-medium text-gray-700">
              {t('profile_monthly_limits')}{' '}
              <span className="text-gray-400 font-normal">{t('profile_limits_hint')}</span>
            </p>
          </div>
          <div className="overflow-y-auto flex-1 px-6 pb-4 space-y-2">
            {expenseCategories.map((c) => (
              <div key={c.id} className="flex items-center gap-3">
                <span className="text-base w-6 text-center flex-shrink-0">{c.icon}</span>
                <span className="text-sm text-gray-700 w-36 flex-shrink-0">{translateCategory(c.name)}</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{currencySymbol}</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={limits[c.id] ?? ''}
                    onChange={(e) =>
                      setLimits((prev) => ({ ...prev, [c.id]: e.target.value }))
                    }
                    placeholder="0.00"
                    className="form-control-with-prefix py-1.5"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0 space-y-3">
            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}
            <div className="flex gap-3">
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
                {saving ? t('saving') : profile ? t('profile_update_btn') : t('profile_create_btn')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
