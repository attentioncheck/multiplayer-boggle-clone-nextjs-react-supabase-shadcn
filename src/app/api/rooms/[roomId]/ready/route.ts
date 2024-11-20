import { setPlayerReady } from '@/db/procedures'
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
    const { isReady = true } = await request.json()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    await setPlayerReady(roomId, user.id, isReady)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to set player ready' },
      { status: 500 }
    )
  }
} 