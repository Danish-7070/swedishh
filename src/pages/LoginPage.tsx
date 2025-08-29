import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { getDefaultRoute } from '../utils/permissions';
import { useAuth } from '../hooks/useAuth';
import { ValidationUtils } from '../utils/validation';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate form
    const newErrors: Record<string, string> = {};
    
    const emailValidation = ValidationUtils.validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error!;
    }
    
    const passwordValidation = ValidationUtils.validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.error!;
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await login(formData.email, formData.password);
      
      if (response.success) {
        navigate(getDefaultRoute(response.data.user.role));
      } else {
        // Try demo credentials as fallback
        const mockCredentials = [
          { email: 'admin@example.com', password: 'AdminPass123', role: 'admin' },
          { email: 'manager@example.com', password: 'ManagerPass123', role: 'foundation_owner' },
          { email: 'developer@example.com', password: 'DevPass123', role: 'member' }
        ];
        
        const mockUser = mockCredentials.find(
          cred => cred.email === formData.email && cred.password === formData.password
        );
        
        if (mockUser) {
          // Mock successful login
          localStorage.setItem('auth_token', 'mock_token_' + mockUser.role);
          localStorage.setItem('user_data', JSON.stringify({
            id: 'mock_' + mockUser.role,
            email: mockUser.email,
            role: mockUser.role,
            full_name: mockUser.role === 'admin' ? 'System Administrator' :
                       mockUser.role === 'foundation_owner' ? 'Foundation Manager' :
                       'Developer User'
          }));
          
          navigate(getDefaultRoute(mockUser.role));
          window.location.reload(); // Force reload to update auth state
        } else {
          setErrors({ email: 'Invalid email or password. Try the demo credentials.' });
        }
      }
    } catch (err) {
      setErrors({ email: 'Login failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    
    // Clear errors when user starts typing
    if (errors[e.target.name]) {
      setErrors(prev => ({
        ...prev,
        [e.target.name]: ''
      }));
    }
  };

  return (
    <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          icon={Mail}
          error={errors.email}
          required
          placeholder="Enter your email"
        />
        
        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          icon={Lock}
          error={errors.password}
          required
          placeholder="Enter your password"
        />
        
        {/* Demo Credentials Helper */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Demo Credentials:</h4>
          <div className="text-xs text-blue-800 space-y-1">
            <div><strong>Admin:</strong> admin@example.com / AdminPass123</div>
            <div><strong>Manager:</strong> manager@example.com / ManagerPass123</div>
            <div><strong>Developer:</strong> developer@example.com / DevPass123</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>
          
          <div className="text-sm">
            <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
              Forgot your password?
            </a>
          </div>
        </div>
        
        <Button
          type="submit"
          className="w-full"
          loading={loading}
        >
          Sign In
        </Button>
        
        <div className="text-center">
          <span className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
              Sign up
            </Link>
          </span>
        </div>
      </form>
    </div>
  );
};