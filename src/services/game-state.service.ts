import { GAME_DURATION } from '@/lib/game-logic'
import { db } from '../db'
import * as queries from '../db/queries'
import { customError } from '@/lib/errors'
import { GameState, UnifiedGameState, GameStatus, Player, FoundWord } from '@/types/game'

export class GameStateService {
  static async syncGameState(roomId: string): Promise<UnifiedGameState> {
    try {
      const [room] = await queries.getGameRoom(roomId)
      if (!room) throw customError('Room not found', 'NOT_FOUND')

      const players: Player[] = (room.players || []).map(p => ({
        ...p,
        is_host: room.createdBy === p.id
      }))

      const scores: { [playerId: string]: number } = room.currentScores as { [key: string]: number } || {}

      const foundWords: { [playerId: string]: FoundWord[] } = {}

      return {
        roomId: room.id,
        players,
        status: room.status || 'waiting',
        gameDuration: room.gameDuration ?? GAME_DURATION,
        gameStartedAt: room.gameStartedAt ? room.gameStartedAt.toISOString() : null,
        scores,
        foundWords,
        board: [],
        currentWord: '',
        selectedCells: [],
        possibleWords: [],
        isHost: false
      }
    } catch (error) {
      throw customError('Failed to sync game state', 'DB_ERROR', error)
    }
  }

  static async updatePlayerScore(roomId: string, playerId: string, score: number) {
    try {
      await queries.updateRoom(roomId, {
        [`currentScores.${playerId}`]: score
      })
      return true
    } catch (error) {
      throw customError('Failed to update player score', 'DB_ERROR', error)
    }
  }
} 