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
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          category_id: string | null
          created_at: string
          event_type: string
          id: string
          metadata: Json
          product_id: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json
          product_id?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          display_order: number
          id: string
          name: string
          slug: string
          status: string
          subtitle: string | null
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          name: string
          slug: string
          status?: string
          subtitle?: string | null
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          name?: string
          slug?: string
          status?: string
          subtitle?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          city: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          last_contacted_at: string | null
          phone: string | null
          state: string | null
          status: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          last_contacted_at?: string | null
          phone?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          last_contacted_at?: string | null
          phone?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      enquiries: {
        Row: {
          admin_notes: string | null
          area_sqft: number | null
          city: string | null
          created_at: string
          customer_id: string | null
          email: string | null
          estimated_price_max: number | null
          estimated_price_min: number | null
          finish_id: string | null
          full_name: string
          height_ft: number | null
          id: string
          installation_required: boolean
          is_read: boolean
          material_id: string | null
          message: string | null
          phone: string
          product_id: string | null
          size_preset: string | null
          state: string | null
          status: string
          updated_at: string
          wall_image_url: string | null
          whatsapp: string | null
          width_ft: number | null
        }
        Insert: {
          admin_notes?: string | null
          area_sqft?: number | null
          city?: string | null
          created_at?: string
          customer_id?: string | null
          email?: string | null
          estimated_price_max?: number | null
          estimated_price_min?: number | null
          finish_id?: string | null
          full_name: string
          height_ft?: number | null
          id?: string
          installation_required?: boolean
          is_read?: boolean
          material_id?: string | null
          message?: string | null
          phone: string
          product_id?: string | null
          size_preset?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          wall_image_url?: string | null
          whatsapp?: string | null
          width_ft?: number | null
        }
        Update: {
          admin_notes?: string | null
          area_sqft?: number | null
          city?: string | null
          created_at?: string
          customer_id?: string | null
          email?: string | null
          estimated_price_max?: number | null
          estimated_price_min?: number | null
          finish_id?: string | null
          full_name?: string
          height_ft?: number | null
          id?: string
          installation_required?: boolean
          is_read?: boolean
          material_id?: string | null
          message?: string | null
          phone?: string
          product_id?: string | null
          size_preset?: string | null
          state?: string | null
          status?: string
          updated_at?: string
          wall_image_url?: string | null
          whatsapp?: string | null
          width_ft?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "enquiries_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enquiries_finish_id_fkey"
            columns: ["finish_id"]
            isOneToOne: false
            referencedRelation: "finishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enquiries_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enquiries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      finishes: {
        Row: {
          additional_cost: number
          cost_type: string
          created_at: string
          description: string | null
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          additional_cost?: number
          cost_type?: string
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          additional_cost?: number
          cost_type?: string
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      installations: {
        Row: {
          after_image_url: string | null
          before_image_url: string | null
          city: string | null
          created_at: string
          final_image_url: string | null
          finish_label: string | null
          id: string
          installed_on: string | null
          is_featured: boolean
          material_label: string | null
          product_id: string | null
          project_name: string
          size_label: string | null
          status: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          after_image_url?: string | null
          before_image_url?: string | null
          city?: string | null
          created_at?: string
          final_image_url?: string | null
          finish_label?: string | null
          id?: string
          installed_on?: string | null
          is_featured?: boolean
          material_label?: string | null
          product_id?: string | null
          project_name: string
          size_label?: string | null
          status?: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          after_image_url?: string | null
          before_image_url?: string | null
          city?: string | null
          created_at?: string
          final_image_url?: string | null
          finish_label?: string | null
          id?: string
          installed_on?: string | null
          is_featured?: boolean
          material_label?: string | null
          product_id?: string | null
          project_name?: string
          size_label?: string | null
          status?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "installations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          base_rate: number
          created_at: string
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          long_description: string | null
          name: string
          pricing_unit: string
          short_description: string | null
          slug: string
          suitable_for: string | null
          thickness_options: string | null
          updated_at: string
        }
        Insert: {
          base_rate?: number
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          long_description?: string | null
          name: string
          pricing_unit?: string
          short_description?: string | null
          slug: string
          suitable_for?: string | null
          thickness_options?: string | null
          updated_at?: string
        }
        Update: {
          base_rate?: number
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          long_description?: string | null
          name?: string
          pricing_unit?: string
          short_description?: string | null
          slug?: string
          suitable_for?: string | null
          thickness_options?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      media: {
        Row: {
          created_at: string
          id: string
          media_type: string
          product_id: string | null
          source_type: string
          title: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_type?: string
          product_id?: string | null
          source_type?: string
          title?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          media_type?: string
          product_id?: string | null
          source_type?: string
          title?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_id: string | null
          enquiry_id: string | null
          id: string
          notes: string | null
          order_value: number | null
          product_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          enquiry_id?: string | null
          id?: string
          notes?: string | null
          order_value?: number | null
          product_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          enquiry_id?: string | null
          id?: string
          notes?: string | null
          order_value?: number | null
          product_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_enquiry_id_fkey"
            columns: ["enquiry_id"]
            isOneToOne: false
            referencedRelation: "enquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_rules: {
        Row: {
          base_price: number
          complexity_multiplier: number
          created_at: string
          delivery_cost: number
          id: string
          installation_cost: number
          is_active: boolean
          material_id: string | null
          minimum_price: number
          name: string
          painting_cost_per_sqft: number
          product_id: string | null
          range_margin_pct: number
          size_multiplier: number
          thickness_cost: number
          updated_at: string
        }
        Insert: {
          base_price?: number
          complexity_multiplier?: number
          created_at?: string
          delivery_cost?: number
          id?: string
          installation_cost?: number
          is_active?: boolean
          material_id?: string | null
          minimum_price?: number
          name: string
          painting_cost_per_sqft?: number
          product_id?: string | null
          range_margin_pct?: number
          size_multiplier?: number
          thickness_cost?: number
          updated_at?: string
        }
        Update: {
          base_price?: number
          complexity_multiplier?: number
          created_at?: string
          delivery_cost?: number
          id?: string
          installation_cost?: number
          is_active?: boolean
          material_id?: string | null
          minimum_price?: number
          name?: string
          painting_cost_per_sqft?: number
          product_id?: string | null
          range_margin_pct?: number
          size_multiplier?: number
          thickness_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_rules_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_rules_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_finishes: {
        Row: {
          cost_override: number | null
          finish_id: string
          id: string
          product_id: string
        }
        Insert: {
          cost_override?: number | null
          finish_id: string
          id?: string
          product_id: string
        }
        Update: {
          cost_override?: number | null
          finish_id?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_finishes_finish_id_fkey"
            columns: ["finish_id"]
            isOneToOne: false
            referencedRelation: "finishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_finishes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          caption: string | null
          created_at: string
          display_order: number
          id: string
          image_kind: string
          image_url: string
          product_id: string
          source_type: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_kind?: string
          image_url: string
          product_id: string
          source_type?: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_kind?: string
          image_url?: string
          product_id?: string
          source_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_materials: {
        Row: {
          id: string
          material_id: string
          product_id: string
          rate_override: number | null
          recommended_thickness: string | null
        }
        Insert: {
          id?: string
          material_id: string
          product_id: string
          rate_override?: number | null
          recommended_thickness?: string | null
        }
        Update: {
          id?: string
          material_id?: string
          product_id?: string
          rate_override?: number | null
          recommended_thickness?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_materials_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_materials_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          ai_visualization_url: string | null
          category_id: string | null
          closeup_url: string | null
          compare_at_price: number | null
          created_at: string
          display_order: number
          id: string
          installation_image_url: string | null
          is_featured: boolean
          long_description: string | null
          main_image_url: string | null
          name: string
          pricing_mode: string
          short_description: string | null
          side_view_url: string | null
          slug: string
          starting_price: number
          status: string
          suitable_for: string[]
          updated_at: string
          video_url: string | null
          view_count: number
        }
        Insert: {
          ai_visualization_url?: string | null
          category_id?: string | null
          closeup_url?: string | null
          compare_at_price?: number | null
          created_at?: string
          display_order?: number
          id?: string
          installation_image_url?: string | null
          is_featured?: boolean
          long_description?: string | null
          main_image_url?: string | null
          name: string
          pricing_mode?: string
          short_description?: string | null
          side_view_url?: string | null
          slug: string
          starting_price?: number
          status?: string
          suitable_for?: string[]
          updated_at?: string
          video_url?: string | null
          view_count?: number
        }
        Update: {
          ai_visualization_url?: string | null
          category_id?: string | null
          closeup_url?: string | null
          compare_at_price?: number | null
          created_at?: string
          display_order?: number
          id?: string
          installation_image_url?: string | null
          is_featured?: boolean
          long_description?: string | null
          main_image_url?: string | null
          name?: string
          pricing_mode?: string
          short_description?: string | null
          side_view_url?: string | null
          slug?: string
          starting_price?: number
          status?: string
          suitable_for?: string[]
          updated_at?: string
          video_url?: string | null
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
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
      website_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "editor" | "user"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["admin", "editor", "user"],
    },
  },
} as const
