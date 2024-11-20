import { createClient } from '@/app/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function ResultsPage({ params }: { params: { roomId: string } }) {
  const supabase = await createClient()
  const aparams = (await params).roomId
  
  // Get room data
  const { data: room, error } = await supabase
    .from('game_rooms')
    .select('*')
    .eq('id', aparams)
    .single()

  if (error || !room) {
    redirect('/boggle/rooms')
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // If game hasn't finished yet, redirect to play
  if (room.status === 'playing') {
    redirect(`/boggle/rooms/${aparams}/play`)
  }

  // Sort players by score
  const sortedPlayers = [...room.players].sort((a, b) => (b.score || 0) - (a.score || 0))
  const winner = sortedPlayers[0]

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold">Game Results</h1>
      
      {winner && (
        <div className="bg-yellow-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold">🏆 Winner: {winner.name}</h2>
          <p className="text-lg">Score: {winner.score || 0}</p>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">All Players</h3>
        <div className="divide-y divide-gray-200">
          {sortedPlayers.map((player, index) => (
            <div key={player.id} className="py-3 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <span className="text-gray-500">#{index + 1}</span>
                <span className="font-medium">{player.name}</span>
              </div>
              <span className="font-semibold">{player.score || 0} points</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 