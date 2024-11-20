import { db } from './index'
import { sql } from 'drizzle-orm'
import { gameRooms, gameActions, finishedGameRooms } from './schema'
import { eq } from 'drizzle-orm/expressions'
import { customError } from '@/lib/errors'
import { type Json } from '../types/supabase'
import crypto from 'crypto'
type GameScores = Record<string, number>

export async function setPlayerReady(roomId: string, userId: string, isReady: boolean = true) {
  return await db.transaction(async (tx) => {
    const [room] = await tx
      .select()
      .from(gameRooms)
      .where(eq(gameRooms.id, roomId))
      .limit(1)

    if (!room) throw new Error('Room not found')
    if (!room.players) throw new Error('Invalid room state')

    const updatedPlayers = room.players.map(player => 
      player.id === userId 
        ? { ...player, is_ready: isReady }
        : player
    )

    await tx
      .update(gameRooms)
      .set({ players: updatedPlayers })
      .where(eq(gameRooms.id, roomId))

    return true
  })
}

export async function submitWord(roomId: string, userId: string, word: string) {
  return await db.transaction(async (tx) => {
    const [room] = await tx
      .select()
      .from(gameRooms)
      .where(eq(gameRooms.id, roomId))
      .limit(1)

    if (!room) throw new Error('Room not found')
    if (room.status !== 'playing') throw new Error('Game not in playing state')
    
    const currentScores = (room.currentScores as GameScores) || {}
    currentScores[userId] = (currentScores[userId] || 0) + word.length

    await tx
      .update(gameRooms)
      .set({ currentScores: currentScores as Json })
      .where(eq(gameRooms.id, roomId))

    return { score: word.length }
  })
}

export async function startGame(roomId: string, userId: string) {
  return await db.transaction(async (tx) => {
    const [room] = await tx
      .select()
      .from(gameRooms)
      .where(eq(gameRooms.id, roomId))
      .limit(1)

    if (!room) throw new Error('Room not found')
    if (!room.players) throw new Error('Invalid room state')
    if (room.createdBy !== userId) throw new Error('Only host can start game')
    if (room.status !== 'waiting') throw new Error('Game already started')

    const allPlayersReady = room.players.every(player => player.is_ready)
    if (!allPlayersReady) throw new Error('Not all players are ready')
    
    await tx
      .update(gameRooms)
      .set({ 
        status: 'playing',
        gameStartedAt: new Date(),
        currentScores: {}
      })
      .where(eq(gameRooms.id, roomId))

    return true
  })
}

export async function leaveRoom(roomId: string, userId: string) {
  return await db.transaction(async (tx) => {
    const [room] = await tx
      .select()
      .from(gameRooms)
      .where(eq(gameRooms.id, roomId))
      .limit(1)

    if (!room) throw new Error('Room not found')
    if (room.status !== 'waiting') throw new Error('Cannot leave during game')

    if (!room.players || room.players.length === 0) throw new Error('No players in the room')
    const updatedPlayers = room.players.filter(player => player.id !== userId)
    const isHost = room.createdBy === userId

    if (isHost && updatedPlayers.length > 0) {
      // Transfer host status to next player
      const newHost = updatedPlayers[0]
      await tx
        .update(gameRooms)
        .set({ 
          players: updatedPlayers,
          createdBy: newHost.id,
          hostName: newHost.name,
          playerCount: updatedPlayers.length
        })
        .where(eq(gameRooms.id, roomId))
    } else if (updatedPlayers.length === 0) {
      // Delete room if empty
      await tx
        .delete(gameRooms)
        .where(eq(gameRooms.id, roomId))
    } else {
      // Just update players
      await tx
        .update(gameRooms)
        .set({ 
          players: updatedPlayers,
          playerCount: updatedPlayers.length
        })
        .where(eq(gameRooms.id, roomId))
    }

    return true
  })
}

export async function submitFinalScore(roomId: string, userId: string, score: number, words: any[]) {
  return await db.transaction(async (tx) => {
    const [room] = await tx
      .select()
      .from(gameRooms)
      .where(eq(gameRooms.id, roomId))
      .limit(1)

    if (!room) throw new Error('Room not found')
    if (room.status !== 'playing') throw new Error('Game not in playing state')

    if (!room.players || room.players.length === 0) throw new Error('No players in the room')
    const updatedPlayers = room.players.map(player =>
      player.id === userId
        ? { ...player, score }
        : player
    )

    await tx
      .update(gameRooms)
      .set({ 
        players: updatedPlayers,
        status: 'finished',
        gameEndedAt: new Date()
      })
      .where(eq(gameRooms.id, roomId))

    // Store final words in game_actions
    await tx
      .insert(gameActions)
      .values({
        id: crypto.randomUUID(),
        playerId: userId,
        roomId,
        type: 'FINAL_SCORE',
        payload: { score, words } as Json
      })

    return true
  })
}

export async function updateGameDuration(roomId: string, userId: string, duration: number) {
  return await db.transaction(async (tx) => {
    const [room] = await tx
      .select()
      .from(gameRooms)
      .where(eq(gameRooms.id, roomId))
      .limit(1)

    if (!room) throw new Error('Room not found')
    if (room.createdBy !== userId) throw new Error('Only host can update duration')
    if (room.status !== 'waiting') throw new Error('Cannot update duration after game starts')
    if (duration < 60 || duration > 600) throw new Error('Duration must be between 60 and 600 seconds')

    await tx
      .update(gameRooms)
      .set({ gameDuration: duration })
      .where(eq(gameRooms.id, roomId))

    return true
  })
}

export async function createGameAction(action: {
  playerId: string
  roomId: string
  type: string
  payload: Json
}) {
  const id = crypto.randomUUID()
  return await db.insert(gameActions).values({
    id,
    ...action
  })
}

export async function getGameRoom(roomId: string) {
  return await db.select()
    .from(gameRooms)
    .where(eq(gameRooms.id, roomId))
    .limit(1)
}

export async function endGame(roomId: string) {
  return await db.transaction(async (tx) => {
    const [room] = await tx
      .select()
      .from(gameRooms)
      .where(eq(gameRooms.id, roomId))
      .limit(1)

    if (!room) throw new Error('Room not found')
    if (room.status !== 'playing') throw new Error('Game not in playing state')

    // Check if already in finished_game_rooms
    const [existingFinished] = await tx
      .select()
      .from(finishedGameRooms)
      .where(eq(finishedGameRooms.roomId, roomId))
      .limit(1)

    await tx
      .update(gameRooms)
      .set({ 
        status: 'finished',
        gameEndedAt: new Date()
      })
      .where(eq(gameRooms.id, roomId))

    // Only insert if not already in finished_game_rooms
    if (!existingFinished) {
      const cleanupAfter = new Date()
      cleanupAfter.setHours(cleanupAfter.getHours() + 24)
      await tx
        .insert(finishedGameRooms)
        .values({
          roomId,
          finishedAt: new Date(),
          cleanupAfter
        })
    }

    return true
  })
}

export async function updatePlayerScore(roomId: string, playerId: string, score: number) {
  return await db.transaction(async (tx) => {
    const [room] = await tx
      .select()
      .from(gameRooms)
      .where(eq(gameRooms.id, roomId))
      .limit(1)

    if (!room) throw new Error('Room not found')
    if (!room.players) throw new Error('Invalid room state')

    const updatedPlayers = room.players.map(player =>
      player.id === playerId
        ? { ...player, score }
        : player
    )

    await tx
      .update(gameRooms)
      .set({ players: updatedPlayers })
      .where(eq(gameRooms.id, roomId))

    return true
  })
} 