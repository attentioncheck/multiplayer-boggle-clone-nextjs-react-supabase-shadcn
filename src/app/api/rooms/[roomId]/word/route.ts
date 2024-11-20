import { submitWord } from '@/db/procedures'
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

    const { word } = await request.json()
    const result = await submitWord(params.roomId, user.id, word)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to submit word' },
      { status: 500 }
    )
  }
} 