import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../hooks/useAuth';
import { ValidationUtils } from '../utils/validation';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Basic validation
    const newErrors: Record<string, string> = {};
    
    const nameValidation = ValidationUtils.validateRequired(formData.fullName, 'Full name');
    if (!nameValidation.isValid) {
      newErrors.fullName = nameValidation.error!;
    }
    
    const emailValidation = ValidationUtils.validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error!;
    }
    
    const passwordValidation = ValidationUtils.validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.error!;
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await register(formData.email, formData.password, formData.fullName);
      
      if (response.success) {
        navigate('/login');
        alert('Registration successful! Please check your email to verify your account.');
      } else {
        setErrors({ email: response.error || 'Registration failed' });
      }
    } catch (error) {
      setErrors({ email: 'Registration failed. Please try again.' });
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

  return (
    <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Full Name"
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          icon={User}
          error={errors.fullName}
          placeholder="Enter your full name"
        />
        
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          icon={Mail}
          error={errors.email}
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
          placeholder="Create a password"
          helperText="Must be at least 6 characters"
        />
        
        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          icon={Lock}
          error={errors.confirmPassword}
          placeholder="Confirm your password"
        />
        
        <Button
          type="submit"
          className="w-full"
          loading={loading}
        >
          Create Account
        </Button>
        
        <div className="text-center">
          <span className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </span>
        </div>
      </form>
    </div>
  );
};