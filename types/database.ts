export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ProfileRole = "author" | "reader" | "curator";
export type WorkVisibility = "public" | "private";
export type WorkStatus = "draft" | "published" | "archived";
export type RequestStatus = "pending" | "approved" | "denied";

export interface Database {
  public: {
    Tables: {
      featured_slots: {
        Row: {
          curator_notes: string | null;
          end_at: string | null;
          id: string;
          slot_type: string;
          start_at: string | null;
          work_id: string;
        };
        Insert: {
          curator_notes?: string | null;
          end_at?: string | null;
          id?: string;
          slot_type: string;
          start_at?: string | null;
          work_id: string;
        };
        Update: {
          curator_notes?: string | null;
          end_at?: string | null;
          id?: string;
          slot_type?: string;
          start_at?: string | null;
          work_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "featured_slots_work_id_fkey";
            columns: ["work_id"];
            isOneToOne: false;
            referencedRelation: "works";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          display_name: string | null;
          id: string;
          role: ProfileRole;
          user_id: string;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          role?: ProfileRole;
          user_id: string;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          display_name?: string | null;
          id?: string;
          role?: ProfileRole;
          user_id?: string;
        };
        Relationships: [];
      };
      requests: {
        Row: {
          author_id: string;
          created_at: string;
          id: string;
          message: string | null;
          reader_id: string;
          response_message: string | null;
          status: RequestStatus;
          updated_at: string;
          work_id: string;
        };
        Insert: {
          author_id: string;
          created_at?: string;
          id?: string;
          message?: string | null;
          reader_id: string;
          response_message?: string | null;
          status?: RequestStatus;
          updated_at?: string;
          work_id: string;
        };
        Update: {
          author_id?: string;
          created_at?: string;
          id?: string;
          message?: string | null;
          reader_id?: string;
          response_message?: string | null;
          status?: RequestStatus;
          updated_at?: string;
          work_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "requests_work_id_fkey";
            columns: ["work_id"];
            isOneToOne: false;
            referencedRelation: "works";
            referencedColumns: ["id"];
          },
        ];
      };
      works: {
        Row: {
          author_id: string;
          cover_image_url: string | null;
          created_at: string;
          description: string;
          excerpt_text: string;
          featured_flag: boolean;
          genre: string;
          id: string;
          status: WorkStatus;
          tags: string[];
          title: string;
          updated_at: string;
          visibility: WorkVisibility;
        };
        Insert: {
          author_id: string;
          cover_image_url?: string | null;
          created_at?: string;
          description: string;
          excerpt_text: string;
          featured_flag?: boolean;
          genre: string;
          id?: string;
          status?: WorkStatus;
          tags?: string[];
          title: string;
          updated_at?: string;
          visibility?: WorkVisibility;
        };
        Update: {
          author_id?: string;
          cover_image_url?: string | null;
          created_at?: string;
          description?: string;
          excerpt_text?: string;
          featured_flag?: boolean;
          genre?: string;
          id?: string;
          status?: WorkStatus;
          tags?: string[];
          title?: string;
          updated_at?: string;
          visibility?: WorkVisibility;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type WorkRow = Database["public"]["Tables"]["works"]["Row"];
export type RequestRow = Database["public"]["Tables"]["requests"]["Row"];
export type FeaturedSlotRow = Database["public"]["Tables"]["featured_slots"]["Row"];
