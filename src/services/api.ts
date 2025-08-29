import { supabase } from './supabase';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

// Auth API
export const authAPI = {
  async login(email: string, password: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user || !data.session) {
        return { success: false, error: 'Login failed' };
      }

      // Get user profile with role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles(
            role_id,
            roles(name, description)
          )
        `)
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        return { success: false, error: 'User profile not found' };
      }

      const userRoles = profile.user_roles || [];
      const primaryRole = userRoles.length > 0 ? userRoles[0].roles.name : profile.role || 'member';

      return {
        success: true,
        data: {
          user: {
            id: data.user.id,
            email: data.user.email,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            role: primaryRole,
            roles: userRoles.map((ur: any) => ur.roles.name)
          },
          session: {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at
          }
        }
      };
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  },

  async register(email: string, password: string, fullName: string): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    }
  },

  async logout(): Promise<ApiResponse> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Logout failed' };
    }
  }
};

// Profile API
export const profileAPI = {
  async getCurrentProfile(): Promise<ApiResponse<any>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to fetch profile' };
    }
  },

  async updateProfile(updates: any): Promise<ApiResponse<any>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to update profile' };
    }
  }
};

// Foundation API
export const foundationAPI = {
  async getFoundations(): Promise<ApiResponse<any[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const { data, error } = await supabase
        .from('foundations')
        .select(`
          *,
          foundation_members!inner(role, permissions)
        `)
        .eq('foundation_members.user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: 'Failed to fetch foundations' };
    }
  },

  async createFoundation(foundationData: any): Promise<ApiResponse<any>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const { data, error } = await supabase
        .from('foundations')
        .insert({
          ...foundationData,
          owner_user_id: user.id,
          status: 'pending_verification',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to create foundation' };
    }
  },

  async updateFoundation(id: string, updates: any): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('foundations')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to update foundation' };
    }
  }
};

// Financial API
export const financialAPI = {
  // Accounts
  async getAccounts(foundationId?: string): Promise<ApiResponse<any[]>> {
    try {
      let query = supabase
        .from('accounts')
        .select('*')
        .order('account_number', { ascending: true });

      if (foundationId) {
        query = query.eq('foundation_id', foundationId);
      }

      const { data, error } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: 'Failed to fetch accounts' };
    }
  },

  async createAccount(accountData: any): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          ...accountData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to create account' };
    }
  },

  async updateAccount(id: string, updates: any): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to update account' };
    }
  },

  async deleteAccount(id: string): Promise<ApiResponse> {
    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete account' };
    }
  },

  // Journal Entries
  async getJournalEntries(foundationId?: string): Promise<ApiResponse<any[]>> {
    try {
      let query = supabase
        .from('journal_entries')
        .select(`
          *,
          journal_entry_lines(
            *,
            accounts(account_name)
          )
        `)
        .order('entry_date', { ascending: false });

      if (foundationId) {
        query = query.eq('foundation_id', foundationId);
      }

      const { data, error } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: 'Failed to fetch journal entries' };
    }
  },

  async createJournalEntry(entryData: any): Promise<ApiResponse<any>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      // Generate entry number
      const { data: entryNumber } = await supabase.rpc('generate_entry_number', {
        foundation_id: entryData.foundation_id
      });

      // Calculate totals
      const totalDebit = entryData.line_items.reduce((sum: number, item: any) => sum + (item.debit_amount || 0), 0);
      const totalCredit = entryData.line_items.reduce((sum: number, item: any) => sum + (item.credit_amount || 0), 0);

      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        return { success: false, error: 'Journal entry must be balanced (debits must equal credits)' };
      }

      // Create journal entry
      const { data: entry, error: entryError } = await supabase
        .from('journal_entries')
        .insert({
          foundation_id: entryData.foundation_id,
          entry_number: entryNumber || `JE-${Date.now()}`,
          entry_date: entryData.entry_date,
          description: entryData.description,
          total_debit: totalDebit,
          total_credit: totalCredit,
          status: 'draft',
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (entryError) {
        return { success: false, error: entryError.message };
      }

      // Create line items
      const lineItemsWithEntryId = entryData.line_items.map((item: any, index: number) => ({
        journal_entry_id: entry.id,
        account_id: item.account_id,
        description: item.description,
        debit_amount: item.debit_amount || 0,
        credit_amount: item.credit_amount || 0,
        line_order: index + 1
      }));

      const { error: lineItemsError } = await supabase
        .from('journal_entry_lines')
        .insert(lineItemsWithEntryId);

      if (lineItemsError) {
        // Clean up entry if line items fail
        await supabase.from('journal_entries').delete().eq('id', entry.id);
        return { success: false, error: lineItemsError.message };
      }

      return { success: true, data: entry };
    } catch (error) {
      return { success: false, error: 'Failed to create journal entry' };
    }
  },

  async updateJournalEntry(id: string, updates: any): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to update journal entry' };
    }
  }
};

// Expense API
export const expenseAPI = {
  async getExpenses(foundationId?: string): Promise<ApiResponse<any[]>> {
    try {
      let query = supabase
        .from('expenses')
        .select(`
          *,
          foundations(name),
          profiles!expenses_user_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (foundationId) {
        query = query.eq('foundation_id', foundationId);
      }

      const { data, error } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: 'Failed to fetch expenses' };
    }
  },

  async createExpense(expenseData: any): Promise<ApiResponse<any>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const { data, error } = await supabase
        .from('expenses')
        .insert({
          ...expenseData,
          user_id: user.id,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to create expense' };
    }
  },

  async updateExpense(id: string, updates: any): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to update expense' };
    }
  },

  async deleteExpense(id: string): Promise<ApiResponse> {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete expense' };
    }
  }
};

// Meeting API
export const meetingAPI = {
  async getMeetings(foundationId?: string): Promise<ApiResponse<any[]>> {
    try {
      let query = supabase
        .from('meetings')
        .select(`
          *,
          foundations(name),
          profiles!meetings_organizer_id_fkey(full_name, email)
        `)
        .order('start_time', { ascending: false });

      if (foundationId) {
        query = query.eq('foundation_id', foundationId);
      }

      const { data, error } = await query;

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      return { success: false, error: 'Failed to fetch meetings' };
    }
  },

  async createMeeting(meetingData: any): Promise<ApiResponse<any>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const { data, error } = await supabase
        .from('meetings')
        .insert({
          ...meetingData,
          organizer_id: user.id,
          status: 'scheduled',
          attendees: meetingData.attendees || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: 'Failed to create meeting' };
    }
  }
};