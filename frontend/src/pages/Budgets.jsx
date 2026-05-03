import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Plus, Pencil, Trash2, BookMarked, CheckCheck, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n/index.jsx';
import BudgetModal from '../components/BudgetModal';
import ProfileModal from '../components/ProfileModal';
import ProgressBar from '../components/ProgressBar';
import PageHeader from '../components/PageHeader';
import SurfaceCard from '../components/SurfaceCard';

// ── Save-as-profile inline prompt ─────────────────────────────────────────
function SaveAsProfileBar({ onSave, onCancel }) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const { t } = useT();

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try { await onSave(name.trim()); } finally { setSaving(false); }
  };

  return (
    <div className="flex items-center gap-2 mt-3">
      <input
        autoFocus
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onCancel(); }}
        placeholder={t('profiles_name_placeholder')}
        className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <button
        onClick={handleSave}
        disabled={saving || !name.trim()}
        className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
      >
        {saving ? t('saving') : t('save')}
      </button>
      <button
        onClick={onCancel}
        className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors"
      >
        {t('cancel')}
      </button>
    </div>
  );
}

// ── Profile card ───────────────────────────────────────────────────────────
function ProfileCard({ profile, onEdit, onDelete, onApply, applying }) {
  const [deleting, setDeleting] = useState(false);
  const { t } = useT();

  const handleDelete = async () => {
    if (!confirm(t('profiles_delete_confirm', { name: profile.name }))) return;
    setDeleting(true);
    try { await onDelete(profile.id); } finally { setDeleting(false); }
  };

  const count = profile.budget_count;

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm flex items-center gap-4">
      <div className="p-2 bg-primary-50 rounded-lg flex-shrink-0">
        <BookMarked size={18} className="text-primary-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{profile.name}</p>
        <p className="text-xs text-gray-400">
          {count} {count === 1 ? t('profiles_budget_count_one') : t('profiles_budget_count_many')}
        </p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={() => onApply(profile.id)}
          disabled={applying === profile.id}
          title={t('apply')}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <CheckCheck size={13} />
          {applying === profile.id ? t('applying') : t('apply')}
        </button>
        <button
          onClick={() => onEdit(profile)}
          className="p-1.5 text-gray-400 hover:text-primary-600 rounded-md hover:bg-gray-100 transition-colors"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors disabled:opacity-40"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function Budgets() {
  const {
    budgets, loadingBudgets, removeBudget, selectedMonth,
    profiles, removeProfile, applyProfile, saveCurrentAsProfile,
  } = useApp();
  const { t, formatMoney } = useT();

  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [applyingProfile, setApplyingProfile] = useState(null);
  const [showSaveBar, setShowSaveBar] = useState(false);

  const displayMonth = selectedMonth
    ? format(parseISO(`${selectedMonth}-01`), 'MMMM yyyy')
    : '';

  const openAddBudget = () => { setEditingBudget(null); setBudgetModalOpen(true); };
  const openEditBudget = (b) => { setEditingBudget(b); setBudgetModalOpen(true); };

  const handleDeleteBudget = async (id) => {
    if (!confirm(t('budgets_delete_confirm'))) return;
    setDeletingId(id);
    try { await removeBudget(id); } finally { setDeletingId(null); }
  };

  const openNewProfile = () => { setEditingProfile(null); setProfileModalOpen(true); };
  const openEditProfile = (p) => { setEditingProfile(p); setProfileModalOpen(true); };

  const handleApplyProfile = async (id) => {
    if (!confirm(t('profiles_apply_confirm', { month: displayMonth }))) return;
    setApplyingProfile(id);
    try { await applyProfile(id); } finally { setApplyingProfile(null); }
  };

  const handleSaveCurrentAsProfile = async (name) => {
    await saveCurrentAsProfile(name);
    setShowSaveBar(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('budgets_title')}
        subtitle={displayMonth}
        actions={(
          <button
            onClick={openAddBudget}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
          >
            <Plus size={16} />
            {t('budgets_add')}
          </button>
        )}
      />

      {/* Budget Profiles */}
      <SurfaceCard padding="p-5">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <BookMarked size={16} className="text-primary-600" />
            <h2 className="text-sm font-semibold text-gray-900">{t('profiles_title')}</h2>
          </div>
          <div className="flex items-center gap-2">
            {budgets.length > 0 && (
              <button
                onClick={() => setShowSaveBar((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Save size={13} />
                {t('profiles_save_current')}
              </button>
            )}
            <button
              onClick={openNewProfile}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
            >
              <Plus size={13} />
              {t('profiles_new')}
            </button>
          </div>
        </div>

        {showSaveBar && (
          <SaveAsProfileBar
            onSave={handleSaveCurrentAsProfile}
            onCancel={() => setShowSaveBar(false)}
          />
        )}

        {profiles.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            {t('profiles_empty')}
          </p>
        ) : (
          <div className="space-y-2 mt-3">
            {profiles.map((p) => (
              <ProfileCard
                key={p.id}
                profile={p}
                onEdit={openEditProfile}
                onDelete={removeProfile}
                onApply={handleApplyProfile}
                applying={applyingProfile}
              />
            ))}
          </div>
        )}
      </SurfaceCard>

      {/* Active budgets for selected month */}
      {loadingBudgets ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : budgets.length === 0 ? (
        <SurfaceCard className="text-center py-16" padding="">
          <p className="text-gray-400 text-sm">{t('budgets_empty', { month: displayMonth })}</p>
          <button
            onClick={openAddBudget}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
          >
            {t('budgets_add_first')}
          </button>
        </SurfaceCard>
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
              <SurfaceCard key={b.id}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {b.category_name || b.category}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {t('budgets_monthly_limit', { amount: formatMoney(limit) })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditBudget(b)}
                      className="p-1.5 text-gray-400 hover:text-primary-600 rounded-md hover:bg-gray-100 transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteBudget(b.id)}
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
                    <span className="font-medium text-gray-700">{formatMoney(spent)}</span>{' '}
                    {t('budgets_spent')}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>
                    {pct >= 100
                      ? t('budgets_over', { amount: formatMoney(Math.abs(remaining)) })
                      : t('budgets_left', { amount: formatMoney(remaining) })}
                  </span>
                </div>
              </SurfaceCard>
            );
          })}
        </div>
      )}

      {budgetModalOpen && (
        <BudgetModal budget={editingBudget} onClose={() => setBudgetModalOpen(false)} />
      )}
      {profileModalOpen && (
        <ProfileModal profile={editingProfile} onClose={() => setProfileModalOpen(false)} />
      )}
    </div>
  );
}
