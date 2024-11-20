import { Dictionary } from './dictionary'
import seedrandom from 'seedrandom'
import { Position } from '@/types/shared'
import { customAlphabet } from 'nanoid'

// Constants
export const GAME_DURATION = 180
export const MIN_WORD_LENGTH = 3
export const MAX_WORD_LENGTH = 16

export const LETTER_POINTS: Record<string, number> = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8,
  K: 5, L: 1, M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1,
  U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10
}

export const WORD_LENGTH_MULTIPLIERS: Record<number, number> = {
  3: 1, 4: 1, 5: 2, 6: 3, 7: 5, 8: 11
}

const BOGGLE_DICE = [
  'AAEEGN', 'ABBJOO', 'ACHOPS', 'AFFKPS',
  'AOOTTW', 'CIMOTU', 'DEILRX', 'DELRVY',
  'DISTTY', 'EEGHNW', 'EEINSU', 'EHRTVW',
  'EIOSST', 'ELRTTY', 'HIMNQU', 'HLNNRZ'
]

export function generateBoard(): string[][] {
  const board: string[][] = Array(4).fill(null).map(() => Array(4).fill(''))
  const shuffledDice = [...BOGGLE_DICE].sort(() => Math.random() - 0.5)
  
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const dieIndex = i * 4 + j
      const die = shuffledDice[dieIndex]
      const face = die[Math.floor(Math.random() * 6)]
      board[i][j] = face === 'Q' ? 'QU' : face
    }
  }
  
  return board
}

export function findAllWords(board: string[][], dictionary: Dictionary): Set<string> {
  const words = new Set<string>()
  const visited = Array(4).fill(null).map(() => Array(4).fill(false))

  function dfs(row: number, col: number, currentWord: string) {
    if (currentWord.length >= MIN_WORD_LENGTH && dictionary.isValidWord(currentWord)) {
      words.add(currentWord)
    }

    if (currentWord.length >= MAX_WORD_LENGTH) return

    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ]

    visited[row][col] = true

    for (const [dx, dy] of directions) {
      const newRow = row + dx
      const newCol = col + dy
      
      if (isValidPosition(newRow, newCol) && !visited[newRow][newCol]) {
        dfs(newRow, newCol, currentWord + board[newRow][newCol])
      }
    }

    visited[row][col] = false
  }

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      dfs(i, j, board[i][j])
    }
  }

  return words
}

export function isAdjacent(pos1: Position, pos2: Position): boolean {
  const rowDiff = Math.abs(pos1.row - pos2.row)
  const colDiff = Math.abs(pos1.col - pos2.col)
  return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0)
}

export function calculateRemainingTime(startTime: string | null, duration: number): number {
  if (!startTime) return duration
  const now = Date.now()
  const gameStartTime = new Date(startTime).getTime()
  return Math.max(0, duration - Math.floor((now - gameStartTime) / 1000))
}

export function generateBoardFromSeed(seed: string, dictionary: Dictionary) {
  const rng = seedrandom(seed)
  const boardLetters = BOGGLE_DICE.map(die => {
    const index = Math.floor(rng() * die.length)
    return die[index]
  })

  // Shuffle board letters
  for (let i = boardLetters.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[boardLetters[i], boardLetters[j]] = [boardLetters[j], boardLetters[i]]
  }

  // Convert to 4x4 grid
  const board: string[][] = []
  for (let i = 0; i < 4; i++) {
    board.push(boardLetters.slice(i * 4, (i + 1) * 4))
  }

  const possibleWords = Array.from(findAllWords(board, dictionary))
  return { board, possibleWords }
}

export function hashString(str: string): string {
  const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10)
  return nanoid(str.length)
}

function isValidPosition(row: number, col: number): boolean {
  return row >= 0 && row < 4 && col >= 0 && col < 4
}

export function calculateWordPoints(word: string): number {
  const basePoints = word.split('').reduce((total, letter) => 
    total + (LETTER_POINTS[letter.toUpperCase()] || 1), 0)
  return basePoints * (WORD_LENGTH_MULTIPLIERS[word.length] || 1)
} 