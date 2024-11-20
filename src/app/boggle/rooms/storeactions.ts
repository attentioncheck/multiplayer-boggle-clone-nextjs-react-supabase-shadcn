// 'use server'

// import { createClient } from '@/app/utils/supabase/server'
// import { GameAction } from '@/types/game'

// export async function broadcastGameAction(action: {
//   type: 'WORD_FOUND' | 'PLAYER_READY' | 'GAME_START' | 'GAME_END'
//   playerId: string
//   payload: {
//     roomId: string
//     word?: string
//     playerId?: string
//   }
// }) {
//   const supabase = await createClient()
//   await supabase.from('game_actions').insert(action)
// }

// export async function syncGameStateWithServer(roomId: string) {
//   const supabase = await createClient()
//   const { data, error } = await supabase
//     .from('game_rooms')
//     .select('*')
//     .eq('id', roomId)
//     .single()
    
//   if (error) throw error
//   return data
// } 