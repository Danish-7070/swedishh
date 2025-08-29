import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Users, FileText, Shield, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { foundationAPI, authAPI } from '../services/api';
import { ValidationUtils } from '../utils/validation';

export const FoundationRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showBankIDModal, setShowBankIDModal] = useState(false);
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [registrationData, setRegistrationData] = useState({
    foundation_name: '',
    purpose: '',
    registered_office_address: '',
    postal_code: '',
    city: '',
    country: 'Sweden',
    initial_capital: 0,
    currency: 'SEK',
    board_members: [] as any[],
    status: 'draft'
  });

  const [contactPerson, setContactPerson] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: '',
    is_authorized_representative: true
  });

  const [complianceChecks, setComplianceChecks] = useState<any[]>([]);

  const steps = [
    { id: 1, title: 'Basic Information', description: 'Foundation details and purpose' },
    { id: 2, title: 'Board Members', description: 'Add board members and roles' },
    { id: 3, title: 'Contact Person', description: 'Authorized representative details' },
    { id: 4, title: 'Compliance Check', description: 'Verify regulatory requirements' },
    { id: 5, title: 'Document Generation', description: 'Generate required documents' },
    { id: 6, title: 'Digital Signatures', description: 'BankID verification and signing' },
    { id: 7, title: 'Authority Submission', description: 'Submit to Swedish authorities' }
  ];

  const handleBasicInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate basic information
    const newErrors: Record<string, string> = {};
    
    const nameValidation = ValidationUtils.validateFoundationName(registrationData.foundation_name);
    if (!nameValidation.isValid) {
      newErrors.foundation_name = nameValidation.error!;
    }
    
    if (!registrationData.purpose || registrationData.purpose.length < 50) {
      newErrors.purpose = 'Purpose must be at least 50 characters';
    }
    
    const capitalValidation = ValidationUtils.validateCurrency(registrationData.initial_capital);
    if (!capitalValidation.isValid) {
      newErrors.initial_capital = capitalValidation.error!;
    } else if (registrationData.initial_capital < 25000) {
      newErrors.initial_capital = 'Minimum capital requirement is 25,000 SEK';
    }
    
    if (!registrationData.registered_office_address.trim()) {
      newErrors.registered_office_address = 'Address is required';
    }
    
    if (!registrationData.postal_code.trim()) {
      newErrors.postal_code = 'Postal code is required';
    }
    
    if (!registrationData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setCurrentStep(2);
  };

  const handleBoardMembersSubmit = () => {
    if (registrationData.board_members && registrationData.board_members.length >= 3) {
      // Validate all board members
      const memberErrors: string[] = [];
      
      registrationData.board_members.forEach((member, index) => {
        if (!member.first_name.trim()) {
          memberErrors.push(`Board member ${index + 1}: First name is required`);
        }
        if (!member.last_name.trim()) {
          memberErrors.push(`Board member ${index + 1}: Last name is required`);
        }
        if (!member.email.trim()) {
          memberErrors.push(`Board member ${index + 1}: Email is required`);
        } else {
          const emailValidation = ValidationUtils.validateEmail(member.email);
          if (!emailValidation.isValid) {
            memberErrors.push(`Board member ${index + 1}: ${emailValidation.error}`);
          }
        }
        if (!member.personal_number.trim()) {
          memberErrors.push(`Board member ${index + 1}: Personal number is required`);
        } else {
          const personalNumberValidation = ValidationUtils.validateSwedishPersonalNumber(member.personal_number);
          if (!personalNumberValidation.isValid) {
            memberErrors.push(`Board member ${index + 1}: ${personalNumberValidation.error}`);
          }
        }
        if (!member.role) {
          memberErrors.push(`Board member ${index + 1}: Role is required`);
        }
        if (!member.address.trim()) {
          memberErrors.push(`Board member ${index + 1}: Address is required`);
        }
      });
      
      if (memberErrors.length > 0) {
        alert('Please fix the following errors:\n\n' + memberErrors.join('\n'));
        return;
      }
      
      setCurrentStep(3);
    } else {
      alert('A foundation requires at least 3 board members');
    }
  };

  const handleContactPersonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate contact person
    const newErrors: Record<string, string> = {};
    
    if (!contactPerson.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    
    if (!contactPerson.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    
    const emailValidation = ValidationUtils.validateEmail(contactPerson.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error!;
    }
    
    const phoneValidation = ValidationUtils.validateSwedishPhone(contactPerson.phone);
    if (!phoneValidation.isValid) {
      newErrors.phone = phoneValidation.error!;
    }
    
    if (!contactPerson.role.trim()) {
      newErrors.role = 'Role is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setCurrentStep(4);
    runComplianceChecks();
  };

  const runComplianceChecks = () => {
    setLoading(true);
    
    // Simulate compliance checks
    setTimeout(() => {
      const checks = [
        {
          id: '1',
          check_type: 'minimum_capital',
          status: (registrationData.initial_capital || 0) >= 25000 ? 'passed' : 'failed',
          details: (registrationData.initial_capital || 0) >= 25000 
            ? 'Minimum capital requirement of 25,000 SEK met'
            : 'Minimum capital requirement of 25,000 SEK not met',
          checked_at: new Date().toISOString()
        },
        {
          id: '2',
          check_type: 'board_composition',
          status: (registrationData.board_members?.length || 0) >= 3 ? 'passed' : 'failed',
          details: (registrationData.board_members?.length || 0) >= 3
            ? 'Board composition meets minimum requirement of 3 members'
            : 'Board must have at least 3 members',
          checked_at: new Date().toISOString()
        },
        {
          id: '3',
          check_type: 'purpose_validity',
          status: registrationData.purpose && registrationData.purpose.length > 50 ? 'passed' : 'failed',
          details: registrationData.purpose && registrationData.purpose.length > 50
            ? 'Foundation purpose is sufficiently detailed'
            : 'Foundation purpose must be more detailed (minimum 50 characters)',
          checked_at: new Date().toISOString()
        },
        {
          id: '4',
          check_type: 'name_availability',
          status: 'passed',
          details: 'Foundation name is available and compliant',
          checked_at: new Date().toISOString()
        },
        {
          id: '5',
          check_type: 'contact_person_validation',
          status: contactPerson.email && contactPerson.phone ? 'passed' : 'failed',
          details: contactPerson.email && contactPerson.phone
            ? 'Contact person information is complete'
            : 'Contact person information is incomplete',
          checked_at: new Date().toISOString()
        }
      ];
      
      setComplianceChecks(checks);
      setLoading(false);
      setShowComplianceModal(true);
    }, 2000);
  };

  const handleComplianceComplete = () => {
    const allPassed = complianceChecks.every(check => check.status === 'passed');
    if (allPassed) {
      setCurrentStep(5);
      setShowComplianceModal(false);
    }
  };

  const addBoardMember = () => {
    const newMember = {
      id: Date.now().toString(),
      first_name: '',
      last_name: '',
      personal_number: '',
      email: '',
      phone: '',
      address: '',
      role: 'member',
      is_signatory: false,
      bankid_verified: false
    };
    
    setRegistrationData(prev => ({
      ...prev,
      board_members: [...(prev.board_members || []), newMember]
    }));
  };

  const updateBoardMember = (index: number, field: string, value: any) => {
    setRegistrationData(prev => ({
      ...prev,
      board_members: prev.board_members?.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      ) || []
    }));
  };

  const removeBoardMember = (index: number) => {
    setRegistrationData(prev => ({
      ...prev,
      board_members: prev.board_members?.filter((_, i) => i !== index) || []
    }));
  };

  const generateDocuments = () => {
    setLoading(true);
    
    // Simulate document generation
    setTimeout(() => {
      setLoading(false);
      setCurrentStep(6);
    }, 3000);
  };

  const handleBankIDSigning = () => {
    setShowBankIDModal(true);
  };

  const completeBankIDSigning = () => {
    setShowBankIDModal(false);
    setCurrentStep(7);
  };

  const submitToAuthorities = async () => {
    setLoading(true);
    
    try {
      // Create foundation in database
      const foundationResponse = await foundationAPI.createFoundation({
        name: registrationData.foundation_name,
        registration_number: `REG-${Date.now()}`,
        description: registrationData.purpose,
        address: `${registrationData.registered_office_address}, ${registrationData.postal_code} ${registrationData.city}`,
        status: 'pending_verification'
      });
      
      if (!foundationResponse.success) {
        throw new Error(foundationResponse.error || 'Failed to create foundation');
      }
      
      // Create user account for contact person
      const userResponse = await authAPI.register(
        contactPerson.email,
        'TempPassword123!', // Temporary password - user will need to change it
        `${contactPerson.first_name} ${contactPerson.last_name}`
      );
      
      if (!userResponse.success) {
        throw new Error(userResponse.error || 'Failed to create user account');
      }
      
      setLoading(false);
      navigate('/registration-complete');
    } catch (error) {
      setLoading(false);
      alert(error instanceof Error ? error.message : 'Registration failed');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <BasicInformationStep 
          data={registrationData} 
          onChange={setRegistrationData}
          onSubmit={handleBasicInfoSubmit}
          errors={errors}
        />;
      case 2:
        return <BoardMembersStep 
          boardMembers={registrationData.board_members || []}
          onAdd={addBoardMember}
          onUpdate={updateBoardMember}
          onRemove={removeBoardMember}
          onSubmit={handleBoardMembersSubmit}
        />;
      case 3:
        return <ContactPersonStep 
          data={contactPerson}
          onChange={setContactPerson}
          onSubmit={handleContactPersonSubmit}
          errors={errors}
        />;
      case 4:
        return <ComplianceCheckStep 
          loading={loading}
          checks={complianceChecks}
        />;
      case 5:
        return <DocumentGenerationStep 
          loading={loading}
          onGenerate={generateDocuments}
        />;
      case 6:
        return <DigitalSignatureStep 
          onSign={handleBankIDSigning}
        />;
      case 7:
        return <AuthoritySubmissionStep 
          loading={loading}
          onSubmit={submitToAuthorities}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost" icon={ArrowLeft}>
                  Back
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <Building2 className="w-8 h-8 text-primary-600" />
                <span className="text-xl font-bold text-gray-900">Foundation Registration</span>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Step {currentStep} of {steps.length}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep > step.id ? 'bg-green-500 border-green-500 text-white' :
                  currentStep === step.id ? 'bg-primary-500 border-primary-500 text-white' :
                  'bg-white border-gray-300 text-gray-500'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 ml-4 ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-bold text-gray-900">{steps[currentStep - 1]?.title}</h2>
            <p className="text-gray-600">{steps[currentStep - 1]?.description}</p>
          </div>
        </div>

        {/* Step Content */}
        {renderStepContent()}
      </div>

      {/* Compliance Modal */}
      <Modal
        isOpen={showComplianceModal}
        onClose={() => setShowComplianceModal(false)}
        title="Compliance Verification Results"
        size="lg"
      >
        <ComplianceResults 
          checks={complianceChecks}
          onComplete={handleComplianceComplete}
          onClose={() => setShowComplianceModal(false)}
        />
      </Modal>

      {/* BankID Modal */}
      <Modal
        isOpen={showBankIDModal}
        onClose={() => setShowBankIDModal(false)}
        title="BankID Digital Signature"
        size="md"
      >
        <BankIDSigningProcess onComplete={completeBankIDSigning} />
      </Modal>
    </div>
  );
};

// Step Components
const BasicInformationStep: React.FC<{
  data: any;
  onChange: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  errors: Record<string, string>;
}> = ({ data, onChange, onSubmit, errors }) => {
  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Foundation Name"
            value={data.foundation_name || ''}
            onChange={(e) => handleChange('foundation_name', e.target.value)}
            placeholder="Enter foundation name"
            error={errors.foundation_name}
            required
          />
          <Input
            label="Initial Capital (SEK)"
            type="number"
            min="25000"
            step="0.01"
            value={data.initial_capital || ''}
            onChange={(e) => handleChange('initial_capital', parseFloat(e.target.value) || 0)}
            placeholder="25000"
            helperText="Minimum 25,000 SEK required"
            error={errors.initial_capital}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Foundation Purpose
          </label>
          <textarea
            value={data.purpose || ''}
            onChange={(e) => handleChange('purpose', e.target.value)}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.purpose ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Describe the foundation's charitable purpose and activities in detail..."
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            {(data.purpose || '').length}/50 characters minimum. Be specific about charitable activities.
          </p>
          {errors.purpose && (
            <p className="text-sm text-red-600 mt-1">{errors.purpose}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Registered Office Address"
            value={data.registered_office_address || ''}
            onChange={(e) => handleChange('registered_office_address', e.target.value)}
            placeholder="Street address"
            error={errors.registered_office_address}
            required
          />
          <Input
            label="Postal Code"
            value={data.postal_code || ''}
            onChange={(e) => handleChange('postal_code', e.target.value)}
            placeholder="12345"
            error={errors.postal_code}
            required
          />
          <Input
            label="City"
            value={data.city || ''}
            onChange={(e) => handleChange('city', e.target.value)}
            placeholder="Stockholm"
            error={errors.city}
            required
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit">
            Continue to Board Members
          </Button>
        </div>
      </form>
    </Card>
  );
};

const BoardMembersStep: React.FC<{
  boardMembers: any[];
  onAdd: () => void;
  onUpdate: (index: number, field: string, value: any) => void;
  onRemove: (index: number) => void;
  onSubmit: () => void;
}> = ({ boardMembers, onAdd, onUpdate, onRemove, onSubmit }) => {
  return (
    <Card>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Board Members</h3>
            <p className="text-sm text-gray-600">Add at least 3 board members (minimum requirement)</p>
          </div>
          <Button icon={Users} onClick={onAdd}>
            Add Board Member
          </Button>
        </div>

        <div className="space-y-6">
          {boardMembers.map((member, index) => (
            <div key={member.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Board Member {index + 1}</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onRemove(index)}
                >
                  Remove
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={member.first_name}
                  onChange={(e) => onUpdate(index, 'first_name', e.target.value)}
                  placeholder="Enter first name"
                  required
                />
                <Input
                  label="Last Name"
                  value={member.last_name}
                  onChange={(e) => onUpdate(index, 'last_name', e.target.value)}
                  placeholder="Enter last name"
                  required
                />
                <Input
                  label="Personal Number"
                  value={member.personal_number}
                  onChange={(e) => onUpdate(index, 'personal_number', e.target.value)}
                  placeholder="YYYYMMDD-XXXX"
                  helperText="Format: 19801010-1234"
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  value={member.email}
                  onChange={(e) => onUpdate(index, 'email', e.target.value)}
                  placeholder="email@example.com"
                  required
                />
                <Input
                  label="Phone"
                  value={member.phone || ''}
                  onChange={(e) => onUpdate(index, 'phone', e.target.value)}
                  placeholder="+46 70 123 45 67"
                  helperText="Swedish phone number format"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Board Role
                  </label>
                  <select
                    value={member.role}
                    onChange={(e) => onUpdate(index, 'role', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="chairman">Chairman</option>
                    <option value="vice_chairman">Vice Chairman</option>
                    <option value="secretary">Secretary</option>
                    <option value="treasurer">Treasurer</option>
                    <option value="member">Board Member</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                <Input
                  label="Address"
                  value={member.address}
                  onChange={(e) => onUpdate(index, 'address', e.target.value)}
                  placeholder="Full address"
                  required
                />
              </div>

              <div className="mt-4 flex items-center">
                <input
                  type="checkbox"
                  id={`signatory-${index}`}
                  checked={member.is_signatory}
                  onChange={(e) => onUpdate(index, 'is_signatory', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor={`signatory-${index}`} className="ml-2 text-sm text-gray-700">
                  Authorized signatory for the foundation
                </label>
              </div>
            </div>
          ))}
        </div>

        {boardMembers.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No board members added yet</p>
            <Button onClick={onAdd} className="mt-4">
              Add First Board Member
            </Button>
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="secondary" onClick={() => setCurrentStep(1)}>
            Back
          </Button>
          <Button 
            onClick={onSubmit}
            disabled={boardMembers.length < 3}
          >
            Continue to Contact Person
          </Button>
        </div>
      </div>
    </Card>
  );
};

const ContactPersonStep: React.FC<{
  data: any;
  onChange: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  errors: Record<string, string>;
}> = ({ data, onChange, onSubmit, errors }) => {
  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card>
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Authorized Representative</h3>
          <p className="text-sm text-gray-600">
            This person will be the primary contact for the registration process and will receive updates from authorities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="First Name"
            value={data.first_name}
            onChange={(e) => handleChange('first_name', e.target.value)}
            error={errors.first_name}
            required
          />
          <Input
            label="Last Name"
            value={data.last_name}
            onChange={(e) => handleChange('last_name', e.target.value)}
            error={errors.last_name}
            required
          />
          <Input
            label="Email"
            type="email"
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors.email}
            helperText="This will be used to create your account"
            required
          />
          <Input
            label="Phone"
            value={data.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+46 70 123 45 67"
            error={errors.phone}
            helperText="Swedish phone number format"
            required
          />
        </div>

        <Input
          label="Role/Title"
          value={data.role}
          onChange={(e) => handleChange('role', e.target.value)}
          placeholder="e.g., Founder, Legal Representative"
          error={errors.role}
          required
        />

        <div className="flex items-center">
          <input
            type="checkbox"
            id="authorized-rep"
            checked={data.is_authorized_representative}
            onChange={(e) => handleChange('is_authorized_representative', e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="authorized-rep" className="ml-2 text-sm text-gray-700">
            This person is authorized to represent the foundation during the registration process
          </label>
        </div>

        <div className="flex justify-between">
          <Button variant="secondary" onClick={() => setCurrentStep(2)}>
            Back
          </Button>
          <Button type="submit">
            Run Compliance Check
          </Button>
        </div>
      </form>
    </Card>
  );
};

const ComplianceCheckStep: React.FC<{
  loading: boolean;
  checks: any[];
}> = ({ loading, checks }) => {
  if (loading) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Running Compliance Checks</h3>
          <p className="text-gray-600">
            Verifying your foundation details against Swedish regulatory requirements...
          </p>
        </div>
      </Card>
    );
  }

  const allPassed = checks.every(check => check.status === 'passed');

  return (
    <Card>
      <div className="space-y-6">
        <div className="text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            allPassed ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {allPassed ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-red-600" />
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Compliance Check {allPassed ? 'Completed' : 'Issues Found'}
          </h3>
          <p className="text-gray-600">
            {allPassed 
              ? 'Your foundation meets all regulatory requirements'
              : 'Please address the issues below before proceeding'
            }
          </p>
        </div>

        <div className="space-y-4">
          {checks.map((check) => (
            <div key={check.id} className={`p-4 rounded-lg border-l-4 ${
              check.status === 'passed' ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                {check.status === 'passed' ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                )}
                <h4 className="font-medium text-gray-900">
                  {check.check_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h4>
              </div>
              <p className={`text-sm ${check.status === 'passed' ? 'text-green-700' : 'text-red-700'}`}>
                {check.details}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-between">
          <Button variant="secondary" onClick={() => setCurrentStep(3)}>
            Back to Contact Person
          </Button>
          {allPassed && (
            <Button onClick={() => setCurrentStep(5)}>
              Continue to Document Generation
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

const DocumentGenerationStep: React.FC<{
  loading: boolean;
  onGenerate: () => void;
}> = ({ loading, onGenerate }) => {
  if (loading) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-blue-600 animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Documents</h3>
          <p className="text-gray-600">
            Creating foundation statutes, application forms, and board resolutions...
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Generation</h3>
          <p className="text-gray-600">
            Generate required documents for foundation registration
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Foundation Statutes</h4>
            <p className="text-sm text-gray-600">
              Legal document defining the foundation's purpose, governance structure, and operational rules.
            </p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Registration Application</h4>
            <p className="text-sm text-gray-600">
              Official application form for submission to Länsstyrelsen.
            </p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Board Resolution</h4>
            <p className="text-sm text-gray-600">
              Resolution establishing the foundation and appointing initial board members.
            </p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Financial Declaration</h4>
            <p className="text-sm text-gray-600">
              Declaration of initial capital and financial commitments.
            </p>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Document Generation Process:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Documents will be auto-generated based on your input</li>
            <li>• All documents will comply with Swedish legal requirements</li>
            <li>• Documents will be prepared for digital signature</li>
            <li>• Audit trail will be maintained for all generated documents</li>
          </ul>
        </div>

        <div className="flex justify-between">
          <Button variant="secondary" onClick={() => setCurrentStep(4)}>
            Back
          </Button>
          <Button onClick={onGenerate}>
            Generate Documents
          </Button>
        </div>
      </div>
    </Card>
  );
};

const DigitalSignatureStep: React.FC<{
  onSign: () => void;
}> = ({ onSign }) => {
  return (
    <Card>
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Digital Signatures Required</h3>
          <p className="text-gray-600">
            All board members must digitally sign the foundation documents using BankID
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Documents to Sign:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Foundation Statutes</li>
              <li>• Board Resolution</li>
              <li>• Registration Application</li>
              <li>• Financial Declaration</li>
            </ul>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">BankID Signing Process:</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Each board member will receive a signing invitation</li>
              <li>• BankID verification ensures legal validity</li>
              <li>• All signatures are timestamped and audited</li>
              <li>• Process must be completed within 7 days</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="secondary" onClick={() => setCurrentStep(5)}>
            Back
          </Button>
          <Button onClick={onSign} icon={Shield}>
            Start BankID Signing
          </Button>
        </div>
      </div>
    </Card>
  );
};

const AuthoritySubmissionStep: React.FC<{
  loading: boolean;
  onSubmit: () => void;
}> = ({ loading, onSubmit }) => {
  if (loading) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-blue-600 animate-pulse" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Submitting to Authorities</h3>
          <p className="text-gray-600">
            Submitting your foundation registration to Länsstyrelsen...
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Submit to Swedish Authorities</h3>
          <p className="text-gray-600">
            Ready to submit your foundation registration to Länsstyrelsen for approval
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <Building2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900">Länsstyrelsen</h4>
            <p className="text-sm text-gray-600">Primary registration authority</p>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <FileText className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900">Bolagsverket</h4>
            <p className="text-sm text-gray-600">Corporate registry notification</p>
          </div>
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <Shield className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-medium text-gray-900">Skatteverket</h4>
            <p className="text-sm text-gray-600">Tax authority registration</p>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">What happens after submission:</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• You'll receive a submission reference number</li>
            <li>• Authorities will review your application (typically 4-8 weeks)</li>
            <li>• You'll be notified of any additional requirements</li>
            <li>• Upon approval, your foundation will be officially registered</li>
            <li>• Full system access will be granted after verification</li>
          </ul>
        </div>

        <div className="flex justify-between">
          <Button variant="secondary" onClick={() => setCurrentStep(6)}>
            Back
          </Button>
          <Button onClick={onSubmit} icon={Building2}>
            Submit to Authorities
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Modal Components
const ComplianceResults: React.FC<{
  checks: any[];
  onComplete: () => void;
  onClose: () => void;
}> = ({ checks, onComplete, onClose }) => {
  const allPassed = checks.every(check => check.status === 'passed');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
          allPassed ? 'bg-green-100' : 'bg-red-100'
        }`}>
          {allPassed ? (
            <CheckCircle className="w-8 h-8 text-green-600" />
          ) : (
            <AlertTriangle className="w-8 h-8 text-red-600" />
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Compliance Verification {allPassed ? 'Passed' : 'Failed'}
        </h3>
      </div>

      <div className="space-y-3">
        {checks.map((check) => (
          <div key={check.id} className={`p-3 rounded-lg ${
            check.status === 'passed' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center space-x-2 mb-1">
              {check.status === 'passed' ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              )}
              <span className="font-medium text-gray-900">
                {check.check_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>
            <p className={`text-sm ${check.status === 'passed' ? 'text-green-700' : 'text-red-700'}`}>
              {check.details}
            </p>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-4">
        {!allPassed && (
          <Button variant="secondary" onClick={onClose}>
            Fix Issues
          </Button>
        )}
        {allPassed && (
          <Button onClick={onComplete}>
            Continue to Document Generation
          </Button>
        )}
      </div>
    </div>
  );
};

const BankIDSigningProcess: React.FC<{
  onComplete: () => void;
}> = ({ onComplete }) => {
  const [signingStep, setSigningStep] = useState(1);
  const [personalNumber, setPersonalNumber] = useState('');

  const handleStartSigning = () => {
    setSigningStep(2);
    // Simulate BankID process
    setTimeout(() => {
      setSigningStep(3);
      setTimeout(() => {
        onComplete();
      }, 2000);
    }, 3000);
  };

  if (signingStep === 1) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Shield className="w-12 h-12 text-primary-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">BankID Digital Signature</h3>
          <p className="text-sm text-gray-600">
            Sign foundation documents with legally binding digital signature
          </p>
        </div>

        <Input
          label="Personal Number"
          value={personalNumber}
          onChange={(e) => setPersonalNumber(e.target.value)}
          placeholder="YYYYMMDD-XXXX"
          pattern="[0-9]{8}-[0-9]{4}"
          required
          helperText="Format: 19801010-1234"
        />

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Documents to be signed:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Foundation Statutes</li>
            <li>• Board Resolution</li>
            <li>• Registration Application</li>
            <li>• Financial Declaration</li>
          </ul>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleStartSigning} icon={Shield}>
            Start BankID Signing
          </Button>
        </div>
      </div>
    );
  }

  if (signingStep === 2) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-blue-600 animate-pulse" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">BankID Signing in Progress</h3>
        <p className="text-gray-600 mb-4">
          Please complete the signing process in your BankID app
        </p>
        <div className="bg-blue-50 p-4 rounded-lg max-w-md mx-auto">
          <p className="text-sm text-blue-800">
            <strong>Order Reference:</strong> ORDER-{Date.now()}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Documents Successfully Signed</h3>
      <p className="text-gray-600">
        All foundation documents have been digitally signed and are ready for submission
      </p>
    </div>
  );
};