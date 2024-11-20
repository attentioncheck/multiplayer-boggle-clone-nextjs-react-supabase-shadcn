import { db } from '@/db/index'
import * as queries from '@/db/queries'
import { customError } from '@/lib/errors'
import { randomUUID } from 'crypto'
import { GAME_DURATION } from '@/lib/game-logic'

export class GameRoomService {
  static async createRoom({
    id,
    createdBy,
    name,
    hostName,
    maxPlayers,
    gameSeed: providedSeed
  }: {
    id: string
    createdBy: string
    name: string
    hostName: string
    maxPlayers: number
    gameSeed?: string
  }) {
    const timestamp = new Date().toISOString()
    const gameSeed = providedSeed || randomUUID().substring(0, 12)

    try {
      const players = [{
        id: createdBy,
        name: hostName,
        score: 0,
        is_ready: false,
        is_host: true,
        is_online: true
      }]

      await queries.createGameRoom({
        id,
        createdBy,
        name,
        hostName,
        maxPlayers,
        players,
        gameSeed
      })

      return {
        id,
        createdBy,
        name,
        hostName,
        maxPlayers,
        players,
        status: 'waiting',
        gameSeed
      }
    } catch (error) {
      throw customError('Failed to create room', 'DB_ERROR', error)
    }
  }

  static async joinRoom(roomId: string, userId: string, userName: string) {
    try {
      const [room] = await queries.getGameRoom(roomId)
      if (!room) throw customError('Room not found', 'NOT_FOUND')
      
      if (room.status !== 'waiting') {
        throw customError('Room is not accepting players', 'VALIDATION_ERROR')
      }

      const updatedPlayers = [
        ...(room.players || []),
        {
          id: userId,
          name: userName,
          score: 0,
          is_ready: false,
          is_host: false,
          is_online: true
        }
      ]

      await queries.updateGameRoom(roomId, {
        players: updatedPlayers,
        playerCount: updatedPlayers.length
      })

      return await queries.getGameRoom(roomId)
    } catch (error) {
      throw customError('Failed to join room', 'DB_ERROR', error)
    }
  }

  static async leaveRoom(roomId: string, userId: string) {
    try {
      const [room] = await queries.getGameRoom(roomId)
      if (!room) throw customError('Room not found', 'NOT_FOUND')

      const updatedPlayers = (room.players || []).filter(p => p.id !== userId)
      const newPlayerCount = updatedPlayers.length

      if (room.createdBy === userId || newPlayerCount === 0) {
        await queries.deleteGameRoom(roomId)
      } else {
        await queries.updateGameRoom(roomId, {
          players: updatedPlayers,
          playerCount: newPlayerCount
        })
      }

      return true
    } catch (error) {
      throw customError('Failed to leave room', 'DB_ERROR', error)
    }
  }

  static async startGame(roomId: string, userId: string) {
    try {
      const [room] = await queries.getGameRoom(roomId)
      if (!room) throw customError('Room not found', 'NOT_FOUND')
      if (room.createdBy !== userId) {
        throw customError('Only room creator can start game', 'AUTH_ERROR')
      }

      await queries.updateGameRoom(roomId, {
        status: 'playing',
        gameStartedAt: new Date(),
        gameDuration: GAME_DURATION
      })

      return true
    } catch (error) {
      throw customError('Failed to start game', 'DB_ERROR', error)
    }
  }

  static async setPlayerReady(roomId: string, userId: string) {
    try {
      const [room] = await queries.getGameRoom(roomId)
      if (!room) throw customError('Room not found', 'NOT_FOUND')

      const updatedPlayers = (room.players || []).map(player => {
        if (player.id === userId) {
          return { ...player, is_ready: true }
        }
        return player
      })

      await queries.updateGameRoom(roomId, {
        players: updatedPlayers
      })

      return true
    } catch (error) {
      throw customError('Failed to set player ready', 'DB_ERROR', error)
    }
  }

  static async updateGameDuration(roomId: string, userId: string, duration: number) {
    try {
      const [room] = await queries.getGameRoom(roomId)
      if (!room) throw customError('Room not found', 'NOT_FOUND')
      if (room.createdBy !== userId) {
        throw customError('Only host can update game duration', 'AUTH_ERROR')
      }

      await queries.updateGameRoom(roomId, {
        gameDuration: duration
      })

      return true
    } catch (error) {
      throw customError('Failed to update game duration', 'DB_ERROR', error)
    }
  }
} 