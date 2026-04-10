export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type ProfileRole = "author" | "reader" | "curator";
export type WorkVisibility = "public" | "private";
export type WorkStatus = "draft" | "published" | "archived";
export type RequestStatus = "pending" | "approved" | "denied";

export interface Database {
  public: {
    Tables: {
      desktop_clients: {
        Row: {
          created_at: string;
          device_name: string;
          id: string;
          last_heartbeat_at: string | null;
          online_status: "offline" | "online";
          platform: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          device_name: string;
          id?: string;
          last_heartbeat_at?: string | null;
          online_status?: "offline" | "online";
          platform: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          device_name?: string;
          id?: string;
          last_heartbeat_at?: string | null;
          online_status?: "offline" | "online";
          platform?: string;
          user_id?: string;
        };
        Relationships: [];
      };
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
      work_files: {
        Row: {
          availability_status: "unlinked" | "linked" | "ready_later";
          created_at: string;
          desktop_client_id: string;
          file_fingerprint: string;
          file_size: number;
          id: string;
          last_seen_at: string | null;
          local_file_name: string;
          mime_type: string;
          work_id: string;
        };
        Insert: {
          availability_status?: "unlinked" | "linked" | "ready_later";
          created_at?: string;
          desktop_client_id: string;
          file_fingerprint: string;
          file_size: number;
          id?: string;
          last_seen_at?: string | null;
          local_file_name: string;
          mime_type: string;
          work_id: string;
        };
        Update: {
          availability_status?: "unlinked" | "linked" | "ready_later";
          created_at?: string;
          desktop_client_id?: string;
          file_fingerprint?: string;
          file_size?: number;
          id?: string;
          last_seen_at?: string | null;
          local_file_name?: string;
          mime_type?: string;
          work_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "work_files_desktop_client_id_fkey";
            columns: ["desktop_client_id"];
            isOneToOne: false;
            referencedRelation: "desktop_clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "work_files_work_id_fkey";
            columns: ["work_id"];
            isOneToOne: false;
            referencedRelation: "works";
            referencedColumns: ["id"];
          }
        ];
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
export type DesktopClientRow = Database["public"]["Tables"]["desktop_clients"]["Row"];
export type WorkFileRow = Database["public"]["Tables"]["work_files"]["Row"];
