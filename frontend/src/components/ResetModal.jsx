import { useState } from 'react';
import { X, TriangleAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n/index.jsx';

export default function ResetModal({ onClose }) {
  const { resetPlan } = useApp();
  const { t } = useT();
  const [resetting, setResetting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleReset = async () => {
    setResetting(true);
    try {
      await resetPlan();
      onClose();
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
              <TriangleAlert size={20} className="text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{t('reset_title')}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <X size={20} />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          {t('reset_description_part1')} <strong>{t('reset_description_transactions')}</strong> {t('reset_description_part2')}{' '}
          <strong>{t('reset_description_budgets')}</strong>. {t('reset_description_part3')}
        </p>

        <label className="flex items-start gap-2 mb-5 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="mt-0.5 accent-red-600"
          />
          <span className="text-sm text-gray-700">
            {t('reset_checkbox')}
          </span>
        </label>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleReset}
            disabled={!confirmed || resetting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-40"
          >
            {resetting ? t('reset_btn_loading') : t('reset_btn')}
          </button>
        </div>
      </div>
    </div>
  );
}
