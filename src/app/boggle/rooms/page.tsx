// app/rooms/page.jsx (or .tsx if using TypeScript)

import { redirect } from 'next/navigation'
import RoomsList from './RoomsList'
import { createClient } from '@/app/utils/supabase/server'
import { RoomStoreProvider } from '@/store-provider/roomStore-provider'
export default async function RoomsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  // Check if user is a host of any room
  const { data: hostRoom } = await supabase
    .from('game_rooms')
    .select('id')
    .eq('created_by', user.id)
    .eq('status', 'waiting')
    .single()

  // If user is a host, redirect them to their room
  if (hostRoom) {
    redirect(`/boggle/rooms/${hostRoom.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-8">
      <RoomsList />
    </div>
  )
}