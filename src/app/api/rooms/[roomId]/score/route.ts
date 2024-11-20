import { submitFinalScore } from '@/lib/supabase/rpc'
import { NextResponse } from 'next/server'
import { createClient } from '@/app/utils/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { score, words } = await request.json()
    await submitFinalScore(params.roomId, user.id, score, words)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to submit final score' },
      { status: 500 }
    )
  }
} 