import { useState, useEffect } from 'react';
import { expenseAPI } from '../services/api';

export interface Expense {
  id: string;
  foundation_id: string;
  user_id: string;
  amount: number;
  currency: string;
  category: 'office_supplies' | 'travel' | 'meals' | 'utilities' | 'professional_services' | 'marketing' | 'other';
  description: string;
  receipt_url?: string;
  expense_date: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  foundations?: { name: string };
  profiles?: { full_name: string; email: string };
}

export const useExpenses = (foundationId?: string) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadExpenses();
  }, [foundationId]);

  const loadExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await expenseAPI.getExpenses(foundationId);
      if (response.success) {
        setExpenses(response.data || []);
      } else {
        setError(response.error || 'Failed to load expenses');
      }
    } catch (err) {
      setError('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const createExpense = async (expenseData: Partial<Expense>) => {
    try {
      const response = await expenseAPI.createExpense(expenseData);
      if (response.success) {
        await loadExpenses();
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { success: false, error: 'Failed to create expense' };
    }
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    try {
      const response = await expenseAPI.updateExpense(id, updates);
      if (response.success) {
        await loadExpenses();
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { success: false, error: 'Failed to update expense' };
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const response = await expenseAPI.deleteExpense(id);
      if (response.success) {
        await loadExpenses();
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { success: false, error: 'Failed to delete expense' };
    }
  };

  const approveExpense = async (id: string) => {
    try {
      const response = await expenseAPI.approveExpense(id);
      if (response.success) {
        await loadExpenses();
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { success: false, error: 'Failed to approve expense' };
    }
  };

  const rejectExpense = async (id: string, rejectionReason: string) => {
    try {
      const response = await expenseAPI.rejectExpense(id, rejectionReason);
      if (response.success) {
        await loadExpenses();
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { success: false, error: 'Failed to reject expense' };
    }
  };

  return {
    expenses,
    loading,
    error,
    loadExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    approveExpense,
    rejectExpense
  };
};