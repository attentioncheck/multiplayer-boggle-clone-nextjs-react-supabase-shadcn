import { Player } from '@/types/game'
import { motion } from 'framer-motion'

interface PlayerRankingsProps {
  players: Player[]
  scores: Record<string, number>
  currentUserId: string
}

export function PlayerRankings({ players, scores, currentUserId }: PlayerRankingsProps) {
  const sortedPlayers = [...players].sort((a, b) => 
    (scores[b.id] || 0) - (scores[a.id] || 0)
  )

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Player Rankings</h3>
      <div className="space-y-2">
        {sortedPlayers.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex justify-between items-center p-2 rounded ${
              player.id === currentUserId ? 'bg-blue-50' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className="font-semibold">{index + 1}.</span>
              <span>{player.name}</span>
              {player.id === currentUserId && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">You</span>
              )}
            </div>
            <span className="font-semibold">{scores[player.id] || 0}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 