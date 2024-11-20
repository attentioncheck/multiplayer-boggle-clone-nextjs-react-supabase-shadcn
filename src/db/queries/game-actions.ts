import { db } from '../index'
import { gameActions } from '../schema'
import { eq, and, desc } from 'drizzle-orm'
import { type Json } from '../../types/supabase'

export const createGameAction = async ({
  id,
  playerId,
  roomId,
  type,
  payload
}: {
  id: string
  playerId: string
  roomId: string
  type: string
  payload: Json
}) => {
  return await db.insert(gameActions).values({
    id,
    playerId,
    roomId,
    type,
    payload
  })
}

export const getGameActions = async (roomId: string) => {
  return await db.select()
    .from(gameActions)
    .where(eq(gameActions.roomId, roomId))
    .orderBy(desc(gameActions.createdAt))
}

export const deleteGameActions = async (roomId: string) => {
  return await db.delete(gameActions)
    .where(eq(gameActions.roomId, roomId))
} 