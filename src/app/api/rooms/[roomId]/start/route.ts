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

    await GameRoomService.startGame(roomId, user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to start game:', error)
    return NextResponse.json(
      { error: 'Failed to start game' },
      { status: 500 }
    )
  }
} 