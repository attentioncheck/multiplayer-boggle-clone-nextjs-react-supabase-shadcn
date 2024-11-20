'use server'

import { GameActionService } from '@/services/game-action.service'
import { createClient } from '@/app/utils/supabase/server'
import { customError } from '@/lib/errors'
import { revalidatePath } from 'next/cache'

export async function startGameAction(roomId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw customError('Not authenticated', 'AUTH_ERROR')

  await GameActionService.startGame(roomId, user.id)
  revalidatePath(`/boggle/rooms/${roomId}/play`)
  return true
}

export async function submitWordAction(roomId: string, word: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw customError('Not authenticated', 'AUTH_ERROR')

  await GameActionService.submitWord(roomId, user.id, word)
  return true
}

export async function endGameAction(roomId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw customError('Not authenticated', 'AUTH_ERROR')

  await GameActionService.endGame(roomId)
  revalidatePath(`/boggle/rooms/${roomId}`)
  revalidatePath(`/boggle/rooms/${roomId}/results`)
  return true
}

export async function submitFinalScoreAction(roomId: string, words: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw customError('Not authenticated', 'AUTH_ERROR')

  const gameState = await GameActionService.getGameState(roomId)
  const finalScore = gameState.scores[user.id] || 0
  
  await GameActionService.submitFinalScore(roomId, user.id, finalScore, words)
  revalidatePath(`/boggle/rooms/${roomId}/results`)
  return true
} 