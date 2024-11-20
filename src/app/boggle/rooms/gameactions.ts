// 'use server'

// import { createClient } from '@/app/utils/supabase/server'
// import { GameActionService } from '@/services/game-action.service'
// import { customError } from '@/lib/errors'
// import { FoundWord, GameAction, GameState } from '@/types/game'
// import { revalidatePath } from 'next/cache'
// import { Queue } from '@/lib/queue'

// const actionQueue = new Queue<GameAction>()

// const processActions = async () => {
//   while (!actionQueue.isEmpty()) {
//     const action = actionQueue.dequeue()
//     if (action) {
//       await GameActionService.broadcastAction(action)
//       await applyAction(action)
//     }
//   }
// }

// export async function submitWord(roomId: string, word: string) {
//   const supabase = await createClient()
//   const { data: { user } } = await supabase.auth.getUser()
  
//   if (!user) throw customError('Not authenticated', 'AUTH_ERROR')

//   await GameActionService.submitWord(roomId, user.id, word)
  
//   revalidatePath(`/boggle/rooms/${roomId}/play`)
//   return true
// }

// export async function getGameState(roomId: string) {
//   const supabase = await createClient()
//   const { data: { user } } = await supabase.auth.getUser()
  
//   if (!user) throw customError('Not authenticated', 'AUTH_ERROR')

//   return await GameActionService.getGameState(roomId)
// }

// export async function syncGameState(roomId: string, localState: GameState) {
//   const serverState = await getGameState(roomId)
  
//   return {
//     ...serverState,
//     board: localState.board,
//     currentWord: localState.currentWord,
//     selectedCells: localState.selectedCells,
//     possibleWords: localState.possibleWords,
//     isHost: localState.isHost
//   }
// }

// export async function endGame(roomId: string) {
//   const supabase = await createClient()
//   const { data: { user } } = await supabase.auth.getUser()
  
//   if (!user) throw customError('Not authenticated', 'AUTH_ERROR')

//   await GameActionService.endGame(roomId)
  
//   revalidatePath(`/boggle/rooms/${roomId}`)
//   revalidatePath(`/boggle/rooms/${roomId}/results`)
  
//   return true
// }

// export async function submitFinalScores(roomId: string) {
//   const supabase = await createClient()
//   const { data: { user } } = await supabase.auth.getUser()
  
//   if (!user) throw customError('Not authenticated', 'AUTH_ERROR')

//   const gameState = await getGameState(roomId) as GameState
//   await GameActionService.updatePlayerScore(
//     roomId, 
//     user.id, 
//     gameState.scores[user.id] || 0
//   )
  
//   return true
// }

// async function applyAction(action: GameAction) {
//   if (!action.payload?.roomId) return
  
//   switch (action.type) {
//     case 'WORD_FOUND':
//       if (!action.payload.word) return
//       return submitWord(action.payload.roomId, action.payload.word)
//     case 'GAME_END':
//       return endGame(action.payload.roomId)
//     default:
//       return
//   }
// }