import { NextResponse } from 'next/server'
import { createClient } from '@/app/utils/supabase/server'
import { GameRoomService } from '@/services/game-room.service'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { name, roomId } = await request.json()
    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Room name is required' },
        { status: 400 }
      )
    }

    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      )
    }

    const playerName = user.email?.split('@')[0] || 'Anonymous'

    const room = await GameRoomService.createRoom({
      id: roomId,
      createdBy: user.id,
      name: name.trim(),
      hostName: playerName,
      maxPlayers: 4
    })

    return NextResponse.json({
      ...room,
      currentUserId: user.id,
      isHost: true
    })

  } catch (error) {
    console.error('Failed to create room:', error)
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    )
  }
}