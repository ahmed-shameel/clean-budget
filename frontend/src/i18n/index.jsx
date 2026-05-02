/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import en from './en';
import sv from './sv';

const TRANSLATIONS = { en, sv };
const STORAGE_KEY = 'clean_budget_lang';
const CURRENCY_KEY = 'clean_budget_currency';

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(
    () => localStorage.getItem(STORAGE_KEY) || 'en'
  );
  const [currency, setCurrencyState] = useState(
    () => localStorage.getItem(CURRENCY_KEY) || 'EUR'
  );

  const setLang = (l) => {
    localStorage.setItem(STORAGE_KEY, l);
    setLangState(l);
  };

  const setCurrency = (c) => {
    localStorage.setItem(CURRENCY_KEY, c);
    setCurrencyState(c);
  };

  return (
    <LangContext.Provider value={{ lang, setLang, currency, setCurrency }}>
      {children}
    </LangContext.Provider>
  );
}

/**
 * useT — returns a translation function t(key, vars?)
 *
 * Supports simple interpolation:
 *   t('budgets_empty', { month: 'May 2026' })
 *   → "No budgets set for May 2026."
 */
export function useT() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useT must be used within LangProvider');

  const { lang, setLang, currency, setCurrency } = ctx;
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const t = (key, vars = {}) => {
    const template = dict[key] ?? en[key] ?? key;
    return Object.entries(vars).reduce(
      (str, [k, v]) => str.replaceAll(`{${k}}`, v),
      template
    );
  };

  const translateCategory = (name) => {
    if (!name) return '';
    const key = `category_${String(name)
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '')}`;

    const translated = t(key);
    return translated === key ? name : translated;
  };

  const locale = lang === 'sv' ? 'sv-SE' : 'en-IE';

  const formatMoney = (value) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value || 0));

  const currencySymbol =
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .formatToParts(0)
      .find((p) => p.type === 'currency')?.value || currency;

  return {
    t,
    lang,
    setLang,
    currency,
    setCurrency,
    formatMoney,
    currencySymbol,
    translateCategory,
  };
}
