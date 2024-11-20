// components/BoggleGame.tsx

'use client';

import { useRouter } from 'next/navigation'
import { useEffect, useCallback } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { BoggleBoard } from './BoggleBoard'
import { Position } from '@/types/types'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { LETTER_POINTS, WORD_LENGTH_MULTIPLIERS } from '@/lib/game-logic'
import { motion } from 'framer-motion'
import { useToast } from "@/hooks/use-toast"

interface BoggleGameProps {
  initialBoard: string[][];
  initialPossibleWords: string[];
  roomId: string;
}

export function BoggleGame({ 
  initialBoard, 
  initialPossibleWords, 
  roomId 
}: BoggleGameProps) {
  const {
    board,
    currentWord,
    selectedCells,
    foundWords,
    getCurrentScore,
    status,
    cycleState,
    feedback,
    initializeGame,
    handleLetterSelection,
    submitWord,
    resetCurrentWord,
    findAndSelectLetter,
    handleCyclePosition,
    subscribeToGame,
    unsubscribeFromGame
  } = useGameStore();

  const { toast } = useToast()

  // Initialize game state and setup subscriptions
  useEffect(() => {
    initializeGame(initialBoard, initialPossibleWords, roomId);
    subscribeToGame(roomId);
    return () => unsubscribeFromGame();
  }, [initialBoard, initialPossibleWords, roomId, initializeGame, subscribeToGame, unsubscribeFromGame]);

  const handlePositionSelect = useCallback((position: Position) => {
    if (status !== 'playing') return;
    handleLetterSelection(position.row, position.col);
  }, [status, handleLetterSelection]);

  const handleDragStart = useCallback((row: number, col: number) => {
    if (status !== 'playing') return;
    handleLetterSelection(row, col);
  }, [status, handleLetterSelection]);

  const handleDragEnter = useCallback((row: number, col: number) => {
    if (status !== 'playing') return;
    handleLetterSelection(row, col);
  }, [status, handleLetterSelection]);

  const calculateWordPoints = (word: string) => {
    const letterPoints = word.split('').reduce((sum, letter) => {
      return sum + (LETTER_POINTS[letter] || 1);
    }, 0);
    const multiplier = WORD_LENGTH_MULTIPLIERS[Math.min(word.length, 8)];
    return letterPoints * multiplier;
  };

  const handleDragEnd = useCallback(() => {
    if (currentWord.length < 3) {
      resetCurrentWord();
      return;
    }
    
    // Check if word is already found
    if (foundWords.includes(currentWord)) {
      toast({
        title: "Word Already Found!",
        description: currentWord,
        variant: "default",
        duration: 3000,
        className: "bg-orange-500/90 text-white",
      });
      resetCurrentWord();
      return;
    }

    // Check if word is valid
    if (!initialPossibleWords.includes(currentWord)) {
      toast({
        title: "Not a Valid Word!",
        description: currentWord,
        variant: "default",
        duration: 3000,
        className: "bg-red-500/90 text-white",
      });
      resetCurrentWord();
      return;
    }

    submitWord(currentWord);
    const points = calculateWordPoints(currentWord);
    toast({
      title: "Word Found!",
      description: `${currentWord} (+${points} points)`,
      variant: "default",
      duration: 3000,
      className: "bg-green-500/90 text-white",
    });
  }, [currentWord, resetCurrentWord, submitWord, toast, foundWords, initialPossibleWords]);

  // Add window-level mouse up handler
  useEffect(() => {
    const handleWindowMouseUp = () => {
      if (currentWord.length >= 3) {
        handleDragEnd();
      }
    };

    window.addEventListener('mouseup', handleWindowMouseUp);
    window.addEventListener('touchend', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mouseup', handleWindowMouseUp);
      window.removeEventListener('touchend', handleWindowMouseUp);
    };
  }, [currentWord.length, handleDragEnd]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (status !== 'playing') return;

      if (e.key === 'Escape') {
        resetCurrentWord();
        return;
      }

      if (e.key === 'Enter') {
        // Check if word is already found
        if (foundWords.includes(currentWord)) {
          toast({
            title: "Word Already Found!",
            description: currentWord,
            variant: "default",
            duration: 3000,
            className: "bg-orange-500/90 text-white",
          });
          resetCurrentWord();
          return;
        }

        // Check if word is valid
        if (!initialPossibleWords.includes(currentWord)) {
          toast({
            title: "Not a Valid Word!",
            description: currentWord,
            variant: "default",
            duration: 3000,
            className: "bg-red-500/90 text-white",
          });
          resetCurrentWord();
          return;
        }

        submitWord(currentWord);
        if (currentWord.length >= 3) {
          const points = calculateWordPoints(currentWord);
          toast({
            title: "Word Found!",
            description: `${currentWord} (+${points} points)`,
            variant: "default",
            duration: 3000,
            className: "bg-green-500/90 text-white",
          });
        }
        return;
      }

      if (e.key === 'Backspace') {
        resetCurrentWord();
        return;
      }

      if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        handleCyclePosition(e.key);
        return;
      }

      const key = e.key.toUpperCase();
      if (key === 'Q') {
        findAndSelectLetter('QU');
        return;
      }

      if (/^[A-Z]$/.test(key)) {
        findAndSelectLetter(key);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [status, currentWord, submitWord, handleCyclePosition, resetCurrentWord, findAndSelectLetter, toast, foundWords, initialPossibleWords]);

  return (
    <div className="container mx-auto w-full px-4">
      <div className="flex flex-col items-center space-y-6">
        <BoggleBoard
          board={board}
          selectedLetters={selectedCells}
          onLetterSelect={handlePositionSelect}
          onDragStart={handleDragStart}
          onDragEnter={handleDragEnter}
          onDragEnd={handleDragEnd}
          onTouchMove={(e) => {
            if (status !== 'playing') return;
            e.preventDefault();
            const touch = e.touches[0];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            if (element instanceof HTMLElement) {
              const pos = element.getAttribute('data-pos');
              if (pos) {
                const [row, col] = pos.split('-').map(Number);
                handleLetterSelection(row, col);
              }
            }
          }}
          cycleState={cycleState}
          feedbackType={feedback.type}
        />
        
        {/* Current Word Display */}
        <div className="w-full max-w-md mx-auto bg-secondary/10 rounded-lg border border-secondary/20 p-4 min-h-[60px] flex items-center justify-center">
          <span className="text-3xl font-bold text-white">
            {currentWord || 'Type or drag letters to play'}
          </span>
        </div>

        {/* Score Card */}
        <Card className="w-full max-w-xl">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-bold">Score</CardTitle>
                <p className="text-4xl font-bold text-blue-600">{getCurrentScore()}</p>
              </div>
              <div className="space-y-1">
                <CardTitle className="text-2xl font-bold">Words</CardTitle>
                <p className="text-4xl font-bold text-blue-600">{foundWords.length}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-[40vh] overflow-y-auto">
              {foundWords.map((word) => (
                <motion.div
                  key={word}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-between items-center p-3 bg-secondary/10 rounded-lg hover:bg-secondary/20 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl font-medium">{word}</span>
                    <span className="text-sm text-muted-foreground">
                      {word.length} letters
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {feedback.type && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`text-lg font-bold ${
              feedback.type === 'success' ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {feedback.message}
          </motion.div>
        )}
      </div>
    </div>
  );
}
