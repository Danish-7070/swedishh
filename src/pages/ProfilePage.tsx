import React, { useState } from 'react';
import { User, Mail, Edit, Save, X, Lock, Shield } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../hooks/useAuth';
import { profileAPI } from '../services/api';
import { ValidationUtils } from '../utils/validation';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    avatar_url: user?.avatar_url || ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name,
        email: user.email,
        avatar_url: user.avatar_url || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    const nameValidation = ValidationUtils.validateRequired(formData.full_name, 'Full name');
    if (!nameValidation.isValid) {
      newErrors.full_name = nameValidation.error!;
    }
    
    const emailValidation = ValidationUtils.validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error!;
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await profileAPI.updateProfile({
        full_name: formData.full_name,
        avatar_url: formData.avatar_url
      });
      
      if (response.success) {
        // Update localStorage
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        localStorage.setItem('user_data', JSON.stringify({
          ...userData,
          full_name: formData.full_name,
          avatar_url: formData.avatar_url
        }));
        
        setIsEditing(false);
        setErrors({});
      } else {
        alert(response.error || 'Failed to update profile');
      }
    } catch (error) {
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleCancel = () => {
    if (user) {
      setFormData({
        full_name: user.full_name,
        email: user.email,
        avatar_url: user.avatar_url || ''
      });
    }
    setIsEditing(false);
    setErrors({});
  };

  if (!user) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account information and preferences.</p>
        </div>
        {!isEditing && (
          <Button icon={Edit} onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Card title="Personal Information">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Full Name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  icon={User}
                  error={errors.full_name}
                  required
                />

                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  icon={Mail}
                  error={errors.email}
                  helperText="Email changes require verification"
                  required
                />

                <Input
                  label="Avatar URL"
                  name="avatar_url"
                  value={formData.avatar_url}
                  onChange={handleChange}
                  placeholder="https://example.com/avatar.jpg"
                  helperText="Optional: URL to your profile picture"
                />

                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                  <Button type="button" variant="secondary" onClick={handleCancel} icon={X}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={loading} icon={Save}>
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={user.avatar_url || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'}
                    alt={user.full_name}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{user.full_name}</h3>
                    <p className="text-gray-600">{user.email}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'foundation_owner' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900">{user.full_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <p className="mt-1 text-sm text-gray-900">{user.role.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User ID</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">{user.id}</p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Account Statistics */}
        <div className="space-y-6">
          <Card title="Account Statistics">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Account Type</span>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  user.role === 'admin' ? 'bg-red-100 text-red-800' :
                  user.role === 'foundation_owner' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {user.role.replace('_', ' ')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Foundations</span>
                <span className="text-sm font-medium text-gray-900">
                  {user.role === 'admin' ? 'All' : user.role === 'foundation_owner' ? '2' : '1'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Login</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </Card>

          <Card title="Security">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Change Password</p>
                  <p className="text-xs text-gray-600">Update your account password</p>
                </div>
                <Button 
                  size="sm" 
                  variant="secondary"
                  icon={Lock}
                  onClick={() => setShowPasswordModal(true)}
                >
                  Change
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-xs text-gray-600">Add an extra layer of security</p>
                </div>
                <Button size="sm" variant="secondary">
                  Enable
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">BankID Integration</p>
                  <p className="text-xs text-gray-600">Verify identity with BankID</p>
                </div>
                <Button size="sm" variant="secondary" icon={Shield}>
                  Setup
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
        size="md"
      >
        <PasswordChangeForm onClose={() => setShowPasswordModal(false)} />
      </Modal>
    </div>
  );
};

const PasswordChangeForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    const passwordValidation = ValidationUtils.validatePassword(formData.newPassword);
    if (!passwordValidation.isValid) {
      newErrors.newPassword = passwordValidation.error!;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      // In a real implementation, this would call the backend
      // For now, simulate the API call
      setTimeout(() => {
        setLoading(false);
        onClose();
        alert('Password changed successfully');
      }, 1000);
    } catch (error) {
      setLoading(false);
      alert('Failed to change password');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Current Password"
        name="currentPassword"
        type="password"
        value={formData.currentPassword}
        onChange={handleChange}
        icon={Lock}
        error={errors.currentPassword}
        required
      />
      
      <Input
        label="New Password"
        name="newPassword"
        type="password"
        value={formData.newPassword}
        onChange={handleChange}
        icon={Lock}
        error={errors.newPassword}
        helperText="Must be at least 6 characters"
        required
      />
      
      <Input
        label="Confirm New Password"
        name="confirmPassword"
        type="password"
        value={formData.confirmPassword}
        onChange={handleChange}
        icon={Lock}
        error={errors.confirmPassword}
        required
      />
      
      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          Change Password
        </Button>
      </div>
    </form>
  );
};