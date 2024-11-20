'use client'

import { BoggleGame } from '@/components/Bogglegame'
import { generateBoardFromSeed } from '@/lib/game-logic'
import { Dictionary } from '@/lib/dictionary'
import { useEffect, useState } from 'react'

function getDailySeed() {
  const today = new Date()
  return `daily-${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
}

export default function DailyChallengePage() {
  const [board, setBoard] = useState<string[][]>([])
  const [possibleWords, setPossibleWords] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initGame = async () => {
      const dictionary = new Dictionary()
      await dictionary.initialize()
      
      const { board, possibleWords } = await generateBoardFromSeed(
        getDailySeed(),
        dictionary
      )
      
      setBoard(board)
      setPossibleWords(possibleWords)
      setIsLoading(false)
    }

    initGame()
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      <BoggleGame
        initialBoard={board}
        initialPossibleWords={possibleWords}
        roomId="daily"
      />
    </div>
  )
} 