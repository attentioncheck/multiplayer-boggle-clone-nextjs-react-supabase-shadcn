// src/stores/types.ts

import { type Json } from '@/types/supabase'

export interface Player {
    id: string;
    name: string;
    is_ready: boolean;
    is_host: boolean;
    score: number;
    is_online: boolean;
    
  }
  export interface Position {
    row: number;
    col: number;
  }
  
  export interface CycleState {
    positions: Position[];
    currentIndex: number;
  }

  export type GameStatus = 'waiting' | 'playing' | 'finished';
  
  export interface GameRoom {
    id: string;
    name: string;
    createdBy: string;
    hostName: string | null;
    maxPlayers: number | null;
    playerCount: number | null;
    players: Player[];
    status: GameStatus;
    gameDuration: number;
    gameSeed: string | null;
    gameStartedAt: string | null;
    gameEndedAt: string | null;
    currentScores: { [playerId: string]: number } | null;
  }
  
  export interface GameState {
    gameBoard: string[][];
    timer: number;
    foundWords: string[];
    currentScores: { [playerId: string]: number };
    gameSeed: string;
    gameStarted: boolean;
  }
  
  export type GameActionPayload = {
    roomId: string;
    word?: string;
    score?: number;
    words?: string[];
    status?: string;
    playerId?: string;
  };

  export type GameAction = {
    type: 'WORD_FOUND' | 'PLAYER_READY' | 'GAME_START' | 'GAME_END' | 'FINAL_SCORE';
    playerId: string;
    payload: GameActionPayload;
  };

  export type GameActionInput = {
    id: string;
    playerId: string;
    roomId: string;
    type: string;
    payload: Json;
  };
  