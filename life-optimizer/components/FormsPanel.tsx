"use client";

import { useEffect, useState } from 'react';

type FormsPanelProps = {
  cycle: string;
  onSaved: () => void;
};

async function postJson(path: string, body: unknown) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
}

type FixedExpense = { id: number; name: string; amount: number };

export function FormsPanel({ cycle, onSaved }: FormsPanelProps) {
  const [loading, setLoading] = useState(false);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);

  const [expense, setExpense] = useState({ title: '', amount: '', date: `${cycle}-27` });
  const [fixed, setFixed] = useState({ name: '', amount: '' });

  const loadFixedExpenses = async () => {
    const res = await fetch('/api/fixed-expenses');
    const data = await res.json();
    setFixedExpenses(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    void loadFixedExpenses();
  }, []);

  const submitExpense = async () => {
    setLoading(true);
    try {
      await postJson('/api/transactions', {
        ...expense,
        amount: Number(expense.amount),
      });
      setExpense((s) => ({ ...s, title: '', amount: '' }));
      onSaved();
    } finally {
      setLoading(false);
    }
  };

  const submitFixed = async () => {
    setLoading(true);
    try {
      await postJson('/api/fixed-expenses', { ...fixed, amount: Number(fixed.amount) });
      setFixed({ name: '', amount: '' });
      await loadFixedExpenses();
      onSaved();
    } finally {
      setLoading(false);
    }
  };

  const removeFixed = async (id: number) => {
    setLoading(true);
    try {
      await fetch(`/api/fixed-expenses?id=${id}`, { method: 'DELETE' });
      await loadFixedExpenses();
      onSaved();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h3 className="font-semibold">Add daily expense</h3>
        <div className="mt-2 grid grid-cols-1 gap-2">
          <input className="input" placeholder="Title" value={expense.title} onChange={(e) => setExpense((s) => ({ ...s, title: e.target.value }))} />
          <input className="input" type="number" placeholder="Amount" value={expense.amount} onChange={(e) => setExpense((s) => ({ ...s, amount: e.target.value }))} />
          <input className="input" type="date" value={expense.date} onChange={(e) => setExpense((s) => ({ ...s, date: e.target.value }))} />
          <button className="btn-primary" disabled={loading} onClick={submitExpense}>Save expense</button>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="font-semibold">Fixed monthly expenses</h3>
        <div className="mt-2 grid grid-cols-1 gap-2">
          <input className="input" placeholder="Name" value={fixed.name} onChange={(e) => setFixed((s) => ({ ...s, name: e.target.value }))} />
          <input className="input" type="number" placeholder="Amount" value={fixed.amount} onChange={(e) => setFixed((s) => ({ ...s, amount: e.target.value }))} />
          <button className="btn-primary" disabled={loading} onClick={submitFixed}>Save fixed</button>
        </div>

        <ul className="mt-3 space-y-2">
          {fixedExpenses.map((item) => (
            <li key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <span>{item.name} · {item.amount.toFixed(0)}</span>
              <button className="text-red-600 hover:text-red-700" onClick={() => void removeFixed(item.id)}>
                Remove
              </button>
            </li>
          ))}
          {fixedExpenses.length === 0 && (
            <li className="text-sm text-slate-500">No fixed expenses yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
