import { customError } from '@/lib/errors'
import { GameAction, GameActionInput } from '@/types/types'
import { GAME_DURATION } from '@/lib/game-logic'
import * as procedures from '@/db/procedures'
import { gameActions } from '@/db/schema'
import { type Json } from '@/types/supabase'
import crypto from 'crypto'

export class GameActionService {
  static async submitWord(roomId: string, userId: string, word: string) {
    try {
      const result = await procedures.submitWord(roomId, userId, word.toUpperCase())
      await this.broadcastAction({
        type: 'WORD_FOUND',
        playerId: userId,
        payload: { roomId, word: word.toUpperCase() }
      })
      return result
    } catch (error) {
      throw customError('Failed to submit word', 'DB_ERROR', error)
    }
  }

  static async broadcastAction(action: GameAction) {
    try {
      const gameAction: GameActionInput = {
        id: crypto.randomUUID(),
        playerId: action.playerId,
        roomId: action.payload.roomId,
        type: action.type,
        payload: action.payload as Json
      }
      await procedures.createGameAction(gameAction)
    } catch (error) {
      throw customError('Failed to broadcast action', 'DB_ERROR', error)
    }
  }

  static async getGameState(roomId: string) {
    try {
      const [room] = await procedures.getGameRoom(roomId)
      if (!room) throw customError('Room not found', 'NOT_FOUND')

      const currentScores = (room.currentScores as Record<string, number>) || {}

      return {
        roomId: room.id,
        players: room.players,
        scores: currentScores,
        gameStartedAt: room.gameStartedAt,
        gameDuration: room.gameDuration || GAME_DURATION,
        status: room.status,
        timeRemaining: room.gameStartedAt ? 
          Math.max(0, GAME_DURATION - Math.floor((Date.now() - new Date(room.gameStartedAt).getTime()) / 1000)) : 
          GAME_DURATION
      }
    } catch (error) {
      throw customError('Failed to get game state', 'DB_ERROR', error)
    }
  }

  static async endGame(roomId: string) {
    try {
      const [room] = await procedures.getGameRoom(roomId)
      if (!room) throw customError('Room not found', 'NOT_FOUND')
      if (room.status !== 'playing') throw customError('Game not in progress', 'VALIDATION_ERROR')

      await procedures.endGame(roomId)
      return true
    } catch (error) {
      throw customError('Failed to end game', 'DB_ERROR', error)
    }
  }

  static async updatePlayerScore(roomId: string, playerId: string, score: number) {
    try {
      await procedures.updatePlayerScore(roomId, playerId, score)
      return true
    } catch (error) {
      throw customError('Failed to update player score', 'DB_ERROR', error)
    }
  }

  static async startGame(roomId: string, userId: string) {
    try {
      await procedures.startGame(roomId, userId)
      await this.broadcastAction({
        type: 'GAME_START',
        playerId: userId,
        payload: { roomId }
      })
      return true
    } catch (error) {
      throw customError('Failed to start game', 'DB_ERROR', error)
    }
  }

  static async submitFinalScore(roomId: string, userId: string, score: number, words: string[]) {
    try {
      await procedures.submitFinalScore(roomId, userId, score, words)
      await this.broadcastAction({
        type: 'FINAL_SCORE',
        playerId: userId,
        payload: { roomId, score, words }
      })
      return true
    } catch (error) {
      throw customError('Failed to submit final score', 'DB_ERROR', error)
    }
  }
} 