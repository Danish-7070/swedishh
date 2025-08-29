export class ValidationUtils {
  // Currency validation
  static validateCurrency(amount: string | number): { isValid: boolean; error?: string } {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numAmount)) {
      return { isValid: false, error: 'Amount must be a valid number' };
    }
    
    if (numAmount < 0) {
      return { isValid: false, error: 'Amount must be positive' };
    }
    
    if (numAmount > 999999999.99) {
      return { isValid: false, error: 'Amount is too large' };
    }
    
    // Check for more than 2 decimal places
    const decimalPlaces = (numAmount.toString().split('.')[1] || '').length;
    if (decimalPlaces > 2) {
      return { isValid: false, error: 'Amount cannot have more than 2 decimal places' };
    }
    
    return { isValid: true };
  }

  // Email validation
  static validateEmail(email: string): { isValid: boolean; error?: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email.trim()) {
      return { isValid: false, error: 'Email is required' };
    }
    
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }
    
    return { isValid: true };
  }

  // Swedish personal number validation
  static validateSwedishPersonalNumber(personalNumber: string): { isValid: boolean; error?: string } {
    const regex = /^(\d{8})-(\d{4})$/;
    
    if (!personalNumber.trim()) {
      return { isValid: false, error: 'Personal number is required' };
    }
    
    if (!regex.test(personalNumber)) {
      return { isValid: false, error: 'Personal number must be in format YYYYMMDD-XXXX' };
    }

    const [datePart] = personalNumber.split('-');
    if (!datePart) {
      return { isValid: false, error: 'Invalid personal number format' };
    }
    
    const year = parseInt(datePart.substring(0, 4));
    const month = parseInt(datePart.substring(4, 6));
    const day = parseInt(datePart.substring(6, 8));

    // Basic date validation
    if (month < 1 || month > 12) {
      return { isValid: false, error: 'Invalid month in personal number' };
    }
    if (day < 1 || day > 31) {
      return { isValid: false, error: 'Invalid day in personal number' };
    }
    if (year < 1900 || year > new Date().getFullYear()) {
      return { isValid: false, error: 'Invalid year in personal number' };
    }

    return { isValid: true };
  }

  // Phone number validation
  static validateSwedishPhone(phone: string): { isValid: boolean; error?: string } {
    const regex = /^\+46\s?[1-9]\d{1,2}\s?\d{3}\s?\d{2}\s?\d{2}$/;
    
    if (!phone.trim()) {
      return { isValid: false, error: 'Phone number is required' };
    }
    
    if (!regex.test(phone)) {
      return { isValid: false, error: 'Please enter a valid Swedish phone number (+46 format)' };
    }
    
    return { isValid: true };
  }

  // Date validation
  static validateDate(date: string): { isValid: boolean; error?: string } {
    if (!date.trim()) {
      return { isValid: false, error: 'Date is required' };
    }
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return { isValid: false, error: 'Please enter a valid date' };
    }
    
    return { isValid: true };
  }

  // Date range validation
  static validateDateRange(startDate: string, endDate: string): { isValid: boolean; error?: string } {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { isValid: false, error: 'Please enter valid dates' };
    }
    
    if (start > end) {
      return { isValid: false, error: 'Start date must be before end date' };
    }
    
    return { isValid: true };
  }

  // Required field validation
  static validateRequired(value: string, fieldName: string): { isValid: boolean; error?: string } {
    if (!value || !value.trim()) {
      return { isValid: false, error: `${fieldName} is required` };
    }
    
    return { isValid: true };
  }

  // Foundation name validation
  static validateFoundationName(name: string): { isValid: boolean; error?: string } {
    if (!name.trim()) {
      return { isValid: false, error: 'Foundation name is required' };
    }
    
    if (name.trim().length < 2) {
      return { isValid: false, error: 'Foundation name must be at least 2 characters' };
    }
    
    if (name.trim().length > 100) {
      return { isValid: false, error: 'Foundation name cannot exceed 100 characters' };
    }
    
    return { isValid: true };
  }

  // Password validation
  static validatePassword(password: string): { isValid: boolean; error?: string } {
    if (!password) {
      return { isValid: false, error: 'Password is required' };
    }
    
    if (password.length < 6) {
      return { isValid: false, error: 'Password must be at least 6 characters' };
    }
    
    return { isValid: true };
  }

  // Account number validation
  static validateAccountNumber(accountNumber: string): { isValid: boolean; error?: string } {
    if (!accountNumber.trim()) {
      return { isValid: false, error: 'Account number is required' };
    }
    
    if (!/^\d{4}$/.test(accountNumber)) {
      return { isValid: false, error: 'Account number must be 4 digits' };
    }
    
    return { isValid: true };
  }

  // Journal entry validation
  static validateJournalEntry(lineItems: any[]): { isValid: boolean; error?: string } {
    if (!lineItems || lineItems.length < 2) {
      return { isValid: false, error: 'Journal entry must have at least 2 line items' };
    }
    
    const totalDebits = lineItems.reduce((sum, item) => sum + (item.debit_amount || 0), 0);
    const totalCredits = lineItems.reduce((sum, item) => sum + (item.credit_amount || 0), 0);
    
    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      return { isValid: false, error: 'Debits must equal credits' };
    }
    
    // Check that each line has either debit or credit (not both, not neither)
    for (const item of lineItems) {
      const hasDebit = (item.debit_amount || 0) > 0;
      const hasCredit = (item.credit_amount || 0) > 0;
      
      if (hasDebit && hasCredit) {
        return { isValid: false, error: 'Each line item must have either debit OR credit, not both' };
      }
      
      if (!hasDebit && !hasCredit) {
        return { isValid: false, error: 'Each line item must have either debit or credit amount' };
      }
      
      if (!item.account_id) {
        return { isValid: false, error: 'All line items must have an account selected' };
      }
    }
    
    return { isValid: true };
  }

  // Format currency for display
  static formatCurrency(amount: number, currency: string = 'SEK'): string {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  // Format number for input
  static formatNumberInput(value: number): string {
    return value.toFixed(2);
  }

  // Parse currency input
  static parseCurrencyInput(value: string): number {
    // Remove any non-numeric characters except decimal point
    const cleaned = value.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
}