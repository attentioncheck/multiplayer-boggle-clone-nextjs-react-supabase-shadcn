import { db } from '../index'
import { gameRooms } from '../schema'
import { eq, desc } from 'drizzle-orm'

export const getGameRoom = async (id: string) => {
  return await db.select().from(gameRooms).where(eq(gameRooms.id, id)).limit(1)
}

export const getWaitingRooms = async (limit: number = 20, offset: number = 0) => {
  return await db.select()
    .from(gameRooms)
    .where(eq(gameRooms.status, 'waiting'))
    .orderBy(desc(gameRooms.createdAt))
    .limit(limit)
    .offset(offset)
}

export const createGameRoom = async ({
  id,
  createdBy,
  name,
  hostName,
  maxPlayers,
  players,
  gameSeed
}: {
  id: string
  createdBy: string
  name: string
  hostName: string
  maxPlayers: number
  gameSeed: string
  players: {
    id: string
    name: string
    score: number
    is_ready: boolean
    is_online: boolean
  }[]
}) => {
  return await db.insert(gameRooms).values({
    id,
    createdBy,
    name,
    hostName,
    maxPlayers,
    players,
    gameSeed,
    status: 'waiting',
    gameDuration: 180,
    playerCount: 1
  })
}

export const updateGameRoom = async (id: string, data: Partial<typeof gameRooms.$inferInsert>) => {
  return await db.update(gameRooms)
    .set(data)
    .where(eq(gameRooms.id, id))
}

export const deleteGameRoom = async (id: string) => {
  return await db.delete(gameRooms)
    .where(eq(gameRooms.id, id))
}

export const updatePlayerScore = async (roomId: string, playerId: string, score: number) => {
  const [room] = await getGameRoom(roomId)
  if (!room) throw new Error('Room not found')
  const updatedScores = Object.assign({}, room.currentScores, { [playerId]: score });
  return await db.update(gameRooms)
    .set({ currentScores: updatedScores })
    .where(eq(gameRooms.id, roomId))
}

export const updateRoom = async (roomId: string, updates: Partial<typeof gameRooms.$inferInsert>) => {
  return await db.update(gameRooms)
    .set(updates)
    .where(eq(gameRooms.id, roomId))
} 