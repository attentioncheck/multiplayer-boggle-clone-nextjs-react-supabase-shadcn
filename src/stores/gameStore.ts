// src/stores/gameStore.ts

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { createClient } from '@/app/utils/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { LETTER_POINTS, WORD_LENGTH_MULTIPLIERS } from '@/lib/game-logic';

interface GameState {
  board: string[][];
  currentWord: string;
  selectedCells: { row: number; col: number }[];
  foundWords: string[];
  scores: Record<string, number>;
  timer: number;
  currentPlayerId: string | null;
  channel: RealtimeChannel | null;
  roomId: string | null;
  status: 'idle' | 'playing' | 'paused' | 'finished';
  cycleState: {
    positions: { row: number; col: number }[];
    currentIndex: number;
  };
  feedback: {
    type: 'success' | 'error' | null;
    message: string;
  };
  possibleWords: string[];
}

interface GameActions {
  initializeGame: (board: string[][], possibleWords: string[], roomId: string) => void;
  handleLetterSelection: (row: number, col: number) => void;
  submitWord: (word: string) => void;
  resetCurrentWord: () => void;
  findAndSelectLetter: (letter: string) => void;
  handleCyclePosition: (direction: string) => void;
  setStatus: (status: GameState['status']) => void;
  selectCell: (row: number, col: number) => void;
  updateScore: (playerId: string, score: number) => void;
  setTimer: (time: number) => void;
  resetGame: () => void;
  subscribeToGame: (roomId: string) => void;
  unsubscribeFromGame: () => void;
  setFeedback: (type: GameState['feedback']['type'], message: string) => void;
  getCurrentScore: () => number;
  submitFinalScore: () => Promise<void>;
}

export const useGameStore = create<GameState & GameActions>()(
  subscribeWithSelector((set, get) => ({
    board: [],
    currentWord: '',
    selectedCells: [],
    foundWords: [],
    scores: {},
    timer: 180,
    currentPlayerId: null,
    channel: null,
    roomId: null,
    status: 'idle',
    cycleState: {
      positions: [],
      currentIndex: 0
    },
    feedback: { type: null, message: '' },
    possibleWords: [],

    initializeGame: (board: string[][], possibleWords: string[], roomId: string) => set({
      board,
      currentWord: '',
      selectedCells: [],
      foundWords: [],
      scores: {},
      timer: 180,
      currentPlayerId: null,
      channel: null,
      roomId,
      status: 'playing',
      cycleState: {
        positions: [],
        currentIndex: 0
      },
      feedback: { type: null, message: '' },
      possibleWords: possibleWords
    }),

    handleLetterSelection: (row: number, col: number) => {
      const { selectedCells, board, currentWord } = get();
      const letter = board[row][col];

      if (selectedCells.some(cell => cell.row === row && cell.col === col)) return;

      set({
        selectedCells: [...selectedCells, { row, col }],
        currentWord: currentWord + letter
      });
    },

    resetCurrentWord: () => set({
      currentWord: '',
      selectedCells: []
    }),

    findAndSelectLetter: (letter: string) => {
      const { board } = get();
      const positions: { row: number; col: number }[] = [];

      for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
          if (board[row][col].toUpperCase() === letter.toUpperCase()) {
            positions.push({ row, col });
          }
        }
      }

      if (positions.length > 0) {
        set({
          cycleState: {
            positions,
            currentIndex: 0
          }
        });
        get().handleLetterSelection(positions[0].row, positions[0].col);
      }
    },

    handleCyclePosition: (direction: string) => {
      const { cycleState } = get();
      if (cycleState.positions.length === 0) return;

      let newIndex = cycleState.currentIndex;

      switch (direction) {
        case 'ArrowRight':
        case 'ArrowDown':
          newIndex = (newIndex + 1) % cycleState.positions.length;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          newIndex = (newIndex - 1 + cycleState.positions.length) % cycleState.positions.length;
          break;
      }

      const newPosition = cycleState.positions[newIndex];
      set({
        cycleState: {
          ...cycleState,
          currentIndex: newIndex
        }
      });
      get().handleLetterSelection(newPosition.row, newPosition.col);
    },

    setStatus: (status: GameState['status']) => set({ status }),

    selectCell: (row: number, col: number) => set((state) => ({
      selectedCells: [...state.selectedCells, { row, col }],
      currentWord: state.currentWord + state.board[row][col]
    })),

    submitWord: (word: string) => {
      const state = get();
      if (word.length < 3) return;

      if (!state.possibleWords.includes(word)) {
        set({ feedback: { type: 'error', message: 'Not a valid word!' }});
        setTimeout(() => set({ feedback: { type: null, message: '' }}), 1500);
        get().resetCurrentWord();
        return;
      }

      if (state.foundWords.includes(word)) {
        set({ feedback: { type: 'error', message: 'Word already found!' }});
        setTimeout(() => set({ feedback: { type: null, message: '' }}), 1500);
        get().resetCurrentWord();
        return;
      }

      const points = calculateWordScore(word);
      set({ 
        feedback: { type: 'success', message: `+${points} points!` },
        foundWords: [...state.foundWords, word],
        currentWord: '',
        selectedCells: [],
        scores: { 
          ...state.scores, 
          [state.currentPlayerId || 'player']: (state.scores[state.currentPlayerId || 'player'] || 0) + points 
        }
      });
      setTimeout(() => set({ feedback: { type: null, message: '' }}), 1500);

      // Broadcast found word to other players
      state.channel?.send({
        type: 'broadcast',
        event: 'word_found',
        payload: {
          word,
          playerId: state.currentPlayerId
        }
      });
    },

    updateScore: (playerId: string, score: number) => {
      const { channel } = get();
      
      set((state) => ({
        scores: { ...state.scores, [playerId]: score }
      }));

      // Broadcast score update to other players
      channel?.send({
        type: 'broadcast',
        event: 'score_update',
        payload: {
          playerId,
          score
        }
      });
    },

    setTimer: (time: number) => set({ timer: time }),

    resetGame: () => set({
      currentWord: '',
      selectedCells: [],
      foundWords: [],
      scores: {}
    }),

    subscribeToGame: (roomId: string) => {
      const supabase = createClient();
      const channel = supabase.channel(`game:${roomId}`)
        .on('broadcast', { event: 'word_found' }, ({ payload }) => {
          const { word, playerId } = payload;
          if (playerId !== get().currentPlayerId) {
            set((state) => ({
              foundWords: [...state.foundWords, word]
            }));
          }
        })
        .on('broadcast', { event: 'score_update' }, ({ payload }) => {
          const { playerId, score } = payload;
          set((state) => ({
            scores: { ...state.scores, [playerId]: score }
          }));
        })
        .subscribe();

      set({ channel });
    },

    unsubscribeFromGame: () => {
      const { channel } = get();
      if (channel) {
        channel.unsubscribe();
        set({ channel: null });
      }
    },

    setFeedback: (type: GameState['feedback']['type'], message: string) => set({
      feedback: { type, message }
    }),

    getCurrentScore: () => {
      const state = get();
      return state.scores[state.currentPlayerId || 'player'] || 0;
    },

    submitFinalScore: async () => {
      const state = get();
      if (!state.roomId || !state.currentPlayerId) return;

      try {
        await fetch(`/api/rooms/${state.roomId}/score`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            score: state.scores[state.currentPlayerId] || 0,
            words: state.foundWords
          })
        });

        // Update game status
        set({ status: 'finished' });

        // Broadcast game end to other players
        state.channel?.send({
          type: 'broadcast',
          event: 'game_end',
          payload: {
            playerId: state.currentPlayerId,
            score: state.scores[state.currentPlayerId] || 0
          }
        });
      } catch (error) {
        console.error('Failed to submit final score:', error);
      }
    },
  }))
);

// Helper function
const calculateWordScore = (word: string) => {
  const baseScore = word.split('').reduce((acc, letter) => {
    const points = LETTER_POINTS[letter] || 1;
    return acc + points;
  }, 0);
  
  const multiplier = WORD_LENGTH_MULTIPLIERS[word.length] || 
    (word.length > 8 ? WORD_LENGTH_MULTIPLIERS[8] : 1);
  
  return baseScore * multiplier;
};
