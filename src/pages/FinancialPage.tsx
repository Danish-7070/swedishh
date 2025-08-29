import React, { useState } from 'react';
import { Calculator, FileText, CreditCard, Users, Shield, Building, TrendingUp, DollarSign } from 'lucide-react';
import { Card } from '../components/Card';
import { BookkeepingModule } from '../components/financial/BookkeepingModule';
import { useFinancial } from '../hooks/useFinancial';
import { useExpenses } from '../hooks/useExpenses';
import { ValidationUtils } from '../utils/validation';

type FinancialTab = 'overview' | 'bookkeeping' | 'invoicing' | 'supplier-invoices' | 'payroll' | 'bank-integration' | 'bankid' | 'expense-management';

export const FinancialPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FinancialTab>('overview');
  
  // Get foundation ID from user data
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const foundationId = '1'; // Default foundation for demo
  
  const { accounts, journalEntries } = useFinancial(foundationId);
  const { expenses } = useExpenses(foundationId);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: TrendingUp },
    { id: 'bookkeeping', name: 'Bookkeeping', icon: Calculator },
    { id: 'expense-management', name: 'Expenses', icon: DollarSign }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'bookkeeping':
        return <BookkeepingModule />;
      case 'expense-management':
        return <ExpenseManagementModule expenses={expenses} />;
      default:
        return <FinancialOverview accounts={accounts} journalEntries={journalEntries} expenses={expenses} />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Financial Management</h1>
        <p className="text-gray-600 mt-1">Comprehensive financial tools for Swedish foundations.</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as FinancialTab)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {renderTabContent()}
      </div>
    </div>
  );
};

const FinancialOverview: React.FC<{
  accounts: any[];
  journalEntries: any[];
  expenses: any[];
}> = ({ accounts, journalEntries, expenses }) => {
  // Calculate real financial metrics
  const totalAssets = accounts
    .filter(acc => acc.account_type === 'asset')
    .reduce((sum, acc) => sum + acc.balance, 0);
    
  const totalLiabilities = accounts
    .filter(acc => acc.account_type === 'liability')
    .reduce((sum, acc) => sum + acc.balance, 0);
    
  const totalEquity = accounts
    .filter(acc => acc.account_type === 'equity')
    .reduce((sum, acc) => sum + acc.balance, 0);
    
  const totalRevenue = accounts
    .filter(acc => acc.account_type === 'revenue')
    .reduce((sum, acc) => sum + acc.balance, 0);
    
  const totalExpenseAccounts = accounts
    .filter(acc => acc.account_type === 'expense')
    .reduce((sum, acc) => sum + acc.balance, 0);
    
  const pendingExpenses = expenses.filter(exp => exp.status === 'pending').length;
  const totalExpenseAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Assets</p>
              <p className="text-2xl font-bold text-gray-900">
                {ValidationUtils.formatCurrency(totalAssets)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {ValidationUtils.formatCurrency(totalRevenue)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-gray-900">{pendingExpenses}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">
                {ValidationUtils.formatCurrency(totalExpenseAmount)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Financial Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Bookkeeping & Accounting" subtitle="Double-entry bookkeeping with Swedish standards">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calculator className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Chart of Accounts</p>
                  <p className="text-sm text-gray-600">BAS-compliant account structure</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">{accounts.length} accounts</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Journal Entries</p>
                  <p className="text-sm text-gray-600">Automated and manual entries</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">{journalEntries.length} entries</span>
            </div>
          </div>
        </Card>

        <Card title="Expense Management" subtitle="Track and approve foundation expenses">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Pending Expenses</p>
                <p className="text-sm text-gray-600">Awaiting approval</p>
              </div>
              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                {pendingExpenses}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Total Expenses</p>
                <p className="text-sm text-gray-600">All submitted expenses</p>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {ValidationUtils.formatCurrency(totalExpenseAmount)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Account Balance Summary */}
      <Card title="Account Balances" subtitle="Current balances by account type">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-900">Assets</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {ValidationUtils.formatCurrency(totalAssets)}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-red-600" />
              <span className="text-sm text-gray-900">Liabilities</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {ValidationUtils.formatCurrency(totalLiabilities)}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-900">Equity</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {ValidationUtils.formatCurrency(totalEquity)}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Calculator className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-900">Net Worth</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {ValidationUtils.formatCurrency(totalAssets - totalLiabilities)}
            </span>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card title="Recent Financial Activity" subtitle="Latest transactions and entries">
        <div className="space-y-3">
          {journalEntries.slice(0, 5).map((entry) => (
            <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{entry.entry_number}</p>
                <p className="text-sm text-gray-600">{entry.description}</p>
                <p className="text-xs text-gray-500">
                  {new Date(entry.entry_date).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {ValidationUtils.formatCurrency(entry.total_debit)}
                </p>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  entry.status === 'posted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {entry.status}
                </span>
              </div>
            </div>
          ))}
          {journalEntries.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No journal entries yet
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

const ExpenseManagementModule: React.FC<{ expenses: any[] }> = ({ expenses }) => {
  const pendingExpenses = expenses.filter(exp => exp.status === 'pending');
  const approvedExpenses = expenses.filter(exp => exp.status === 'approved');
  const rejectedExpenses = expenses.filter(exp => exp.status === 'rejected');
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="font-medium text-gray-900">Pending Review</h3>
            <p className="text-2xl font-bold text-yellow-600">{pendingExpenses.length}</p>
            <p className="text-sm text-gray-600">
              {ValidationUtils.formatCurrency(
                pendingExpenses.reduce((sum, exp) => sum + exp.amount, 0)
              )}
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900">Approved</h3>
            <p className="text-2xl font-bold text-green-600">{approvedExpenses.length}</p>
            <p className="text-sm text-gray-600">
              {ValidationUtils.formatCurrency(
                approvedExpenses.reduce((sum, exp) => sum + exp.amount, 0)
              )}
            </p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-medium text-gray-900">Rejected</h3>
            <p className="text-2xl font-bold text-red-600">{rejectedExpenses.length}</p>
            <p className="text-sm text-gray-600">
              {ValidationUtils.formatCurrency(
                rejectedExpenses.reduce((sum, exp) => sum + exp.amount, 0)
              )}
            </p>
          </div>
        </Card>
      </div>
      
      <Card title="Expense Categories" subtitle="Breakdown by category">
        <div className="space-y-3">
          {Object.entries(
            expenses.reduce((acc, expense) => {
              const category = expense.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              acc[category] = (acc[category] || 0) + expense.amount;
              return acc;
            }, {} as Record<string, number>)
          ).map(([category, amount]) => (
            <div key={category} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-900">{category}</span>
              <span className="text-sm font-medium text-gray-900">
                {ValidationUtils.formatCurrency(amount)}
              </span>
            </div>
          ))}
          {expenses.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No expenses recorded yet
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};