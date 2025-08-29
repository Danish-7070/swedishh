/*
  # Create default accounts function for new foundations

  1. Functions
    - `create_default_accounts()` - Creates BAS-compliant chart of accounts
    - `generate_entry_number()` - Generates sequential journal entry numbers
    - `generate_invoice_number()` - Generates sequential invoice numbers

  2. Triggers
    - Automatically create default accounts when foundation is created
*/

-- Function to create default BAS-compliant chart of accounts
CREATE OR REPLACE FUNCTION create_default_accounts(foundation_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO accounts (foundation_id, account_number, account_name, account_type, currency, balance) VALUES
    -- Assets (1000-1999)
    (foundation_id, '1010', 'Cash', 'asset', 'SEK', 0),
    (foundation_id, '1020', 'Bank Account - Operating', 'asset', 'SEK', 0),
    (foundation_id, '1030', 'Bank Account - Savings', 'asset', 'SEK', 0),
    (foundation_id, '1510', 'Accounts Receivable', 'asset', 'SEK', 0),
    (foundation_id, '1630', 'Prepaid Expenses', 'asset', 'SEK', 0),
    (foundation_id, '1810', 'Office Equipment', 'asset', 'SEK', 0),
    (foundation_id, '1820', 'Computer Equipment', 'asset', 'SEK', 0),
    
    -- Liabilities (2000-2999)
    (foundation_id, '2010', 'Accounts Payable', 'liability', 'SEK', 0),
    (foundation_id, '2020', 'Accrued Expenses', 'liability', 'SEK', 0),
    (foundation_id, '2030', 'VAT Payable', 'liability', 'SEK', 0),
    (foundation_id, '2040', 'Payroll Taxes Payable', 'liability', 'SEK', 0),
    
    -- Equity (3000-3999)
    (foundation_id, '3010', 'Foundation Capital', 'equity', 'SEK', 0),
    (foundation_id, '3020', 'Retained Earnings', 'equity', 'SEK', 0),
    (foundation_id, '3030', 'Current Year Earnings', 'equity', 'SEK', 0),
    
    -- Revenue (4000-4999)
    (foundation_id, '4010', 'Donation Revenue', 'revenue', 'SEK', 0),
    (foundation_id, '4020', 'Grant Revenue', 'revenue', 'SEK', 0),
    (foundation_id, '4030', 'Investment Income', 'revenue', 'SEK', 0),
    (foundation_id, '4040', 'Interest Income', 'revenue', 'SEK', 0),
    (foundation_id, '4050', 'Other Income', 'revenue', 'SEK', 0),
    
    -- Expenses (5000-8999)
    (foundation_id, '5010', 'Office Supplies', 'expense', 'SEK', 0),
    (foundation_id, '5020', 'Travel Expenses', 'expense', 'SEK', 0),
    (foundation_id, '5030', 'Meals and Entertainment', 'expense', 'SEK', 0),
    (foundation_id, '5040', 'Utilities', 'expense', 'SEK', 0),
    (foundation_id, '5050', 'Professional Services', 'expense', 'SEK', 0),
    (foundation_id, '5060', 'Marketing and Advertising', 'expense', 'SEK', 0),
    (foundation_id, '5070', 'Insurance', 'expense', 'SEK', 0),
    (foundation_id, '5080', 'Rent', 'expense', 'SEK', 0),
    (foundation_id, '6010', 'Salaries and Wages', 'expense', 'SEK', 0),
    (foundation_id, '6020', 'Payroll Taxes', 'expense', 'SEK', 0),
    (foundation_id, '6030', 'Employee Benefits', 'expense', 'SEK', 0),
    (foundation_id, '7010', 'Program Expenses', 'expense', 'SEK', 0),
    (foundation_id, '7020', 'Grant Disbursements', 'expense', 'SEK', 0),
    (foundation_id, '8010', 'Depreciation Expense', 'expense', 'SEK', 0),
    (foundation_id, '8020', 'Interest Expense', 'expense', 'SEK', 0),
    (foundation_id, '8030', 'Bank Fees', 'expense', 'SEK', 0)
  ON CONFLICT (foundation_id, account_number) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate sequential journal entry numbers
CREATE OR REPLACE FUNCTION generate_entry_number(foundation_id uuid)
RETURNS text AS $$
DECLARE
  year_part text;
  sequence_part text;
  next_sequence integer;
BEGIN
  year_part := EXTRACT(YEAR FROM CURRENT_DATE)::text;
  
  SELECT COALESCE(MAX(
    CASE 
      WHEN entry_number ~ ('^JE-' || year_part || '-[0-9]+$') 
      THEN CAST(SUBSTRING(entry_number FROM '^JE-' || year_part || '-([0-9]+)$') AS integer)
      ELSE 0 
    END
  ), 0) + 1 INTO next_sequence
  FROM journal_entries je
  WHERE je.foundation_id = $1;
  
  sequence_part := LPAD(next_sequence::text, 6, '0');
  
  RETURN 'JE-' || year_part || '-' || sequence_part;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate sequential invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number(foundation_id uuid, invoice_type text)
RETURNS text AS $$
DECLARE
  year_part text;
  sequence_part text;
  prefix text;
  next_sequence integer;
BEGIN
  year_part := EXTRACT(YEAR FROM CURRENT_DATE)::text;
  prefix := CASE WHEN invoice_type = 'sales' THEN 'INV' ELSE 'PI' END;
  
  SELECT COALESCE(MAX(
    CASE 
      WHEN invoice_number ~ ('^' || prefix || '-' || year_part || '-[0-9]+$') 
      THEN CAST(SUBSTRING(invoice_number FROM '^' || prefix || '-' || year_part || '-([0-9]+)$') AS integer)
      ELSE 0 
    END
  ), 0) + 1 INTO next_sequence
  FROM invoices i
  WHERE i.foundation_id = $1 AND i.invoice_type = $2;
  
  sequence_part := LPAD(next_sequence::text, 6, '0');
  
  RETURN prefix || '-' || year_part || '-' || sequence_part;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the foundation creation trigger to use the new function
CREATE OR REPLACE FUNCTION create_foundation_accounts()
RETURNS trigger AS $$
BEGIN
  PERFORM create_default_accounts(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_foundation_created_accounts ON foundations;
CREATE TRIGGER on_foundation_created_accounts
  AFTER INSERT ON foundations
  FOR EACH ROW
  EXECUTE FUNCTION create_foundation_accounts();