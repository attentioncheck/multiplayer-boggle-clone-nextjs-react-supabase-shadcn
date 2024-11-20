import { db } from '../index'
import { finishedGameRooms } from '../schema'
import { eq, lte } from 'drizzle-orm'

export const markGameAsFinished = async (roomId: string, cleanupAfter: Date) => {
  return await db.insert(finishedGameRooms).values({
    roomId,
    finishedAt: new Date(),
    cleanupAfter
  })
}

export const getExpiredGameRooms = async () => {
  return await db.select()
    .from(finishedGameRooms)
    .where(lte(finishedGameRooms.cleanupAfter, new Date()))
}

export const deleteFinishedGameRoom = async (roomId: string) => {
  return await db.delete(finishedGameRooms)
    .where(eq(finishedGameRooms.roomId, roomId))
} 