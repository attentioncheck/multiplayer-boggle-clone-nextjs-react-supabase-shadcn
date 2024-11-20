import { createClient } from '@/app/utils/supabase/server'
import { redirect } from 'next/navigation'
import { BoggleGame } from '@/components/Bogglegame'
import { generateBoardFromSeed } from '@/lib/game-logic'
import { Dictionary } from '@/lib/dictionary'
import { calculateRemainingTime } from '@/lib/game-logic'
import { GameActionService } from '@/services/game-action.service'
import { GameTimer } from '@/components/GameTimer'

function isGameExpired(gameStartedAt: string | null): boolean {
  if (!gameStartedAt) return false
  const remainingTime = calculateRemainingTime(gameStartedAt, 180) // 180 seconds is default game duration
  return remainingTime <= 0
}

export default async function GamePlayPage({ params }: { params: { roomId: string } }) {
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

  // If game hasn't started yet, redirect to setup
  if (room.status === 'waiting') {
    redirect(`/boggle/rooms/${aparams}/setup`)
  }

  // If game is not playing, redirect to rooms
  if (room.status !== 'playing') {
    redirect('/boggle/rooms')
  }

  // Check if game should be ended
  if (room.status === 'playing' && isGameExpired(room.game_started_at)) {
    await GameActionService.endGame(room.id)
    redirect(`/boggle/rooms/${aparams}/results`)
  }

  // Initialize dictionary and generate board
  const dictionary = new Dictionary()
  await dictionary.initialize()
  const { board, possibleWords } = await generateBoardFromSeed(room.game_seed, dictionary)

  // Prepare initial game state
  const initialState = {
    players: room.players,
    currentUserId: user.id,
    createdBy: room.created_by,
    isHost: room.created_by === user.id,
    status: room.status,
    gameDuration: room.game_duration || 180,
    gameStartedAt: room.game_started_at
  }

  return (
    <div className="space-y-4">
      <GameTimer 
        gameStartedAt={room.game_started_at}
        gameDuration={room.game_duration || 180}
        roomId={aparams}
      />
      <BoggleGame
        initialBoard={board}
        initialPossibleWords={possibleWords}
        roomId={aparams}
       
      />
    </div>
  )
} 