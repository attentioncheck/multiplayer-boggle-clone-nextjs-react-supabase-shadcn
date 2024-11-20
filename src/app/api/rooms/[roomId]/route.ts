import { getGameRoom, updateGameRoom, deleteGameRoom } from '@/db/queries/game-rooms'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const room = await getGameRoom(params.roomId)
    return NextResponse.json(room)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch room' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const updates = await request.json()
    await updateGameRoom(params.roomId, updates)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update room' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    await deleteGameRoom(params.roomId)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete room' },
      { status: 500 }
    )
  }
} 