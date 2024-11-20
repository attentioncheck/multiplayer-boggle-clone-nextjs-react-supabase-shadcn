// src/stores/roomStore.ts

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { createClient } from '@/app/utils/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { GameRoomService } from '@/services/game-room.service';
import { startGameAction } from '@/app/actions/game'

interface Player {
  id: string;
  name: string;
  is_ready: boolean;
  is_host: boolean;
  score: number;
}

interface RoomState {
  roomId: string | null;
  players: Player[];
  status: 'waiting' | 'playing' | 'finished';
  currentUserId: string | null;
  isHost: boolean;
  channel: RealtimeChannel | null;
  
  // Actions
  createRoom: (name: string, roomId: string) => Promise<void>;
  joinRoom: (roomId: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  initializeRoom: (roomId: string, initialState: any) => void;
  setPlayers: (players: Player[]) => void;
  updatePlayerStatus: (playerId: string, isReady: boolean) => Promise<void>;
  setGameStatus: (status: 'waiting' | 'playing' | 'finished') => void;
  startGame: () => Promise<void>;
  subscribeToRoom: (roomId: string) => void;
  unsubscribeFromRoom: () => void;
  setIsHost: (isHost: boolean) => void;
}

export const useRoomStore = create<RoomState>()(
  subscribeWithSelector((set, get) => ({
    roomId: null,
    players: [],
    status: 'waiting',
    currentUserId: null,
    isHost: false,
    channel: null,

    createRoom: async (name: string, roomId: string) => {
      
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('Not authenticated')
      
      // Optimistically set local state
      const playerName = user.email?.split('@')[0] || 'Anonymous'
      const optimisticRoom: Partial<RoomState> = {
        roomId,
        players: [{
          id: user.id,
          name: playerName,
          score: 0,
          is_ready: false,
          is_host: true
        }],
        status: 'waiting',
        currentUserId: user.id,
        isHost: true,
        channel: null
      }
      
      set(optimisticRoom)

      try {
        const response = await fetch('/api/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, roomId })
        })
        
        if (!response.ok) throw new Error('Failed to create room')
        const room = await response.json()
        
        // Update with actual server data
        set({
          roomId: room.id,
          players: room.players,
          status: room.status as 'waiting' | 'playing' | 'finished',
          currentUserId: room.currentUserId,
          isHost: room.isHost
        })
        
        return room
      } catch (error) {
        // Revert optimistic update on error
        set({
          roomId: null,
          players: [],
          status: 'waiting',
          currentUserId: null,
          isHost: false,
          channel: null
        })
        throw error
      }
    },

    joinRoom: async (roomId: string) => {
      try {
        const response = await fetch(`/api/rooms/${roomId}/join`, {
          method: 'POST'
        });
        
        if (!response.ok) throw new Error('Failed to join room');
        const room = await response.json();
        
        set({
          roomId: room.id,
          players: room.players,
          status: room.status,
          currentUserId: room.currentUserId,
          isHost: false
        });
      } catch (error) {
        console.error('Failed to join room:', error);
        throw error;
      }
    },

    leaveRoom: async () => {
      const { roomId, currentUserId, channel } = get();
      if (!roomId || !currentUserId) return;

      try {
        await fetch(`/api/rooms/${roomId}/leave`, {
          method: 'POST'
        });
        
        // Broadcast player leave to other clients
        channel?.send({
          type: 'broadcast',
          event: 'player_leave',
          payload: {
            playerId: currentUserId
          }
        });
        
        get().unsubscribeFromRoom();
        
        set({
          roomId: null,
          players: [],
          status: 'waiting',
          isHost: false,
          currentUserId: null,
          channel: null
        });
      } catch (error) {
        console.error('Failed to leave room:', error);
        throw error;
      }
    },

    initializeRoom: (roomId, initialState) => {
      const currentPlayer = initialState.players.find(
        (p: Player) => p.id === initialState.currentUserId
      );
      
      const updatedPlayers = initialState.players.map((player: Player) => ({
        ...player,
        is_host: player.id === initialState.createdBy
      }));
      
      set({
        roomId,
        players: updatedPlayers,
        status: initialState.status,
        currentUserId: initialState.currentUserId,
        isHost: currentPlayer?.is_host || false
      });
    },

    setPlayers: (players) => set({ players }),

    updatePlayerStatus: async (playerId, isReady) => {
      const { roomId, channel } = get();
      if (!roomId) return;

      try {
        // Optimistically update UI
        set((state) => ({
          players: state.players.map(player =>
            player.id === playerId ? { ...player, is_ready: isReady } : player
          )
        }));

        const response = await fetch(`/api/rooms/${roomId}/ready`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isReady })
        });

        if (!response.ok) {
          // Revert on failure
          set((state) => ({
            players: state.players.map(player =>
              player.id === playerId ? { ...player, is_ready: !isReady } : player
            )
          }));
          throw new Error('Failed to update ready status');
        }

        // Broadcast the change to other clients
        channel?.send({
          type: 'broadcast',
          event: 'player_ready',
          payload: {
            players: get().players
          }
        });
      } catch (error) {
        console.error('Failed to update player status:', error);
        throw error;
      }
    },

    startGame: async () => {
      const { roomId, channel } = get();
      if (!roomId) return;

      try {
        await startGameAction(roomId);
        set({ status: 'playing' });
        
        channel?.send({
          type: 'broadcast',
          event: 'game_start',
          payload: {
            status: 'playing'
          }
        });
      } catch (error) {
        console.error('Failed to start game:', error);
        throw error;
      }
    },

    setGameStatus: (status) => set({ status }),

    subscribeToRoom: (roomId) => {
      const supabase = createClient();
      const channel = supabase.channel(`room:${roomId}`)
        .on('presence', { event: 'sync' }, () => {
          // Handle presence sync
        })
        .on('broadcast', { event: 'player_ready' }, ({ payload }) => {
          get().setPlayers(payload.players);
        })
        .on('broadcast', { event: 'game_start' }, () => {
          get().setGameStatus('playing');
          window.location.href = `/boggle/rooms/${roomId}/play`;
        })
        .on('broadcast', { event: 'player_leave' }, ({ payload }) => {
          // Update players list when someone leaves
          set((state) => ({
            players: state.players.filter(p => p.id !== payload.playerId)
          }));
        })
        .subscribe();

      set({ channel });
    },

    unsubscribeFromRoom: () => {
      const { channel } = get();
      if (channel) {
        channel.unsubscribe();
        set({ channel: null });
      }
    },

    setIsHost: (isHost: boolean) => set({ isHost }),
  }))
);
