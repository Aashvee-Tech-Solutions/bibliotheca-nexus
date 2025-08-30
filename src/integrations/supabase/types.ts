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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      authors: {
        Row: {
          bio: string | null
          books_published: number | null
          created_at: string
          featured: boolean | null
          id: string
          name: string
          profile_image_url: string | null
          social_links: Json | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bio?: string | null
          books_published?: number | null
          created_at?: string
          featured?: boolean | null
          id?: string
          name: string
          profile_image_url?: string | null
          social_links?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bio?: string | null
          books_published?: number | null
          created_at?: string
          featured?: boolean | null
          id?: string
          name?: string
          profile_image_url?: string | null
          social_links?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      authorship_purchases: {
        Row: {
          bio: string | null
          coupon_code: string | null
          created_at: string
          discount_amount: number | null
          id: string
          payment_details: Json | null
          payment_id: string | null
          payment_status: string
          phone_number: string | null
          positions_purchased: number
          profile_image_url: string | null
          total_amount: number
          upcoming_book_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          coupon_code?: string | null
          created_at?: string
          discount_amount?: number | null
          id?: string
          payment_details?: Json | null
          payment_id?: string | null
          payment_status?: string
          phone_number?: string | null
          positions_purchased?: number
          profile_image_url?: string | null
          total_amount: number
          upcoming_book_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          coupon_code?: string | null
          created_at?: string
          discount_amount?: number | null
          id?: string
          payment_details?: Json | null
          payment_id?: string | null
          payment_status?: string
          phone_number?: string | null
          positions_purchased?: number
          profile_image_url?: string | null
          total_amount?: number
          upcoming_book_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "authorship_purchases_upcoming_book_id_fkey"
            columns: ["upcoming_book_id"]
            isOneToOne: false
            referencedRelation: "upcoming_books"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          author_name: string
          cover_image_url: string | null
          created_at: string
          description: string | null
          genre: string | null
          id: string
          isbn: string | null
          language: string | null
          manuscript_id: string | null
          pages: number | null
          price: number | null
          publication_date: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_name: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          genre?: string | null
          id?: string
          isbn?: string | null
          language?: string | null
          manuscript_id?: string | null
          pages?: number | null
          price?: number | null
          publication_date?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          genre?: string | null
          id?: string
          isbn?: string | null
          language?: string | null
          manuscript_id?: string | null
          pages?: number | null
          price?: number | null
          publication_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "books_manuscript_id_fkey"
            columns: ["manuscript_id"]
            isOneToOne: false
            referencedRelation: "manuscripts"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_codes: {
        Row: {
          code: string
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          updated_at: string
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          updated_at?: string
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          updated_at?: string
          used_count?: number
        }
        Relationships: []
      }
      manuscripts: {
        Row: {
          admin_notes: string | null
          created_at: string
          genre: string | null
          id: string
          manuscript_file_url: string | null
          plagiarism_report_url: string | null
          plagiarism_score: number | null
          reviewed_at: string | null
          sample_pages_url: string | null
          status: string | null
          submitted_at: string
          synopsis: string | null
          title: string
          updated_at: string
          user_id: string
          word_count: number | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          genre?: string | null
          id?: string
          manuscript_file_url?: string | null
          plagiarism_report_url?: string | null
          plagiarism_score?: number | null
          reviewed_at?: string | null
          sample_pages_url?: string | null
          status?: string | null
          submitted_at?: string
          synopsis?: string | null
          title: string
          updated_at?: string
          user_id: string
          word_count?: number | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          genre?: string | null
          id?: string
          manuscript_file_url?: string | null
          plagiarism_report_url?: string | null
          plagiarism_score?: number | null
          reviewed_at?: string | null
          sample_pages_url?: string | null
          status?: string | null
          submitted_at?: string
          synopsis?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          word_count?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      upcoming_books: {
        Row: {
          available_positions: number
          copy_allocation: Json | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          genre: string | null
          id: string
          price_per_position: number
          publication_date: string | null
          status: string
          title: string
          total_author_positions: number
          updated_at: string
        }
        Insert: {
          available_positions?: number
          copy_allocation?: Json | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          genre?: string | null
          id?: string
          price_per_position: number
          publication_date?: string | null
          status?: string
          title: string
          total_author_positions?: number
          updated_at?: string
        }
        Update: {
          available_positions?: number
          copy_allocation?: Json | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          genre?: string | null
          id?: string
          price_per_position?: number
          publication_date?: string | null
          status?: string
          title?: string
          total_author_positions?: number
          updated_at?: string
        }
        Relationships: []
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
          role?: Database["public"]["Enums"]["app_role"]
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
    }
    Enums: {
      app_role: "admin" | "author" | "user"
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
      app_role: ["admin", "author", "user"],
    },
  },
} as const
