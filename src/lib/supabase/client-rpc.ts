import { createClient } from '@/app/utils/supabase/client'

export async function setPlayerReady(roomId: string, userId: string, isReady: boolean) {
  const supabase = createClient()
  return await supabase.rpc('set_player_ready', {
    room_id: roomId,
    player_id: userId,
    is_ready: isReady
  })
}

export async function startGameRpc(roomId: string) {
  const supabase = createClient()
  return await supabase.rpc('start_game', { room_id: roomId })
}

export async function leaveRoomRpc(roomId: string, userId: string) {
  const supabase = createClient()
  return await supabase.rpc('leave_room', {
    room_id: roomId,
    player_id: userId
  })
} 