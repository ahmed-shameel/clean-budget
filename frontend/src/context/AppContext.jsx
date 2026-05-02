import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { format } from 'date-fns';
import * as api from '../api/client';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const currentMonth = format(new Date(), 'yyyy-MM');
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [profiles, setProfiles] = useState([]);

  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [loadingBudgets, setLoadingBudgets] = useState(false);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (e) {
      console.error('Failed to load categories', e);
    }
  }, []);

  const loadTransactions = useCallback(async (month) => {
    setLoadingTransactions(true);
    try {
      const data = await api.getTransactions({ month });
      setTransactions(data);
    } catch (e) {
      console.error('Failed to load transactions', e);
      setTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  }, []);

  const loadBudgets = useCallback(async (month) => {
    setLoadingBudgets(true);
    try {
      const data = await api.getBudgets(month);
      setBudgets(data);
    } catch (e) {
      console.error('Failed to load budgets', e);
      setBudgets([]);
    } finally {
      setLoadingBudgets(false);
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoadingDashboard(true);
    try {
      const data = await api.getDashboardSummary();
      setDashboardData(data);
    } catch (e) {
      console.error('Failed to load dashboard', e);
      setDashboardData(null);
    } finally {
      setLoadingDashboard(false);
    }
  }, []);

  const loadInsights = useCallback(async () => {
    setLoadingInsights(true);
    try {
      const data = await api.getInsights();
      setInsights(data);
    } catch (e) {
      console.error('Failed to load insights', e);
      setInsights(null);
    } finally {
      setLoadingInsights(false);
    }
  }, []);

  const loadProfiles = useCallback(async () => {
    try {
      const data = await api.getProfiles();
      setProfiles(data);
    } catch (e) {
      console.error('Failed to load profiles', e);
    }
  }, []);

  const refreshAll = useCallback(() => {
    loadCategories();
    loadTransactions(selectedMonth);
    loadBudgets(selectedMonth);
    loadDashboard();
    loadInsights();
    loadProfiles();
  }, [loadCategories, loadTransactions, loadBudgets, loadDashboard, loadInsights, loadProfiles, selectedMonth]);

  useEffect(() => {
    refreshAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadTransactions(selectedMonth);
    loadBudgets(selectedMonth);
  }, [selectedMonth, loadTransactions, loadBudgets]);

  const addTransaction = async (data) => {
    await api.createTransaction(data);
    await loadTransactions(selectedMonth);
    await loadBudgets(selectedMonth);
    await loadDashboard();
    await loadInsights();
  };

  const editTransaction = async (id, data) => {
    await api.updateTransaction(id, data);
    await loadTransactions(selectedMonth);
    await loadBudgets(selectedMonth);
    await loadDashboard();
    await loadInsights();
  };

  const removeTransaction = async (id) => {
    await api.deleteTransaction(id);
    await loadTransactions(selectedMonth);
    await loadBudgets(selectedMonth);
    await loadDashboard();
    await loadInsights();
  };

  const saveBudget = async (data) => {
    await api.upsertBudget(data);
    await loadBudgets(selectedMonth);
    await loadDashboard();
    await loadInsights();
  };

  const removeBudget = async (id) => {
    await api.deleteBudget(id);
    await loadBudgets(selectedMonth);
    await loadDashboard();
    await loadInsights();
  };

  // --- Profiles ---
  const saveProfile = async (data, id = null) => {
    if (id) await api.updateProfile(id, data);
    else await api.createProfile(data);
    await loadProfiles();
  };

  const removeProfile = async (id) => {
    await api.deleteProfile(id);
    await loadProfiles();
  };

  const applyProfile = async (id) => {
    await api.applyProfile(id, selectedMonth);
    await loadBudgets(selectedMonth);
    await loadDashboard();
    await loadInsights();
  };

  const saveCurrentAsProfile = async (name) => {
    const profileBudgets = budgets.map((b) => ({
      category_id: b.category_id,
      monthly_limit: b.monthly_limit,
    }));
    await api.createProfile({ name, budgets: profileBudgets });
    await loadProfiles();
  };

  // --- Reset ---
  const resetPlan = async () => {
    await api.resetAll();
    await refreshAll();
  };

  return (
    <AppContext.Provider
      value={{
        transactions,
        budgets,
        categories,
        dashboardData,
        insights,
        profiles,
        loadingTransactions,
        loadingBudgets,
        loadingDashboard,
        loadingInsights,
        selectedMonth,
        setSelectedMonth,
        addTransaction,
        editTransaction,
        removeTransaction,
        saveBudget,
        removeBudget,
        saveProfile,
        removeProfile,
        applyProfile,
        saveCurrentAsProfile,
        resetPlan,
        refreshAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
