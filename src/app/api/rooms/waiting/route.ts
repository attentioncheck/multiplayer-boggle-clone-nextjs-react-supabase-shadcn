import { getWaitingRooms } from '@/db/queries/game-rooms'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const waitingRooms = await getWaitingRooms()
    return NextResponse.json(waitingRooms)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch waiting rooms' },
      { status: 500 }
    )
  }
} 