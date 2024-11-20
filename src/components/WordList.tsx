import { Player } from '@/types/types';
import { motion } from 'framer-motion'

interface WordListProps {
  words: { word: string; points: number }[]
  currentUserId: string
  players: Player[]
}

export function WordList({ words, currentUserId, players }: WordListProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Found Words</h3>
      <div className="h-[300px] overflow-y-auto space-y-2">
        {words.map((entry, index) => (
          <motion.div
            key={`${entry.word}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center p-2 bg-gray-50 rounded"
          >
            <div className="flex items-center space-x-2">
              <span className="text-gray-900">{entry.word}</span>
              <span className="text-sm text-gray-500">
                by {players.find(p => p.id === currentUserId)?.name}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-600 font-semibold">+{entry.points}</span>
              <motion.div
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
              >
                {entry.word.length} letters
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 