import { redirect } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/server'

export default async function RoomPage({ params }: { params: { roomId: string } }) {
  const supabase = await createClient()
  const aparams =  (await params).roomId
  
  const { data: room, error } = await supabase
    .from('game_rooms')
    .select('status')
    .eq('id', aparams)
    .single()

  if (error || !room) {
    redirect('/boggle/rooms')
  }

  // Redirect based on game status
  if (room.status === 'waiting') {  
    redirect(`/boggle/rooms/${aparams}/setup`)
  } else if (room.status === 'playing') {
    redirect(`/boggle/rooms/${aparams}/play`)
  } else {
    redirect('/boggle/rooms')
  }
} 