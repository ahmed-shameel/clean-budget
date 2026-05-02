import { useState } from 'react';
import { LayoutDashboard, List, PieChart, Lightbulb, Wallet, RotateCcw } from 'lucide-react';
import { AppProvider } from './context/AppContext';
import { LangProvider, useT } from './i18n/index.jsx';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Insights from './pages/Insights';
import ResetModal from './components/ResetModal';

const NAV_KEYS = [
  { id: 'dashboard',    labelKey: 'nav_dashboard',    icon: LayoutDashboard },
  { id: 'transactions', labelKey: 'nav_transactions', icon: List },
  { id: 'budgets',      labelKey: 'nav_budgets',      icon: PieChart },
  { id: 'insights',     labelKey: 'nav_insights',     icon: Lightbulb },
];

const PAGES = {
  dashboard: Dashboard,
  transactions: Transactions,
  budgets: Budgets,
  insights: Insights,
};

function LangToggle() {
  const { lang, setLang } = useT();
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {['en', 'sv'].map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`flex-1 py-1 text-xs font-semibold rounded-md transition-colors uppercase ${
            lang === l
              ? 'bg-primary-600 text-white'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function CurrencyToggle() {
  const { currency, setCurrency } = useT();
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      {['EUR', 'SEK'].map((c) => (
        <button
          key={c}
          onClick={() => setCurrency(c)}
          className={`flex-1 py-1 text-xs font-semibold rounded-md transition-colors uppercase ${
            currency === c
              ? 'bg-primary-600 text-white'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

function Layout() {
  const [activePage, setActivePage] = useState('dashboard');
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const { t } = useT();
  const Page = PAGES[activePage];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
          <div className="p-2 bg-primary-600 rounded-lg">
            <Wallet size={20} className="text-white" />
          </div>
          <span className="text-base font-bold text-gray-900">{t('brand')}</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {NAV_KEYS.map(({ id, labelKey, icon: Icon }) => {
            const active = activePage === id;
            return (
              <button
                key={id}
                onClick={() => setActivePage(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon size={18} />
                {t(labelKey)}
              </button>
            );
          })}
        </nav>

        <div className="px-4 pb-2 border-t border-gray-100 pt-3 space-y-1">
          {/* Language toggle */}
          <LangToggle />
          {/* Currency toggle */}
          <CurrencyToggle />
          {/* Reset */}
          <button
            onClick={() => setResetModalOpen(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <RotateCcw size={18} />
            {t('nav_start_new_plan')}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary-600 rounded-lg">
              <Wallet size={16} className="text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">{t('brand')}</span>
          </div>
          {/* Language toggle on mobile */}
          <div className="flex items-center gap-1">
            <LangToggle />
            <CurrencyToggle />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8 pb-24 md:pb-8">
          <Page />
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center z-40">
          {NAV_KEYS.map(({ id, labelKey, icon: Icon }) => {
            const active = activePage === id;
            return (
              <button
                key={id}
                onClick={() => setActivePage(id)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-medium transition-colors ${
                  active ? 'text-primary-600' : 'text-gray-400'
                }`}
              >
                <Icon size={20} />
                {t(labelKey)}
              </button>
            );
          })}
        </nav>
      </div>

      {resetModalOpen && (
        <ResetModal onClose={() => setResetModalOpen(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <LangProvider>
      <AppProvider>
        <Layout />
      </AppProvider>
    </LangProvider>
  );
}
