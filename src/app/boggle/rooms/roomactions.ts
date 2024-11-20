// 'use server'

// import { GameRoomService } from '@/services/game-room.service'
// import { createClient } from '@/app/utils/supabase/server'
// import { customError } from '@/lib/errors'
// import { revalidatePath } from 'next/cache'

// export async function createRoom(name: string) {
//   const supabase = await createClient()
//   const { data: { user } } = await supabase.auth.getUser()
  
//   if (!user) throw customError('Not authenticated', 'AUTH_ERROR')

//   const playerName = user.email?.split('@')[0] || 'Player'
  
//   const room = await GameRoomService.createRoom({
//     id: crypto.randomUUID(),
//     createdBy: user.id,
//     name: name.trim(),
//     hostName: playerName,
//     maxPlayers: 4
//   })

//   revalidatePath('/boggle/rooms')
//   return room
// }

// export async function joinRoom(roomId: string) {
//   const supabase = await createClient()
//   const { data: { user } } = await supabase.auth.getUser()
  
//   if (!user) throw customError('Not authenticated', 'AUTH_ERROR')
  
//   const playerName = user.email?.split('@')[0] || 'Player'
  
//   const room = await GameRoomService.joinRoom(roomId, user.id, playerName)
//   revalidatePath('/boggle/rooms')
//   return room
// }

// export async function leaveRoom(roomId: string) {
//   const supabase = await createClient()
//   const { data: { user } } = await supabase.auth.getUser()
  
//   if (!user) throw customError('Not authenticated', 'AUTH_ERROR')
  
//   await GameRoomService.leaveRoom(roomId, user.id)
//   revalidatePath('/boggle/rooms')
//   return true
// }

// export async function setPlayerReady(roomId: string) {
//   const supabase = await createClient()
//   const { data: { user } } = await supabase.auth.getUser()
  
//   if (!user) throw customError('Not authenticated', 'AUTH_ERROR')

//   await GameRoomService.setPlayerReady(roomId, user.id)
//   revalidatePath('/boggle/rooms')
//   return true
// }

// export async function updateGameDuration(roomId: string, duration: number) {
//   const supabase = await createClient()
//   const { data: { user } } = await supabase.auth.getUser()
  
//   if (!user) throw customError('Not authenticated', 'AUTH_ERROR')

//   await GameRoomService.updateGameDuration(roomId, user.id, duration)
//   revalidatePath('/boggle/rooms')
//   return true
// }

// export async function startGame(roomId: string) {
//   const supabase = await createClient()
//   const { data: { user } } = await supabase.auth.getUser()
  
//   if (!user) throw customError('Not authenticated', 'AUTH_ERROR')

//   await GameRoomService.startGame(roomId, user.id)
//   revalidatePath(`/boggle/rooms/${roomId}/play`)
//   return true
// } 