export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      finished_game_rooms: {
        Row: {
          cleanup_after: string | null
          finished_at: string | null
          room_id: string
        }
        Insert: {
          cleanup_after?: string | null
          finished_at?: string | null
          room_id: string
        }
        Update: {
          cleanup_after?: string | null
          finished_at?: string | null
          room_id?: string
        }
        Relationships: []
      }
      game_actions: {
        Row: {
          created_at: string
          id: string
          payload: Json | null
          player_id: string | null
          room_id: string | null
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          payload?: Json | null
          player_id?: string | null
          room_id?: string | null
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json | null
          player_id?: string | null
          room_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_actions_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "game_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      game_rooms: {
        Row: {
          created_at: string
          created_by: string
          current_scores: Json | null
          game_duration: number
          game_ended_at: string | null
          game_seed: string | null
          game_started_at: string | null
          host_name: string | null
          id: string
          max_players: number | null
          name: string
          player_count: number | null
          players: Json | null
          status: string
        }
        Insert: {
          created_at?: string
          created_by: string
          current_scores?: Json | null
          game_duration?: number
          game_ended_at?: string | null
          game_seed?: string | null
          game_started_at?: string | null
          host_name?: string | null
          id?: string
          max_players?: number | null
          name: string
          player_count?: number | null
          players?: Json | null
          status?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          current_scores?: Json | null
          game_duration?: number
          game_ended_at?: string | null
          game_seed?: string | null
          game_started_at?: string | null
          host_name?: string | null
          id?: string
          max_players?: number | null
          name?: string
          player_count?: number | null
          players?: Json | null
          status?: string
        }
        Relationships: []
      }
      highscores: {
        Row: {
          id: string
          score: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          id?: string
          score?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          id?: string
          score?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_all_players_ready: {
        Args: {
          p_room_id: string
        }
        Returns: undefined
      }
      join_room:
        | {
            Args: {
              p_room_id: string
              p_user_id: string
              p_max_players: number
            }
            Returns: Json
          }
        | {
            Args: {
              p_room_id: string
              p_user_id: string
              p_user_name: string
              p_max_players: number
            }
            Returns: Json
          }
      set_game_ready: {
        Args: {
          p_room_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      set_player_ready: {
        Args: {
          p_room_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      start_game: {
        Args: {
          p_room_id: string
          p_user_id: string
        }
        Returns: Json
      }
      submit_word: {
        Args: {
          p_room_id: string
          p_user_id: string
          p_word: string
        }
        Returns: Json
      }
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

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
