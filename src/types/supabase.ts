export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audits: {
        Row: {
          action: string | null
          changes: Json | null
          created_at: string | null
          id: number
          target_entity: string | null
          target_id: number | null
          user_id: number | null
        }
        Insert: {
          action?: string | null
          changes?: Json | null
          created_at?: string | null
          id?: number
          target_entity?: string | null
          target_id?: number | null
          user_id?: number | null
        }
        Update: {
          action?: string | null
          changes?: Json | null
          created_at?: string | null
          id?: number
          target_entity?: string | null
          target_id?: number | null
          user_id?: number | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          avatar_url: string | null
          business_type: string | null
          company_size: string | null
          country: string | null
          created_at: string | null
          id: number
          industry: string | null
          name: string
          sales_owner_id: number | null
          total_revenue: number | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          business_type?: string | null
          company_size?: string | null
          country?: string | null
          created_at?: string | null
          id?: number
          industry?: string | null
          name: string
          sales_owner_id?: number | null
          total_revenue?: number | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          business_type?: string | null
          company_size?: string | null
          country?: string | null
          created_at?: string | null
          id?: number
          industry?: string | null
          name?: string
          sales_owner_id?: number | null
          total_revenue?: number | null
          website?: string | null
        }
        Relationships: []
      }
      company_notes: {
        Row: {
          company_id: number
          created_at: string | null
          created_by: number
          id: number
          note: string
          updated_at: string | null
        }
        Insert: {
          company_id: number
          created_at?: string | null
          created_by: number
          id?: number
          note: string
          updated_at?: string | null
        }
        Update: {
          company_id?: number
          created_at?: string | null
          created_by?: number
          id?: number
          note?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          avatar_url: string | null
          company_id: number | null
          created_at: string | null
          email: string | null
          id: number
          job_title: string | null
          name: string | null
          phone: string | null
          sales_owner_id: string | null
          status: string | null
          timezone: string | null
        }
        Insert: {
          avatar_url?: string | null
          company_id?: number | null
          created_at?: string | null
          email?: string | null
          id?: number
          job_title?: string | null
          name?: string | null
          phone?: string | null
          sales_owner_id?: string | null
          status?: string | null
          timezone?: string | null
        }
        Update: {
          avatar_url?: string | null
          company_id?: number | null
          created_at?: string | null
          email?: string | null
          id?: number
          job_title?: string | null
          name?: string | null
          phone?: string | null
          sales_owner_id?: string | null
          status?: string | null
          timezone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_sales_owner"
            columns: ["sales_owner_id"]
            isOneToOne: false
            referencedRelation: "sales_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_stages: {
        Row: {
          created_at: string | null
          id: number
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          title: string
        }
        Update: {
          created_at?: string | null
          id?: number
          title?: string
        }
        Relationships: []
      }
      deals: {
        Row: {
          close_date_day: number | null
          close_date_month: number | null
          close_date_year: number | null
          company_id: number | null
          created_at: string | null
          deal_contact_id: number | null
          deal_owner_id: string | null
          id: number
          notes: string | null
          stage_id: number | null
          title: string | null
          value: number
        }
        Insert: {
          close_date_day?: number | null
          close_date_month?: number | null
          close_date_year?: number | null
          company_id?: number | null
          created_at?: string | null
          deal_contact_id?: number | null
          deal_owner_id?: string | null
          id?: number
          notes?: string | null
          stage_id?: number | null
          title?: string | null
          value: number
        }
        Update: {
          close_date_day?: number | null
          close_date_month?: number | null
          close_date_year?: number | null
          company_id?: number | null
          created_at?: string | null
          deal_contact_id?: number | null
          deal_owner_id?: string | null
          id?: number
          notes?: string | null
          stage_id?: number | null
          title?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "deals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_deal_contact_id_fkey"
            columns: ["deal_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_deal_owner_id_fkey"
            columns: ["deal_owner_id"]
            isOneToOne: false
            referencedRelation: "sales_owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_deal_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "deal_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      deals_aggregate: {
        Row: {
          close_date_month: number
          close_date_year: number
          deal_stage_id: number
          id: number
          value: number
        }
        Insert: {
          close_date_month: number
          close_date_year: number
          deal_stage_id: number
          id?: number
          value: number
        }
        Update: {
          close_date_month?: number
          close_date_year?: number
          deal_stage_id?: number
          id?: number
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "deals_aggregate_deal_stage_id_fkey"
            columns: ["deal_stage_id"]
            isOneToOne: false
            referencedRelation: "deal_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_owners: {
        Row: {
          avatar_url: string | null
          id: string
          name: string
        }
        Insert: {
          avatar_url?: string | null
          id: string
          name: string
        }
        Update: {
          avatar_url?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      task_stages: {
        Row: {
          id: number
          title: string
        }
        Insert: {
          id?: number
          title: string
        }
        Update: {
          id?: number
          title?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          description: string | null
          id: number
          task_stage_id: number | null
          title: string
        }
        Insert: {
          description?: string | null
          id?: number
          task_stage_id?: number | null
          title: string
        }
        Update: {
          description?: string | null
          id?: number
          task_stage_id?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_task_stage_id_fkey"
            columns: ["task_stage_id"]
            isOneToOne: false
            referencedRelation: "task_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          id: number
          name: string | null
        }
        Insert: {
          avatar_url?: string | null
          id?: number
          name?: string | null
        }
        Update: {
          avatar_url?: string | null
          id?: number
          name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
