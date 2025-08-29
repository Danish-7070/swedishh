import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Calculator, Save, X } from 'lucide-react';
import { Card } from '../Card';
import { Button } from '../Button';
import { Input } from '../Input';
import { Modal } from '../Modal';
import { useFinancial } from '../../hooks/useFinancial';
import { ValidationUtils } from '../../utils/validation';

interface Account {
  id: string;
export const BookkeepingModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'accounts' | 'journal'>('accounts');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [editingEntry, setEditingEntry] = useState<any>(null);

  // Get foundation ID from user data
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const foundationId = '1'; // Default foundation for demo
  
  const {
    accounts,
    journalEntries,
    loading,
    error,
    createAccount,
    updateAccount,
    deleteAccount,
    createJournalEntry,
    updateJournalEntry,
    deleteJournalEntry
  } = useFinancial(foundationId);

  const handleCreateAccount = async (accountData: Partial<Account>) => {
    const response = await createAccount({
      ...accountData,
      foundation_id: foundationId
    });
    if (response.success) {
      setShowAccountModal(false);
    } else {
      alert(response.error || 'Failed to create account');
    }
  };

  const handleUpdateAccount = async (id: string, updates: Partial<Account>) => {
    const response = await updateAccount(id, updates);
    if (response.success) {
      setEditingAccount(null);
    } else {
      alert(response.error || 'Failed to update account');
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (confirm('Are you sure you want to delete this account?')) {
      const response = await deleteAccount(id);
      if (response.success) {
        // Account list will update automatically
      } else {
        alert(response.error || 'Failed to delete account');
      }
    }
  };

  const handleCreateJournalEntry = async (entryData: any) => {
    // Validate journal entry
    const validation = ValidationUtils.validateJournalEntry(entryData.line_items);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    const response = await createJournalEntry({
      ...entryData,
      foundation_id: foundationId
    });
    if (response.success) {
      setShowJournalModal(false);
    } else {
      alert(response.error || 'Failed to create journal entry');
    }
  };

  const handleUpdateJournalEntry = async (id: string, updates: any) => {
    // Validate journal entry if line_items are being updated
    if (updates.line_items) {
      const validation = ValidationUtils.validateJournalEntry(updates.line_items);
      if (!validation.isValid) {
        alert(validation.error);
        return;
      }
    }

    const response = await updateJournalEntry(id, updates);
    if (response.success) {
      setEditingEntry(null);
    } else {
      alert(response.error || 'Failed to update journal entry');
    }
  };

  const handleDeleteJournalEntry = async (id: string) => {
    if (confirm('Are you sure you want to delete this journal entry?')) {
      const response = await deleteJournalEntry(id);
      if (response.success) {
        // Journal entries list will update automatically
      } else {
        alert(response.error || 'Failed to delete journal entry');
      }
    }
  };

  const filteredAccounts = accounts.filter(account =>
    account.account_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.account_number.includes(searchTerm)
  );

  const filteredJournalEntries = journalEntries.filter(entry =>
    entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.entry_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'asset': return 'bg-green-100 text-green-800';
      case 'liability': return 'bg-red-100 text-red-800';
      case 'equity': return 'bg-blue-100 text-blue-800';
      case 'revenue': return 'bg-purple-100 text-purple-800';
      case 'expense': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'reversed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <Card>
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">Error: {error}</div>
          <Button onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bookkeeping</h2>
          <p className="text-gray-600 mt-1">Manage chart of accounts and journal entries.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            icon={Calculator} 
            variant="secondary"
            onClick={() => setShowJournalModal(true)}
            disabled={loading}
          >
            New Journal Entry
          </Button>
          <Button 
            icon={Plus}
            onClick={() => setShowAccountModal(true)}
            disabled={loading}
          >
            New Account
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('accounts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'accounts'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Chart of Accounts
          </button>
          <button
            onClick={() => setActiveTab('journal')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'journal'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Journal Entries
          </button>
        </nav>
      </div>

      {/* Search */}
      <Card>
        <Input
          placeholder={`Search ${activeTab === 'accounts' ? 'accounts' : 'journal entries'}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={Search}
        />
      </Card>

      {/* Chart of Accounts */}
      {activeTab === 'accounts' && (
        <Card title="Chart of Accounts" subtitle="Manage your accounting structure">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading accounts...</p>
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No accounts found</p>
              <Button onClick={() => setShowAccountModal(true)}>
                Create First Account
              </Button>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAccounts.map((account) => (
                  <tr key={account.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        {editingAccount?.id === account.id ? (
                          <EditAccountRow 
                            account={account}
                            onSave={(updates) => handleUpdateAccount(account.id, updates)}
                            onCancel={() => setEditingAccount(null)}
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900">
                            {account.account_number} - {account.account_name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAccountTypeColor(account.account_type)}`}>
                        {account.account_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ValidationUtils.formatCurrency(account.balance, account.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        account.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {account.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          icon={Edit}
                          onClick={() => setEditingAccount(account)}
                          disabled={loading}
                        >
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          icon={Trash2}
                          onClick={() => handleDeleteAccount(account.id)}
                          disabled={loading}
                        >
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </Card>
      )}

      {/* Journal Entries */}
      {activeTab === 'journal' && (
        <div className="space-y-6">
          {loading ? (
            <Card>
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading journal entries...</p>
              </div>
            </Card>
          ) : filteredJournalEntries.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No journal entries found</p>
                <Button onClick={() => setShowJournalModal(true)}>
                  Create First Journal Entry
                </Button>
              </div>
            </Card>
          ) : (
            filteredJournalEntries.map((entry) => (
            <Card key={entry.id}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{entry.entry_number}</h3>
                  <p className="text-sm text-gray-600">{entry.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Date: {new Date(entry.entry_date).toLocaleDateString()}
                    {entry.reference_number && ` • Ref: ${entry.reference_number}`}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(entry.status)}`}>
                    {entry.status}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    icon={Edit}
                    onClick={() => setEditingEntry(entry)}
                    disabled={loading}
                  >
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    icon={Trash2}
                    onClick={() => handleDeleteJournalEntry(entry.id)}
                    disabled={loading}
                  >
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Account
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Description
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Debit
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Credit
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {entry.line_items.map((line) => (
                      <tr key={line.id}>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">
                          {line.account_name || 'Unknown Account'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {line.description}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-right">
                          {line.debit_amount > 0 ? line.debit_amount.toLocaleString('sv-SE') : '-'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900 text-right">
                          {line.credit_amount > 0 ? line.credit_amount.toLocaleString('sv-SE') : '-'}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 font-semibold">
                      <td className="px-4 py-2 text-sm text-gray-900" colSpan={2}>
                        Total
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">
                        {entry.total_debit.toLocaleString('sv-SE')}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 text-right">
                        {entry.total_credit.toLocaleString('sv-SE')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          )))}
        </div>
      )}

      {/* Account Modal */}
      <Modal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        title="Create New Account"
        size="md"
      >
        <AccountForm 
          onSubmit={handleCreateAccount}
          onClose={() => setShowAccountModal(false)} 
        />
      </Modal>

      {/* Journal Entry Modal */}
      <Modal
        isOpen={showJournalModal}
        onClose={() => setShowJournalModal(false)}
        title="Create Journal Entry"
        size="lg"
      >
        <JournalEntryForm 
          accounts={accounts}
          onSubmit={handleCreateJournalEntry}
          onClose={() => setShowJournalModal(false)} 
        />
      </Modal>

      {/* Edit Journal Entry Modal */}
      <Modal
        isOpen={!!editingEntry}
        onClose={() => setEditingEntry(null)}
        title="Edit Journal Entry"
        size="lg"
      >
        {editingEntry && (
          <JournalEntryForm 
            entry={editingEntry}
            accounts={accounts}
            onSubmit={(data) => handleUpdateJournalEntry(editingEntry.id, data)}
            onClose={() => setEditingEntry(null)} 
          />
        )}
      </Modal>
    </div>
  );
};

const EditAccountRow: React.FC<{
  account: any;
  onSave: (updates: any) => void;
  onCancel: () => void;
}> = ({ account, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    account_name: account.account_name,
    account_type: account.account_type,
    is_active: account.is_active
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = () => {
    // Validate form
    const newErrors: Record<string, string> = {};
    
    const nameValidation = ValidationUtils.validateRequired(formData.account_name, 'Account name');
    if (!nameValidation.isValid) {
      newErrors.account_name = nameValidation.error!;
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSave(formData);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
      <input
        value={formData.account_name}
        onChange={(e) => setFormData(prev => ({ ...prev, account_name: e.target.value }))}
        className={`text-sm border rounded px-2 py-1 ${errors.account_name ? 'border-red-300' : ''}`}
        placeholder="Account name"
      />
      <select
        value={formData.account_type}
        onChange={(e) => setFormData(prev => ({ ...prev, account_type: e.target.value }))}
        className="text-sm border rounded px-2 py-1"
      >
        <option value="asset">Asset</option>
        <option value="liability">Liability</option>
        <option value="equity">Equity</option>
        <option value="revenue">Revenue</option>
        <option value="expense">Expense</option>
      </select>
      <label className="flex items-center space-x-1">
        <input
          type="checkbox"
          checked={formData.is_active}
          onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
          className="rounded"
        />
        <span className="text-xs text-gray-600">Active</span>
      </label>
      <Button size="sm" icon={Save} onClick={handleSave} />
      <Button size="sm" variant="ghost" icon={X} onClick={onCancel} />
      </div>
      {errors.account_name && (
        <p className="text-xs text-red-600">{errors.account_name}</p>
      )}
    </div>
  );
};

const AccountForm: React.FC<{ 
  account?: any;
  onSubmit: (data: any) => void;
  onClose: () => void;
}> = ({ account, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    account_number: account?.account_number || '',
    account_name: account?.account_name || '',
    account_type: account?.account_type || 'asset',
    currency: account?.currency || 'SEK'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    const numberValidation = ValidationUtils.validateAccountNumber(formData.account_number);
    if (!numberValidation.isValid) {
      newErrors.account_number = numberValidation.error!;
    }
    
    const nameValidation = ValidationUtils.validateRequired(formData.account_name, 'Account name');
    if (!nameValidation.isValid) {
      newErrors.account_name = nameValidation.error!;
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    onSubmit(formData);
    setLoading(false);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Account Number"
          value={formData.account_number}
          onChange={(e) => handleChange('account_number', e.target.value)}
          placeholder="e.g., 1010"
          error={errors.account_number}
          helperText="4-digit account number"
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Type
          </label>
          <select
            value={formData.account_type}
            onChange={(e) => handleChange('account_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          >
            <option value="asset">Asset</option>
            <option value="liability">Liability</option>
            <option value="equity">Equity</option>
            <option value="revenue">Revenue</option>
            <option value="expense">Expense</option>
          </select>
        </div>
      </div>

      <Input
        label="Account Name"
        value={formData.account_name}
        onChange={(e) => handleChange('account_name', e.target.value)}
        placeholder="e.g., Cash"
        error={errors.account_name}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Currency
        </label>
        <select
          value={formData.currency}
          onChange={(e) => handleChange('currency', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="SEK">Swedish Krona (SEK)</option>
          <option value="EUR">Euro (EUR)</option>
          <option value="USD">US Dollar (USD)</option>
        </select>
      </div>

      <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {account ? 'Update Account' : 'Create Account'}
        </Button>
      </div>
    </form>
  );
};

const JournalEntryForm: React.FC<{ 
  entry?: any;
  accounts: any[];
  onSubmit: (data: any) => void;
  onClose: () => void;
}> = ({ entry, accounts, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    entry_date: entry?.entry_date || new Date().toISOString().split('T')[0],
    description: entry?.description || '',
    reference_number: entry?.reference_number || '',
    line_items: [
      { account_id: '', description: '', debit_amount: 0, credit_amount: 0 },
      { account_id: '', description: '', debit_amount: 0, credit_amount: 0 }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (entry) {
      setFormData({
        entry_date: entry.entry_date,
        description: entry.description,
        reference_number: entry.reference_number || '',
        line_items: entry.line_items.map(line => ({
          account_id: line.account_id,
          description: line.description,
          debit_amount: line.debit_amount,
          credit_amount: line.credit_amount
        }))
      });
    }
  }, [entry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    const descValidation = ValidationUtils.validateRequired(formData.description, 'Description');
    if (!descValidation.isValid) {
      newErrors.description = descValidation.error!;
    }
    
    const dateValidation = ValidationUtils.validateDate(formData.entry_date);
    if (!dateValidation.isValid) {
      newErrors.entry_date = dateValidation.error!;
    }
    
    const journalValidation = ValidationUtils.validateJournalEntry(formData.line_items);
    if (!journalValidation.isValid) {
      newErrors.line_items = journalValidation.error!;
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    onSubmit(formData);
    setLoading(false);
  };

  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      line_items: [...prev.line_items, { account_id: '', description: '', debit_amount: 0, credit_amount: 0 }]
    }));
  };

  const removeLineItem = (index: number) => {
    if (formData.line_items.length > 2) {
      setFormData(prev => ({
        ...prev,
        line_items: prev.line_items.filter((_, i) => i !== index)
      }));
    }
  };

  const updateLineItem = (index: number, field: string, value: any) => {
    // Clear line items error when user makes changes
    if (errors.line_items) {
      setErrors(prev => ({ ...prev, line_items: '' }));
    }
    
    setFormData(prev => ({
      ...prev,
      line_items: prev.line_items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const totalDebits = formData.line_items.reduce((sum, item) => sum + (item.debit_amount || 0), 0);
  const totalCredits = formData.line_items.reduce((sum, item) => sum + (item.credit_amount || 0), 0);
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Entry Date"
          type="date"
          value={formData.entry_date}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, entry_date: e.target.value }));
            if (errors.entry_date) {
              setErrors(prev => ({ ...prev, entry_date: '' }));
            }
          }}
          error={errors.entry_date}
          required
        />
        <div>
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, description: e.target.value }));
              if (errors.description) {
                setErrors(prev => ({ ...prev, description: '' }));
              }
            }}
            placeholder="Journal entry description"
            error={errors.description}
            required
          />
        </div>
      </div>
      
      <div>
          <Input
            label="Reference Number (Optional)"
            value={formData.reference_number}
            onChange={(e) => setFormData(prev => ({ ...prev, reference_number: e.target.value }))}
            placeholder="Reference number"
          />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Line Items
          </label>
          <div className="flex space-x-2">
            <Button type="button" size="sm" onClick={addLineItem}>
              Add Line
            </Button>
            <div className={`text-sm px-2 py-1 rounded ${isBalanced ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isBalanced ? 'Balanced' : 'Unbalanced'}
            </div>
          </div>
        </div>
        
        {errors.line_items && (
          <div className="text-sm text-red-600 mb-2">{errors.line_items}</div>
        )}
        
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {formData.line_items.map((line, index) => (
            <div key={index} className="grid grid-cols-5 gap-2 p-2 border rounded">
              <select
                value={line.account_id}
                onChange={(e) => updateLineItem(index, 'account_id', e.target.value)}
                className="px-2 py-1 border rounded text-sm"
                required
              >
                <option value="">Select Account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.account_number} - {account.account_name}
                  </option>
                ))}
              </select>
              <input
                placeholder="Description"
                className="px-2 py-1 border rounded text-sm"
                value={line.description}
                onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                required
              />
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Debit"
                className="px-2 py-1 border rounded text-sm"
                value={line.debit_amount || ''}
                onChange={(e) => updateLineItem(index, 'debit_amount', parseFloat(e.target.value) || 0)}
              />
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Credit"
                className="px-2 py-1 border rounded text-sm"
                value={line.credit_amount || ''}
                onChange={(e) => updateLineItem(index, 'credit_amount', parseFloat(e.target.value) || 0)}
              />
              {formData.line_items.length > 2 && (
                <Button 
                  type="button" 
                  size="sm" 
                  variant="ghost" 
                  icon={X}
                  onClick={() => removeLineItem(index)}
                />
              )}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm font-medium">
          <div className="text-right">
            Total Debits: {totalDebits.toLocaleString('sv-SE')} SEK
          </div>
          <div className="text-right">
            Total Credits: {totalCredits.toLocaleString('sv-SE')} SEK
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={loading} disabled={!isBalanced}>
          {entry ? 'Update Entry' : 'Create Entry'}
        </Button>
      </div>
    </form>
  );
};