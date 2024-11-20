'use client'

import { Button } from "@/components/ui/button"
import { useRouter } from 'next/navigation'

interface GameResultsProps {
  room: {
    players: Array<{
      id: string
      name: string
      score: number
      found_words?: string[]
    }>
    scores: Record<string, number>
    found_words: Record<string, string[]>
  }
}

export function GameResults({ room }: GameResultsProps) {
  const router = useRouter()
  
  return (
    <div className="space-y-8 p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-center dark:text-white">Game Results</h2>
      
      <div className="space-y-6">
        {room.players.map((player) => (
          <div key={player.id} className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold dark:text-white">{player.name}</h3>
              <span className="text-2xl font-bold dark:text-white">
                {room.scores?.[player.id] || 0} points
              </span>
            </div>
            
            {room.found_words?.[player.id] && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Found Words:
                </h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {room.found_words[player.id].map((word) => (
                    <span
                      key={word}
                      className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-center pt-6">
        <Button
          onClick={() => router.push('/boggle/rooms')}
          className="dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          Back to Rooms
        </Button>
      </div>
    </div>
  )
} 