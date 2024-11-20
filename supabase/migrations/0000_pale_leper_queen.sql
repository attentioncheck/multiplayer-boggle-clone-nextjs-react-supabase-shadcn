CREATE TABLE IF NOT EXISTS "finished_game_rooms" (
	"room_id" text PRIMARY KEY NOT NULL,
	"finished_at" timestamp,
	"cleanup_after" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "game_actions" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"player_id" text,
	"room_id" text,
	"type" text NOT NULL,
	"payload" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "game_rooms" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"created_by" text NOT NULL,
	"current_scores" jsonb DEFAULT 'null'::jsonb,
	"game_duration" integer DEFAULT 180,
	"game_ended_at" timestamp,
	"game_seed" text,
	"game_started_at" timestamp,
	"host_name" text,
	"name" text NOT NULL,
	"max_players" integer,
	"player_count" integer,
	"players" jsonb,
	"status" text DEFAULT 'waiting'
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "game_actions" ADD CONSTRAINT "game_actions_room_id_game_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."game_rooms"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
