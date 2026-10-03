export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bank_accounts: {
        Row: {
          account_name: string
          account_number: string
          bank_code: string
          bank_name: string
          created_at: string
          id: string
          is_default: boolean
          is_verified: boolean
          user_id: string
        }
        Insert: {
          account_name: string
          account_number: string
          bank_code: string
          bank_name: string
          created_at?: string
          id?: string
          is_default?: boolean
          is_verified?: boolean
          user_id: string
        }
        Update: {
          account_name?: string
          account_number?: string
          bank_code?: string
          bank_name?: string
          created_at?: string
          id?: string
          is_default?: boolean
          is_verified?: boolean
          user_id?: string
        }
        Relationships: []
      }
      goal_members: {
        Row: {
          contribution_total: number
          goal_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          contribution_total?: number
          goal_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          contribution_total?: number
          goal_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_members_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "savings_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      interest_accruals: {
        Row: {
          amount: number
          base_amount: number
          created_at: string
          goal_id: string
          id: string
          paid_at: string | null
          period_end: string
          period_start: string
          rate: number
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          base_amount: number
          created_at?: string
          goal_id: string
          id?: string
          paid_at?: string | null
          period_end: string
          period_start: string
          rate: number
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          base_amount?: number
          created_at?: string
          goal_id?: string
          id?: string
          paid_at?: string | null
          period_end?: string
          period_start?: string
          rate?: number
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interest_accruals_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "savings_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_submissions: {
        Row: {
          bvn: string
          created_at: string
          date_of_birth: string
          full_name: string
          id: string
          id_document_path: string
          id_type: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          selfie_path: string
          status: string
          tier: number
          updated_at: string
          user_id: string
        }
        Insert: {
          bvn: string
          created_at?: string
          date_of_birth: string
          full_name: string
          id?: string
          id_document_path: string
          id_type: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          selfie_path: string
          status?: string
          tier?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          bvn?: string
          created_at?: string
          date_of_birth?: string
          full_name?: string
          id?: string
          id_document_path?: string
          id_type?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          selfie_path?: string
          status?: string
          tier?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bvn: string | null
          created_at: string
          full_name: string | null
          id: string
          kyc_level: number
          kyc_status: string
          last_save_date: string | null
          longest_streak: number
          phone_number: string | null
          streak_count: number
          two_factor_enabled: boolean
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bvn?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          kyc_level?: number
          kyc_status?: string
          last_save_date?: string | null
          longest_streak?: number
          phone_number?: string | null
          streak_count?: number
          two_factor_enabled?: boolean
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bvn?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          kyc_level?: number
          kyc_status?: string
          last_save_date?: string | null
          longest_streak?: number
          phone_number?: string | null
          streak_count?: number
          two_factor_enabled?: boolean
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      savings_goals: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string
          current_amount: number
          description: string | null
          due_date: string
          emoji: string
          id: string
          interest_earned: number
          interest_rate: number
          invite_code: string | null
          lock_until: string | null
          name: string
          penalty_rate: number
          pot_type: string
          status: string
          target_amount: number
          updated_at: string
          visibility: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by: string
          current_amount?: number
          description?: string | null
          due_date: string
          emoji?: string
          id?: string
          interest_earned?: number
          interest_rate?: number
          invite_code?: string | null
          lock_until?: string | null
          name: string
          penalty_rate?: number
          pot_type?: string
          status?: string
          target_amount: number
          updated_at?: string
          visibility?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string
          current_amount?: number
          description?: string | null
          due_date?: string
          emoji?: string
          id?: string
          interest_earned?: number
          interest_rate?: number
          invite_code?: string | null
          lock_until?: string | null
          name?: string
          penalty_rate?: number
          pot_type?: string
          status?: string
          target_amount?: number
          updated_at?: string
          visibility?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          currency: string
          description: string | null
          fee_amount: number
          gateway_ref: string | null
          gateway_response: Json | null
          goal_id: string | null
          id: string
          metadata: Json | null
          net_amount: number
          reference: string
          status: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
          wallet_id: string | null
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          fee_amount?: number
          gateway_ref?: string | null
          gateway_response?: Json | null
          goal_id?: string | null
          id?: string
          metadata?: Json | null
          net_amount: number
          reference: string
          status?: Database["public"]["Enums"]["transaction_status"]
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
          wallet_id?: string | null
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          fee_amount?: number
          gateway_ref?: string | null
          gateway_response?: Json | null
          goal_id?: string | null
          id?: string
          metadata?: Json | null
          net_amount?: number
          reference?: string
          status?: Database["public"]["Enums"]["transaction_status"]
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
          wallet_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "savings_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          currency: string
          daily_limit: number
          id: string
          monthly_limit: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          currency?: string
          daily_limit?: number
          id?: string
          monthly_limit?: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          currency?: string
          daily_limit?: number
          id?: string
          monthly_limit?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      break_pot: { Args: { _goal_id: string }; Returns: number }
      create_pot: {
        Args: {
          _due: string
          _emoji: string
          _lock_until?: string
          _name: string
          _pot_type?: string
          _target: number
          _visibility?: string
        }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_goal_member: {
        Args: { _goal_id: string; _user_id: string }
        Returns: boolean
      }
      join_pot: { Args: { _invite_code: string }; Returns: string }
      notify: {
        Args: { _body: string; _title: string; _type: string; _user_id: string }
        Returns: undefined
      }
      pot_withdraw: {
        Args: { _amount: number; _goal_id: string }
        Returns: number
      }
      quick_save: {
        Args: { _amount: number; _goal_id: string }
        Returns: number
      }
      review_kyc: {
        Args: { _approve: boolean; _notes?: string; _submission_id: string }
        Returns: undefined
      }
      run_savings_reminders: { Args: never; Returns: number }
      wallet_deposit: { Args: { _amount: number }; Returns: string }
      wallet_withdraw: {
        Args: { _amount: number; _bank_account_id: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "user"
      transaction_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "reversed"
      transaction_type:
        | "deposit"
        | "withdrawal"
        | "goal_contribution"
        | "goal_withdrawal"
        | "interest"
        | "refund"
        | "fee"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      transaction_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "reversed",
      ],
      transaction_type: [
        "deposit",
        "withdrawal",
        "goal_contribution",
        "goal_withdrawal",
        "interest",
        "refund",
        "fee",
      ],
    },
  },
} as const
