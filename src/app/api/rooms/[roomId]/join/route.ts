import { NextResponse } from 'next/server'
import { createClient } from '@/app/utils/supabase/server'
import { GameRoomService } from '@/services/game-room.service'

export async function POST(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const roomId = params.roomId
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const playerName = user.email?.split('@')[0] || 'Anonymous'
    const room = await GameRoomService.joinRoom(roomId, user.id, playerName)

    return NextResponse.json({
      ...room,
      currentUserId: user.id,
      isHost: false
    })
  } catch (error) {
    console.error('Failed to join room:', error)
    return NextResponse.json(
      { error: 'Failed to join room' },
      { status: 500 }
    )
  }
}