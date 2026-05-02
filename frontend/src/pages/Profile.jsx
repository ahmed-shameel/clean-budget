import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n/index.jsx';

export default function Profile() {
  const {
    profileBaseline,
    fixedCosts,
    loadingProfileBaseline,
    saveBaselineProfile,
    addFixedCost,
    removeFixedCost,
  } = useApp();
  const { t, formatMoney, lang, setLang, currency, setCurrency } = useT();

  const [salary, setSalary] = useState(profileBaseline?.monthly_salary ?? 0);
  const [fixedName, setFixedName] = useState('');
  const [fixedAmount, setFixedAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSaveSalary = async () => {
    setSaving(true);
    try {
      await saveBaselineProfile(Number(salary || 0));
    } finally {
      setSaving(false);
    }
  };

  const handleAddFixed = async () => {
    if (!fixedName.trim() || Number(fixedAmount) < 0) return;
    setSaving(true);
    try {
      await addFixedCost({ name: fixedName.trim(), amount: Number(fixedAmount) });
      setFixedName('');
      setFixedAmount('');
    } finally {
      setSaving(false);
    }
  };

  if (loadingProfileBaseline) {
    return <div className="bg-white rounded-xl shadow-sm p-6 text-sm text-gray-500">Loading profile…</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('profile_section_title')}</h1>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">{t('profile_preferences_title')}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile_language')}</label>
            <div className="flex items-center gap-2">
              {['en', 'sv'].map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors uppercase ${
                    lang === l
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('profile_currency')}</label>
            <div className="flex items-center gap-2">
              {['EUR', 'SEK'].map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors uppercase ${
                    currency === c
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">{t('profile_baseline_title')}</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile_monthly_salary')}</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className="form-control px-3 py-2"
          />
          <p className="text-xs text-gray-500 mt-1">{t('profile_salary_day_note')}</p>
        </div>

        <button
          onClick={handleSaveSalary}
          disabled={saving}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-60"
        >
          {saving ? t('saving') : t('save')}
        </button>

        <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
          <p>{t('profile_fixed_total')}: <span className="font-semibold">{formatMoney(profileBaseline?.fixed_costs_total || 0)}</span></p>
          <p>{t('profile_baseline_balance')}: <span className="font-semibold">{formatMoney(profileBaseline?.baseline_balance || 0)}</span></p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">{t('profile_fixed_costs_title')}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            value={fixedName}
            onChange={(e) => setFixedName(e.target.value)}
            placeholder={t('profile_fixed_name_placeholder')}
            className="form-control px-3 py-2"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={fixedAmount}
            onChange={(e) => setFixedAmount(e.target.value)}
            placeholder={t('profile_fixed_amount_placeholder')}
            className="form-control px-3 py-2"
          />
          <button
            onClick={handleAddFixed}
            disabled={saving}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-60"
          >
            {t('add')}
          </button>
        </div>

        <ul className="divide-y divide-gray-100">
          {fixedCosts.map((item) => (
            <li key={item.id} className="py-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">{formatMoney(item.amount)}</p>
              </div>
              <button
                onClick={() => removeFixedCost(item.id)}
                className="p-2 rounded-md text-red-500 hover:bg-red-50"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
          {fixedCosts.length === 0 && (
            <li className="py-6 text-sm text-gray-400 text-center">{t('profile_fixed_empty')}</li>
          )}
        </ul>
      </div>
    </div>
  );
}
