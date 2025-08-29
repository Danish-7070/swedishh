import React, { useState } from 'react';
import { Plus, Search, Eye, Receipt, CheckCircle, Clock, XCircle, Edit, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { useExpenses } from '../hooks/useExpenses';
import { foundationAPI } from '../services/api';
import { ValidationUtils } from '../utils/validation';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export const ExpensesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [foundationFilter, setFoundationFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [foundations, setFoundations] = useState<any[]>([]);

  // Get user data for role checking
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  const userRole = userData.role || 'member';
  const canApprove = userRole === 'admin' || userRole === 'foundation_owner';

  const {
    expenses,
    loading,
    error,
    createExpense,
    updateExpense,
    deleteExpense,
    approveExpense,
    rejectExpense
  } = useExpenses(foundationFilter === 'all' ? undefined : foundationFilter);

  // Load foundations on component mount
  React.useEffect(() => {
    loadFoundations();
  }, []);

  const loadFoundations = async () => {
    const response = await foundationAPI.getFoundations();
    if (response.success) {
      setFoundations(response.data || []);
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
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

  const handleCreateExpense = async (expenseData: any) => {
    const response = await createExpense(expenseData);
    if (response.success) {
      setShowCreateModal(false);
    } else {
      alert(response.error || 'Failed to create expense');
    }
  };

  const handleApproveExpense = async (id: string) => {
    const response = await approveExpense(id);
    if (response.success) {
      setShowApprovalModal(false);
      setSelectedExpense(null);
    } else {
      alert(response.error || 'Failed to approve expense');
    }
  };

  const handleRejectExpense = async (id: string, reason: string) => {
    const response = await rejectExpense(id, reason);
    if (response.success) {
      setShowApprovalModal(false);
      setSelectedExpense(null);
    } else {
      alert(response.error || 'Failed to reject expense');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      const response = await deleteExpense(id);
      if (!response.success) {
        alert(response.error || 'Failed to delete expense');
      }
    }
  };

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

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
                {ValidationUtils.formatCurrency(totalExpenses)}
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
              {foundations.map((foundation) => (
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
      {loading ? (
        <Card>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading expenses...</p>
          </div>
        </Card>
      ) : filteredExpenses.length === 0 ? (
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
      ) : (
        <div className="grid grid-cols-1 gap-4">
        {filteredExpenses.map((expense) => {
          return (
            <Card key={expense.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getStatusIcon(expense.status)}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{expense.description}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {getCategoryLabel(expense.category)} • {expense.foundations?.name || 'Unknown Foundation'}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Date: {new Date(expense.expense_date).toLocaleDateString()}</span>
                      <span>Submitted: {new Date(expense.created_at).toLocaleDateString()}</span>
                      {expense.receipt_url && <span>📎 Receipt attached</span>}
                      <span>By: {expense.profiles?.full_name || 'Unknown User'}</span>
                    </div>
                    {expense.rejection_reason && (
                      <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                        <strong>Rejection reason:</strong> {expense.rejection_reason}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                      {ValidationUtils.formatCurrency(expense.amount, expense.currency)}
                    </p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(expense.status)}`}>
                      {expense.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" icon={Eye}>
                      View
                    </Button>
                    {canApprove && expense.status === 'pending' && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setSelectedExpense(expense);
                          setShowApprovalModal(true);
                        }}
                      >
                        Review
                      </Button>
                    )}
                    {(expense.user_id === userData.id && expense.status === 'pending') && (
                      <>
                        <Button variant="ghost" size="sm" icon={Edit}>
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          icon={Trash2}
                          onClick={() => handleDeleteExpense(expense.id)}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        </div>
      )}

      {/* Expense Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Expenses by Category" subtitle="Spending distribution analysis">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={Object.entries(
                    filteredExpenses.reduce((acc, expense) => {
                      const category = getCategoryLabel(expense.category);
                      acc[category] = (acc[category] || 0) + expense.amount;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([name, value], index) => ({
                    name,
                    value,
                    color: COLORS[index % COLORS.length]
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {Object.entries(
                    filteredExpenses.reduce((acc, expense) => {
                      const category = getCategoryLabel(expense.category);
                      acc[category] = (acc[category] || 0) + expense.amount;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map((entry, index) => (
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
        <ExpenseForm 
          foundations={foundations}
          onSubmit={handleCreateExpense}
          onClose={() => setShowCreateModal(false)} 
        />
      </Modal>

      {/* Approval Modal */}
      <Modal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        title="Review Expense"
        size="md"
      >
        {selectedExpense && (
          <ExpenseApprovalForm
            expense={selectedExpense}
            onApprove={() => handleApproveExpense(selectedExpense.id)}
            onReject={(reason) => handleRejectExpense(selectedExpense.id, reason)}
            onClose={() => setShowApprovalModal(false)}
          />
        )}
      </Modal>
    </div>
  );
};

const ExpenseForm: React.FC<{ 
  foundations: any[];
  onSubmit: (data: any) => void;
  onClose: () => void;
}> = ({ foundations, onSubmit, onClose }) => {
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!formData.foundation_id) {
      newErrors.foundation_id = 'Foundation is required';
    }
    
    const amountValidation = ValidationUtils.validateCurrency(formData.amount);
    if (!amountValidation.isValid) {
      newErrors.amount = amountValidation.error!;
    }
    
    const descValidation = ValidationUtils.validateRequired(formData.description, 'Description');
    if (!descValidation.isValid) {
      newErrors.description = descValidation.error!;
    }
    
    const dateValidation = ValidationUtils.validateDate(formData.expense_date);
    if (!dateValidation.isValid) {
      newErrors.expense_date = dateValidation.error!;
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    const expenseData = {
      ...formData,
      amount: parseFloat(formData.amount)
    };
    
    onSubmit(expenseData);
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors(prev => ({
        ...prev,
        [e.target.name]: ''
      }));
    }
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
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.foundation_id ? 'border-red-300' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Select Foundation</option>
            {foundations.map((foundation) => (
              <option key={foundation.id} value={foundation.id}>
                {foundation.name}
              </option>
            ))}
          </select>
          {errors.foundation_id && (
            <p className="text-sm text-red-600 mt-1">{errors.foundation_id}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            error={errors.amount}
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
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.category ? 'border-red-300' : 'border-gray-300'
            }`}
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
          {errors.category && (
            <p className="text-sm text-red-600 mt-1">{errors.category}</p>
          )}
        </div>

        <Input
          label="Expense Date"
          name="expense_date"
          type="date"
          value={formData.expense_date}
          onChange={handleChange}
          error={errors.expense_date}
          required
        />
      </div>

      <Input
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Brief description of the expense"
        error={errors.description}
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

const ExpenseApprovalForm: React.FC<{
  expense: any;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onClose: () => void;
}> = ({ expense, onApprove, onReject, onClose }) => {
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (action === 'reject' && !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    
    setLoading(true);
    
    if (action === 'approve') {
      onApprove();
    } else {
      onReject(rejectionReason);
    }
    
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{expense.description}</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">Amount:</span>
            <span className="ml-2">{ValidationUtils.formatCurrency(expense.amount, expense.currency)}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Category:</span>
            <span className="ml-2">{expense.category.replace(/_/g, ' ')}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Date:</span>
            <span className="ml-2">{new Date(expense.expense_date).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="font-medium text-gray-600">Submitted by:</span>
            <span className="ml-2">{expense.profiles?.full_name || 'Unknown'}</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Decision
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              value="approve"
              checked={action === 'approve'}
              onChange={(e) => setAction(e.target.value as 'approve')}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Approve Expense</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="reject"
              checked={action === 'reject'}
              onChange={(e) => setAction(e.target.value as 'reject')}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Reject Expense</span>
          </label>
        </div>
      </div>

      {action === 'reject' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rejection Reason
          </label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Please provide a reason for rejection..."
            required
          />
        </div>
      )}

      <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={loading} variant={action === 'reject' ? 'danger' : 'primary'}>
          {action === 'approve' ? 'Approve' : 'Reject'} Expense
        </Button>
      </div>
    </form>
  );
};