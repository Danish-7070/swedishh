/*
  # Create financial management tables

  1. New Tables
    - `accounts` - Chart of accounts for bookkeeping
    - `journal_entries` - Journal entries for double-entry bookkeeping
    - `journal_entry_lines` - Line items for journal entries
    - `invoices` - Sales and purchase invoices
    - `invoice_line_items` - Line items for invoices
    - `bank_accounts` - Bank account information
    - `bank_transactions` - Bank transaction records

  2. Security
    - Enable RLS on all financial tables
    - Add policies for foundation-based access control
*/

-- Chart of Accounts
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  foundation_id uuid NOT NULL REFERENCES foundations(id) ON DELETE CASCADE,
  account_number text NOT NULL,
  account_name text NOT NULL,
  account_type text NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  parent_account_id uuid REFERENCES accounts(id),
  balance numeric(15,2) DEFAULT 0,
  currency text DEFAULT 'SEK' NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(foundation_id, account_number)
);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Journal Entries
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  foundation_id uuid NOT NULL REFERENCES foundations(id) ON DELETE CASCADE,
  entry_number text NOT NULL,
  entry_date date NOT NULL,
  description text NOT NULL,
  reference_number text,
  total_debit numeric(15,2) NOT NULL DEFAULT 0,
  total_credit numeric(15,2) NOT NULL DEFAULT 0,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'reversed')),
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  approved_by uuid REFERENCES profiles(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(foundation_id, entry_number)
);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- Journal Entry Lines
CREATE TABLE IF NOT EXISTS journal_entry_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id uuid NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  description text,
  debit_amount numeric(15,2) DEFAULT 0 CHECK (debit_amount >= 0),
  credit_amount numeric(15,2) DEFAULT 0 CHECK (credit_amount >= 0),
  line_order integer NOT NULL,
  CHECK (debit_amount > 0 OR credit_amount > 0),
  CHECK (NOT (debit_amount > 0 AND credit_amount > 0))
);

ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  foundation_id uuid NOT NULL REFERENCES foundations(id) ON DELETE CASCADE,
  invoice_number text NOT NULL,
  invoice_type text NOT NULL CHECK (invoice_type IN ('sales', 'purchase')),
  customer_supplier_name text NOT NULL,
  invoice_date date NOT NULL,
  due_date date NOT NULL,
  subtotal numeric(15,2) NOT NULL DEFAULT 0,
  tax_amount numeric(15,2) NOT NULL DEFAULT 0,
  total_amount numeric(15,2) NOT NULL DEFAULT 0,
  currency text DEFAULT 'SEK' NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  payment_terms text DEFAULT 'Net 30',
  notes text,
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  approved_by uuid REFERENCES profiles(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(foundation_id, invoice_number)
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Invoice Line Items
CREATE TABLE IF NOT EXISTS invoice_line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity numeric(10,3) NOT NULL CHECK (quantity > 0),
  unit_price numeric(15,2) NOT NULL CHECK (unit_price >= 0),
  tax_rate numeric(5,2) DEFAULT 0 CHECK (tax_rate >= 0 AND tax_rate <= 100),
  line_total numeric(15,2) NOT NULL DEFAULT 0,
  line_order integer NOT NULL
);

ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;

-- Bank Accounts
CREATE TABLE IF NOT EXISTS bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  foundation_id uuid NOT NULL REFERENCES foundations(id) ON DELETE CASCADE,
  account_name text NOT NULL,
  bank_name text NOT NULL,
  account_number text NOT NULL,
  iban text,
  swift_code text,
  currency text DEFAULT 'SEK' NOT NULL,
  account_type text DEFAULT 'business' CHECK (account_type IN ('checking', 'savings', 'business')),
  current_balance numeric(15,2) DEFAULT 0,
  is_primary boolean DEFAULT false,
  is_active boolean DEFAULT true,
  last_sync_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- Bank Transactions
CREATE TABLE IF NOT EXISTS bank_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id uuid NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
  transaction_date date NOT NULL,
  description text NOT NULL,
  reference_number text,
  amount numeric(15,2) NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('debit', 'credit')),
  balance_after numeric(15,2) NOT NULL,
  category text,
  is_reconciled boolean DEFAULT false,
  journal_entry_id uuid REFERENCES journal_entries(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bank_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Accounts
CREATE POLICY "Foundation members can read accounts"
  ON accounts FOR SELECT TO authenticated
  USING (is_foundation_member(foundation_id) OR is_admin());

CREATE POLICY "Foundation owners can manage accounts"
  ON accounts FOR ALL TO authenticated
  USING (is_foundation_owner(foundation_id) OR is_admin())
  WITH CHECK (is_foundation_owner(foundation_id) OR is_admin());

-- RLS Policies for Journal Entries
CREATE POLICY "Foundation members can read journal entries"
  ON journal_entries FOR SELECT TO authenticated
  USING (is_foundation_member(foundation_id) OR is_admin());

CREATE POLICY "Foundation owners can manage journal entries"
  ON journal_entries FOR ALL TO authenticated
  USING (is_foundation_owner(foundation_id) OR is_admin())
  WITH CHECK (is_foundation_owner(foundation_id) OR is_admin());

-- RLS Policies for Journal Entry Lines
CREATE POLICY "Foundation members can read journal entry lines"
  ON journal_entry_lines FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM journal_entries je
      WHERE je.id = journal_entry_id AND (is_foundation_member(je.foundation_id) OR is_admin())
    )
  );

CREATE POLICY "Foundation owners can manage journal entry lines"
  ON journal_entry_lines FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM journal_entries je
      WHERE je.id = journal_entry_id AND (is_foundation_owner(je.foundation_id) OR is_admin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM journal_entries je
      WHERE je.id = journal_entry_id AND (is_foundation_owner(je.foundation_id) OR is_admin())
    )
  );

-- RLS Policies for Invoices
CREATE POLICY "Foundation members can read invoices"
  ON invoices FOR SELECT TO authenticated
  USING (is_foundation_member(foundation_id) OR is_admin());

CREATE POLICY "Foundation owners can manage invoices"
  ON invoices FOR ALL TO authenticated
  USING (is_foundation_owner(foundation_id) OR is_admin())
  WITH CHECK (is_foundation_owner(foundation_id) OR is_admin());

-- RLS Policies for Invoice Line Items
CREATE POLICY "Foundation members can read invoice line items"
  ON invoice_line_items FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices i
      WHERE i.id = invoice_id AND (is_foundation_member(i.foundation_id) OR is_admin())
    )
  );

CREATE POLICY "Foundation owners can manage invoice line items"
  ON invoice_line_items FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices i
      WHERE i.id = invoice_id AND (is_foundation_owner(i.foundation_id) OR is_admin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices i
      WHERE i.id = invoice_id AND (is_foundation_owner(i.foundation_id) OR is_admin())
    )
  );

-- RLS Policies for Bank Accounts
CREATE POLICY "Foundation members can read bank accounts"
  ON bank_accounts FOR SELECT TO authenticated
  USING (is_foundation_member(foundation_id) OR is_admin());

CREATE POLICY "Foundation owners can manage bank accounts"
  ON bank_accounts FOR ALL TO authenticated
  USING (is_foundation_owner(foundation_id) OR is_admin())
  WITH CHECK (is_foundation_owner(foundation_id) OR is_admin());

-- RLS Policies for Bank Transactions
CREATE POLICY "Foundation members can read bank transactions"
  ON bank_transactions FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bank_accounts ba
      WHERE ba.id = bank_account_id AND (is_foundation_member(ba.foundation_id) OR is_admin())
    )
  );

CREATE POLICY "Foundation owners can manage bank transactions"
  ON bank_transactions FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bank_accounts ba
      WHERE ba.id = bank_account_id AND (is_foundation_owner(ba.foundation_id) OR is_admin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bank_accounts ba
      WHERE ba.id = bank_account_id AND (is_foundation_owner(ba.foundation_id) OR is_admin())
    )
  );

-- Add triggers for updated_at
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bank_accounts_updated_at
  BEFORE UPDATE ON bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bank_transactions_updated_at
  BEFORE UPDATE ON bank_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate next entry number
CREATE OR REPLACE FUNCTION generate_entry_number(foundation_id uuid)
RETURNS text AS $$
DECLARE
  year_part text;
  sequence_part text;
BEGIN
  year_part := EXTRACT(YEAR FROM CURRENT_DATE)::text;
  
  SELECT LPAD((COUNT(*) + 1)::text, 6, '0') INTO sequence_part
  FROM journal_entries je
  WHERE je.foundation_id = $1 
    AND EXTRACT(YEAR FROM je.created_at) = EXTRACT(YEAR FROM CURRENT_DATE);
  
  RETURN 'JE-' || year_part || '-' || sequence_part;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate next invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number(foundation_id uuid, invoice_type text)
RETURNS text AS $$
DECLARE
  year_part text;
  sequence_part text;
  prefix text;
BEGIN
  year_part := EXTRACT(YEAR FROM CURRENT_DATE)::text;
  prefix := CASE WHEN invoice_type = 'sales' THEN 'INV' ELSE 'PI' END;
  
  SELECT LPAD((COUNT(*) + 1)::text, 6, '0') INTO sequence_part
  FROM invoices i
  WHERE i.foundation_id = $1 
    AND i.invoice_type = $2
    AND EXTRACT(YEAR FROM i.created_at) = EXTRACT(YEAR FROM CURRENT_DATE);
  
  RETURN prefix || '-' || year_part || '-' || sequence_part;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default chart of accounts for new foundations
CREATE OR REPLACE FUNCTION create_default_accounts(foundation_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO accounts (foundation_id, account_number, account_name, account_type, currency) VALUES
    (foundation_id, '1010', 'Cash', 'asset', 'SEK'),
    (foundation_id, '1020', 'Bank Account', 'asset', 'SEK'),
    (foundation_id, '1030', 'Accounts Receivable', 'asset', 'SEK'),
    (foundation_id, '1500', 'Equipment', 'asset', 'SEK'),
    (foundation_id, '2010', 'Accounts Payable', 'liability', 'SEK'),
    (foundation_id, '2020', 'Accrued Expenses', 'liability', 'SEK'),
    (foundation_id, '3010', 'Foundation Capital', 'equity', 'SEK'),
    (foundation_id, '3020', 'Retained Earnings', 'equity', 'SEK'),
    (foundation_id, '4010', 'Donation Revenue', 'revenue', 'SEK'),
    (foundation_id, '4020', 'Investment Income', 'revenue', 'SEK'),
    (foundation_id, '5010', 'Office Expenses', 'expense', 'SEK'),
    (foundation_id, '5020', 'Travel Expenses', 'expense', 'SEK'),
    (foundation_id, '5030', 'Professional Services', 'expense', 'SEK'),
    (foundation_id, '5040', 'Utilities', 'expense', 'SEK')
  ON CONFLICT (foundation_id, account_number) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default accounts when foundation is created
CREATE OR REPLACE FUNCTION create_foundation_accounts()
RETURNS trigger AS $$
BEGIN
  PERFORM create_default_accounts(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_foundation_created_accounts ON foundations;
CREATE TRIGGER on_foundation_created_accounts
  AFTER INSERT ON foundations
  FOR EACH ROW
  EXECUTE FUNCTION create_foundation_accounts();