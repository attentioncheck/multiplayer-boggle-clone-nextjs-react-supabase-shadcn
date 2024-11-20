'use client'

import { BoggleGame } from '@/components/Bogglegame'
import { generateBoardFromSeed } from '@/lib/game-logic'
import { Dictionary } from '@/lib/dictionary'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SkeletonBoard } from '@/components/SkeletonBoard'

// 1. Add memoization for the dictionary
const dictionaryInstance = new Dictionary(); // Move outside component
let dictionaryInitialized = false;

export default function PracticePage() {
  const [board, setBoard] = useState<string[][]>([])
  const [possibleWords, setPossibleWords] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const seed = searchParams.get('seed')

  useEffect(() => {
    const initGame = async () => {
      // Only initialize dictionary once
      if (!dictionaryInitialized) {
        await dictionaryInstance.initialize();
        dictionaryInitialized = true;
      }
      
      const { board, possibleWords } = await generateBoardFromSeed(
        seed || Date.now().toString(),
        dictionaryInstance
      )
      
      setBoard(board)
      setPossibleWords(possibleWords)
      setIsLoading(false)
    }

    initGame()
  }, [seed])

  if (isLoading) {
    return <SkeletonBoard />
  }

  return (
    <div className="space-y-4">
      
        <BoggleGame
          initialBoard={board}
        initialPossibleWords={possibleWords}
        roomId="practice"
        />
    
    </div>
  )
} 