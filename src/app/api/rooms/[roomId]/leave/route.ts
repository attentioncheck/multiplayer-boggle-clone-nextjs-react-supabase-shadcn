import { leaveRoom } from '@/db/procedures'
import { NextResponse } from 'next/server'
import { createClient } from '@/app/utils/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const roomId = (await params).roomId
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    await leaveRoom(roomId, user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in leave room route:', error)
    return NextResponse.json(
      { error: 'Failed to leave room' },
      { status: 500 }
    )
  }
}