import { createClient } from '@/app/utils/supabase/server'
import { customError } from '@/lib/errors'

export async function setPlayerReady(roomId: string, userId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.rpc('set_player_ready', {
    p_room_id: roomId,
    p_user_id: userId
  })

  if (error) throw customError('Failed to set ready status', 'DB_ERROR', error)
  return true
}

export async function submitWord(roomId: string, userId: string, word: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.rpc('submit_word', {
    p_room_id: roomId,
    p_user_id: userId,
    p_word: word.toUpperCase()
  })

  if (error) throw customError('Failed to submit word', 'DB_ERROR', error)
  return data
}

export async function submitFinalScore(roomId: string, userId: string, score: number, words: any[]) {
  const supabase = await createClient()
  
  const { error } = await supabase.rpc('submit_final_score', {
    p_room_id: roomId,
    p_user_id: userId,
    p_score: score,
    p_words: words
  })

  if (error) throw customError('Failed to submit final score', 'DB_ERROR', error)
  return true
} 