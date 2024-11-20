import { Position } from "@/types/shared"

// Constants
export const GAME_DURATION = 180 // 3 minutes in seconds
export const MIN_WORD_LENGTH = 3
export const MAX_WORD_LENGTH = 16

export const LETTER_POINTS: Record<string, number> = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8,
  K: 5, L: 1, M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1,
  U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10
}

export const WORD_LENGTH_MULTIPLIERS: Record<number, number> = {
  3: 1,
  4: 1,
  5: 2,
  6: 3,
  7: 5,
  8: 11
}

// Timer utilities
export function calculateRemainingTime(startTime: string | null, duration: number): number {
  if (!startTime) return duration
  const now = Date.now()
  const gameStartTime = new Date(startTime).getTime()
  return Math.max(0, duration - Math.floor((now - gameStartTime) / 1000))
}

// Board utilities
export function isAdjacent(pos1: Position, pos2: Position): boolean {
  const rowDiff = Math.abs(pos1.row - pos2.row)
  const colDiff = Math.abs(pos1.col - pos2.col)
  return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0)
}

export function generateBoard(): string[][] {
  // Standard Boggle dice configuration
  const dice = [
    'AAEEGN', 'ABBJOO', 'ACHOPS', 'AFFKPS',
    'AOOTTW', 'CIMOTU', 'DEILRX', 'DELRVY',
    'DISTTY', 'EEGHNW', 'EEINSU', 'EHRTVW',
    'EIOSST', 'ELRTTY', 'HIMNQU', 'HLNNRZ'
  ];
  
  // Create 4x4 board
  const board: string[][] = Array(4).fill(null).map(() => Array(4).fill(''));
  
  // Shuffle dice
  const shuffledDice = [...dice].sort(() => Math.random() - 0.5);
  
  // Place random face from each die
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const dieIndex = i * 4 + j;
      const die = shuffledDice[dieIndex];
      const face = die[Math.floor(Math.random() * 6)];
      board[i][j] = face === 'Q' ? 'QU' : face;
    }
  }
  
  return board;
}

export function findAllWords(board: string[][]): Set<string> {
  const words = new Set<string>();
  const visited = Array(4).fill(null).map(() => Array(4).fill(false));
  
  function isValidPosition(row: number, col: number): boolean {
    return row >= 0 && row < 4 && col >= 0 && col < 4;
  }
  
  function dfs(row: number, col: number, currentWord: string) {
    // Add word if it meets minimum length requirement
    if (currentWord.length >= MIN_WORD_LENGTH) {
      words.add(currentWord);
    }
    
    // Check all adjacent positions
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
    
    for (const [dx, dy] of directions) {
      const newRow = row + dx;
      const newCol = col + dy;
      
      if (isValidPosition(newRow, newCol) && !visited[newRow][newCol]) {
        visited[newRow][newCol] = true;
        dfs(newRow, newCol, currentWord + board[newRow][newCol]);
        visited[newRow][newCol] = false;
      }
    }
  }
  
  // Start DFS from each position
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      visited[i][j] = true;
      dfs(i, j, board[i][j]);
      visited[i][j] = false;
    }
  }
  
  return words;
} 