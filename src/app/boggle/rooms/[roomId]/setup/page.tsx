import { createClient } from '@/app/utils/supabase/server'
import { redirect } from 'next/navigation'
import { WaitingRoom } from '@/components/WaitingRoom'

export default async function RoomSetupPage({ params }: { params: { roomId: string } }) {
  const supabase = await createClient()
  const aparams =  (await params).roomId
  const { data: room, error } = await supabase
    .from('game_rooms')
    .select('*')
    .eq('id', aparams)
    .single()

  if (error || !room) {
    redirect('/boggle/rooms')
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // If game has already started, redirect to play
  if (room.status === 'playing') {
    redirect(`/boggle/rooms/${aparams}/play`)
  }

  // If game is not in waiting status, redirect to rooms
  if (room.status !== 'waiting') {
    redirect('/boggle/rooms')
  }

  const isHost = room.created_by === user.id
  const initialState = {
    players: room.players,
    gameDuration: room.game_duration,
    status: room.status,
    currentUserId: user.id,
    createdBy: room.created_by,
    isHost: isHost
  }

  console.log('Setup page state:', { isHost, initialState })
  
  return <WaitingRoom 
    roomId={aparams} 
    isHost={isHost} 
    initialState={initialState}
  />
} 