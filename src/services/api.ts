import React, { useState } from 'react';
import { Plus, Search, Eye, Receipt, CheckCircle, Clock, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { mockExpenses, mockFoundations } from '../data/mockData';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export const ExpensesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [foundationFilter, setFoundationFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredExpenses = mockExpenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    const matchesFoundation = foundationFilter === 'all' || expense.foundation_id === foundationFilter;
    return matchesSearch && matchesStatus && matchesCategory && matchesFoundation;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Receipt className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600 mt-1">Track and manage foundation expenses.</p>
        </div>
        <Button icon={Plus} onClick={() => setShowCreateModal(true)}>
          Add Expense
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Receipt className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalExpenses.toLocaleString('sv-SE')} SEK
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredExpenses.filter(e => e.status === 'pending').length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredExpenses.filter(e => e.status === 'approved').length}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredExpenses.filter(e => e.status === 'rejected').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={Search}
            />
          </div>
          <div className="lg:w-48">
            <select
              value={foundationFilter}
              onChange={(e) => setFoundationFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Foundations</option>
              {mockFoundations.map((foundation) => (
                <option key={foundation.id} value={foundation.id}>
                  {foundation.name}
                </option>
              ))}
            </select>
          </div>
          <div className="lg:w-48">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="office_supplies">Office Supplies</option>
              <option value="travel">Travel</option>
              <option value="meals">Meals</option>
              <option value="utilities">Utilities</option>
              <option value="professional_services">Professional Services</option>
              <option value="marketing">Marketing</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="lg:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Expenses List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredExpenses.map((expense) => {
          const foundation = mockFoundations.find(f => f.id === expense.foundation_id);
          return (
            <Card key={expense.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(expense.status)}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{expense.description}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {getCategoryLabel(expense.category)} • {foundation?.name}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Date: {new Date(expense.expense_date).toLocaleDateString()}</span>
                      <span>Submitted: {new Date(expense.created_at).toLocaleDateString()}</span>
                      {expense.receipt_url && <span>📎 Receipt attached</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      {expense.amount.toLocaleString('sv-SE')} {expense.currency}
                    </p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(expense.status)}`}>
                      {expense.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" icon={Eye}>
                      View
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredExpenses.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' || foundationFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first expense.'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && categoryFilter === 'all' && foundationFilter === 'all' && (
              <Button icon={Plus} onClick={() => setShowCreateModal(true)}>
                Add Expense
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Expense Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Expenses by Category" subtitle="Spending distribution analysis">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Office Supplies', value: 25000, color: '#3B82F6' },
                    { name: 'Travel', value: 15000, color: '#10B981' },
                    { name: 'Professional Services', value: 35000, color: '#F59E0B' },
                    { name: 'Utilities', value: 8000, color: '#EF4444' },
                    { name: 'Marketing', value: 12000, color: '#8B5CF6' }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {[
                    { name: 'Office Supplies', value: 25000, color: '#3B82F6' },
                    { name: 'Travel', value: 15000, color: '#10B981' },
                    { name: 'Professional Services', value: 35000, color: '#F59E0B' },
                    { name: 'Utilities', value: 8000, color: '#EF4444' },
                    { name: 'Marketing', value: 12000, color: '#8B5CF6' }
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value.toLocaleString('sv-SE')} SEK`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Monthly Expense Trends" subtitle="Track spending patterns over time">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { month: 'Jan', amount: 45000, approved: 42000, pending: 3000 },
                { month: 'Feb', amount: 52000, approved: 48000, pending: 4000 },
                { month: 'Mar', amount: 48000, approved: 45000, pending: 3000 },
                { month: 'Apr', amount: 55000, approved: 50000, pending: 5000 },
                { month: 'May', amount: 49000, approved: 46000, pending: 3000 },
                { month: 'Jun', amount: 53000, approved: 49000, pending: 4000 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => [`${value.toLocaleString('sv-SE')} SEK`, '']} />
                <Bar dataKey="approved" fill="#10B981" name="Approved" />
                <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Create Expense Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add Expense"
        size="lg"
      >
        <ExpenseForm onClose={() => setShowCreateModal(false)} />
      </Modal>
    </div>
  );
};

const ExpenseForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    foundation_id: '',
    amount: '',
    currency: 'SEK',
    category: '',
    description: '',
    expense_date: '',
    receipt: null as File | null
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      onClose();
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, receipt: file }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Foundation
          </label>
          <select
            name="foundation_id"
            value={formData.foundation_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          >
            <option value="">Select Foundation</option>
            {mockFoundations.map((foundation) => (
              <option key={foundation.id} value={foundation.id}>
                {foundation.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Amount"
            name="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="SEK">SEK</option>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          >
            <option value="">Select Category</option>
            <option value="office_supplies">Office Supplies</option>
            <option value="travel">Travel</option>
            <option value="meals">Meals</option>
            <option value="utilities">Utilities</option>
            <option value="professional_services">Professional Services</option>
            <option value="marketing">Marketing</option>
            <option value="other">Other</option>
          </select>
        </div>

        <Input
          label="Expense Date"
          name="expense_date"
          type="date"
          value={formData.expense_date}
          onChange={handleChange}
          required
        />
      </div>

      <Input
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Brief description of the expense"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Receipt (Optional)
        </label>
        <input
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.jpg,.jpeg,.png"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <p className="text-sm text-gray-500 mt-1">
          Upload receipt image or PDF (Max 5MB)
        </p>
      </div>
      
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Add Expense
        </Button>
      </div>
    </form>
  );
};