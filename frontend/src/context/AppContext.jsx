/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { format } from 'date-fns';
import * as api from '../api/client';

const AppContext = createContext(null);

function currentCycleKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-based
  const cycleStart = now.getDate() >= 27
    ? new Date(year, month, 1)
    : new Date(year, month - 1, 1);
  return format(cycleStart, 'yyyy-MM');
}

export function AppProvider({ children }) {
  const currentMonth = currentCycleKey();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [cycleOverview, setCycleOverview] = useState(null);
  const [profileBaseline, setProfileBaseline] = useState(null);
  const [fixedCosts, setFixedCosts] = useState([]);
  const [insights, setInsights] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [incomeTarget, setIncomeTarget] = useState(null);

  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [loadingBudgets, setLoadingBudgets] = useState(false);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [loadingCycleOverview, setLoadingCycleOverview] = useState(false);
  const [loadingProfileBaseline, setLoadingProfileBaseline] = useState(false);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loadingIncomeTarget, setLoadingIncomeTarget] = useState(false);

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

  const loadCycleOverview = useCallback(async (cycle) => {
    setLoadingCycleOverview(true);
    try {
      const data = await api.getCycleOverview(cycle);
      setCycleOverview(data);
    } catch (e) {
      console.error('Failed to load cycle overview', e);
      setCycleOverview(null);
    } finally {
      setLoadingCycleOverview(false);
    }
  }, []);

  const loadProfileBaseline = useCallback(async () => {
    setLoadingProfileBaseline(true);
    try {
      const data = await api.getProfileBaseline();
      setProfileBaseline(data);
      const fixed = await api.getFixedCosts();
      setFixedCosts(fixed || []);
    } catch (e) {
      console.error('Failed to load profile baseline', e);
      setProfileBaseline(null);
      setFixedCosts([]);
    } finally {
      setLoadingProfileBaseline(false);
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

  const loadIncomeTarget = useCallback(async (month) => {
    setLoadingIncomeTarget(true);
    try {
      const data = await api.getIncomeTarget(month);
      setIncomeTarget(data?.total_income ?? null);
    } catch (e) {
      console.error('Failed to load income target', e);
      setIncomeTarget(null);
    } finally {
      setLoadingIncomeTarget(false);
    }
  }, []);

  const refreshAll = useCallback(() => {
    loadCategories();
    loadTransactions(selectedMonth);
    loadBudgets(selectedMonth);
    loadDashboard();
  loadCycleOverview(selectedMonth);
  loadProfileBaseline();
    loadInsights();
    loadProfiles();
    loadIncomeTarget(selectedMonth);
  }, [loadCategories, loadTransactions, loadBudgets, loadDashboard, loadCycleOverview, loadProfileBaseline, loadInsights, loadProfiles, loadIncomeTarget, selectedMonth]);

  useEffect(() => {
    refreshAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadTransactions(selectedMonth);
    loadBudgets(selectedMonth);
    loadCycleOverview(selectedMonth);
    loadIncomeTarget(selectedMonth);
  }, [selectedMonth, loadTransactions, loadBudgets, loadCycleOverview, loadIncomeTarget]);

  const saveBaselineProfile = async (monthlySalary) => {
    await api.saveProfileBaseline({ monthly_salary: Number(monthlySalary) });
    await loadProfileBaseline();
    await loadCycleOverview(selectedMonth);
  };

  const addFixedCost = async (payload) => {
    await api.createFixedCost(payload);
    await loadProfileBaseline();
    await loadCycleOverview(selectedMonth);
  };

  const removeFixedCost = async (id) => {
    await api.deleteFixedCost(id);
    await loadProfileBaseline();
    await loadCycleOverview(selectedMonth);
  };

  const saveIncomeTarget = async (totalIncome) => {
    await api.upsertIncomeTarget({
      month: selectedMonth,
      total_income: totalIncome,
    });
    await loadIncomeTarget(selectedMonth);
  };

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
    await api.upsertBudget({
      ...data,
      month: data?.month || selectedMonth,
    });
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
  cycleOverview,
  profileBaseline,
  fixedCosts,
        insights,
        profiles,
  incomeTarget,
        loadingTransactions,
        loadingBudgets,
        loadingDashboard,
  loadingCycleOverview,
  loadingProfileBaseline,
        loadingInsights,
  loadingIncomeTarget,
        selectedMonth,
        setSelectedMonth,
        addTransaction,
        editTransaction,
        removeTransaction,
        saveBudget,
  saveBaselineProfile,
  addFixedCost,
  removeFixedCost,
        removeBudget,
        saveProfile,
        removeProfile,
        applyProfile,
        saveCurrentAsProfile,
        saveIncomeTarget,
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
