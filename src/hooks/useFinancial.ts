import { useState, useEffect } from 'react';
import { financialAPI } from '../services/api';

export interface Account {
  id: string;
  foundation_id: string;
  account_number: string;
  account_name: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  balance: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: string;
  foundation_id: string;
  entry_number: string;
  entry_date: string;
  description: string;
  reference_number?: string;
  total_debit: number;
  total_credit: number;
  status: 'draft' | 'posted' | 'reversed';
  created_by: string;
  line_items: JournalEntryLine[];
  created_at: string;
  updated_at: string;
}

export interface JournalEntryLine {
  id: string;
  journal_entry_id: string;
  account_id: string;
  account_name?: string;
  description: string;
  debit_amount: number;
  credit_amount: number;
  line_order: number;
}

export const useFinancial = (foundationId?: string) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAccounts();
    loadJournalEntries();
  }, [foundationId]);

  const loadAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await financialAPI.getAccounts(foundationId);
      if (response.success) {
        setAccounts(response.data || []);
      } else {
        setError(response.error || 'Failed to load accounts');
      }
    } catch (err) {
      setError('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const loadJournalEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await financialAPI.getJournalEntries(foundationId);
      if (response.success) {
        setJournalEntries(response.data || []);
      } else {
        setError(response.error || 'Failed to load journal entries');
      }
    } catch (err) {
      setError('Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async (accountData: Partial<Account>) => {
    try {
      const response = await financialAPI.createAccount(accountData);
      if (response.success) {
        await loadAccounts();
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { success: false, error: 'Failed to create account' };
    }
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    try {
      const response = await financialAPI.updateAccount(id, updates);
      if (response.success) {
        await loadAccounts();
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { success: false, error: 'Failed to update account' };
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      const response = await financialAPI.deleteAccount(id);
      if (response.success) {
        await loadAccounts();
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { success: false, error: 'Failed to delete account' };
    }
  };

  const createJournalEntry = async (entryData: any) => {
    try {
      const response = await financialAPI.createJournalEntry(entryData);
      if (response.success) {
        await loadJournalEntries();
        await loadAccounts(); // Reload accounts to update balances
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { success: false, error: 'Failed to create journal entry' };
    }
  };

  const updateJournalEntry = async (id: string, updates: any) => {
    try {
      const response = await financialAPI.updateJournalEntry(id, updates);
      if (response.success) {
        await loadJournalEntries();
        await loadAccounts(); // Reload accounts to update balances
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { success: false, error: 'Failed to update journal entry' };
    }
  };

  const deleteJournalEntry = async (id: string) => {
    try {
      const response = await financialAPI.deleteJournalEntry(id);
      if (response.success) {
        await loadJournalEntries();
        await loadAccounts(); // Reload accounts to update balances
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (err) {
      return { success: false, error: 'Failed to delete journal entry' };
    }
  };

  return {
    accounts,
    journalEntries,
    loading,
    error,
    loadAccounts,
    loadJournalEntries,
    createAccount,
    updateAccount,
    deleteAccount,
    createJournalEntry,
    updateJournalEntry,
    deleteJournalEntry
  };
};