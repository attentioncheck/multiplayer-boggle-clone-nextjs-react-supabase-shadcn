import { pgTable, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core'
import { type Json } from '../types/supabase'

export const gameRooms = pgTable('game_rooms', {
  id: text('id').primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  createdBy: text('created_by').notNull(),
  currentScores: jsonb('current_scores').$type<Json>().default(null),
  gameDuration: integer('game_duration').notNull().default(180),
  gameEndedAt: timestamp('game_ended_at', { withTimezone: true }),
  gameSeed: text('game_seed'),
  gameStartedAt: timestamp('game_started_at', { withTimezone: true }),
  hostName: text('host_name'),
  name: text('name').notNull(),
  maxPlayers: integer('max_players'),
  playerCount: integer('player_count'),
  players: jsonb('players').$type<{
    id: string
    name: string
    score: number
    is_ready: boolean
    is_online: boolean
  }[]>(),
  status: text('status', { enum: ['waiting', 'playing', 'finished'] }).default('waiting')
})

export const gameActions = pgTable('game_actions', {
  id: text('id').primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  playerId: text('player_id'),
  roomId: text('room_id').references(() => gameRooms.id),
  type: text('type').notNull(),
  payload: jsonb('payload').$type<Json>()
})

export const finishedGameRooms = pgTable('finished_game_rooms', {
  roomId: text('room_id').primaryKey(),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
  cleanupAfter: timestamp('cleanup_after', { withTimezone: true })
})
