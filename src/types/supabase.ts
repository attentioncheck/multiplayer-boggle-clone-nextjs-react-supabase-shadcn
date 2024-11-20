export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      game_rooms: {
        Row: {
          id: string
          created_at: string
          created_by: string
          current_scores: Json | null
          game_duration: number
          game_ended_at: string | null
          game_seed: string | null
          game_started_at: string | null
          host_name: string | null
          name: string
          max_players: number | null
          player_count: number | null
          players: Json | null
          status: 'waiting' | 'playing' | 'finished'
        }
      }
      game_actions: {
        Row: {
          id: string
          created_at: string
          player_id: string | null
          room_id: string | null
          type: string
          payload: Json | null
        }
      }
      finished_game_rooms: {
        Row: {
          room_id: string
          finished_at: string | null
          cleanup_after: string | null
        }
      }
    }
  }
} 