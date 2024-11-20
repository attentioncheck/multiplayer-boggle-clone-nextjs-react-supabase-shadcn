import { createClient } from '@/app/utils/supabase/server'
import { customError } from '@/lib/errors'
import { GameRoom } from '@/types/types'


export async function getRoom(roomId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('game_rooms')
    .select('*')
    .eq('id', roomId)
    .single()

  if (error) throw customError('Failed to fetch room', 'DB_ERROR', error)
  return data as GameRoom
}

export async function updateRoom(roomId: string, updates: Partial<GameRoom>) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('game_rooms')
    .update(updates)
    .eq('id', roomId)

  if (error) throw customError('Failed to update room', 'DB_ERROR', error)
  return true
}

export async function deleteRoom(roomId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('game_rooms')
    .delete()
    .eq('id', roomId)

  if (error) throw customError('Failed to delete room', 'DB_ERROR', error)
  return true
} 