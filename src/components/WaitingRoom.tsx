'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRoomStore } from '@/stores/roomStore'
import { useDebouncedCallback } from 'use-debounce'
import { useRef } from "react";
import { Check, X } from 'lucide-react'

interface CounterProps {
  message: string;
}

export const Counter = (props: CounterProps) => {
    const renderCounter = useRef(0);
    
    useEffect(() => {
        renderCounter.current = renderCounter.current + 1;
    });
    
    return <h1>Renders: {renderCounter.current}, {props.message}</h1>;
};

interface WaitingRoomProps {
  roomId: string
  isHost: boolean
  initialState?: any
}

export function WaitingRoom({ roomId, isHost, initialState }: WaitingRoomProps) {
  const router = useRouter()
  const {
    players,
    isHost: storeIsHost,
    currentUserId,
    initializeRoom,
    subscribeToRoom,
    unsubscribeFromRoom,
    updatePlayerStatus,
    leaveRoom,
    setIsHost,
    startGame
  } = useRoomStore()

  useEffect(() => {
    if (initialState) {
      initializeRoom(roomId, initialState)
    } else {
      setIsHost(isHost)
    }
    subscribeToRoom(roomId)
    return () => unsubscribeFromRoom()
  }, [roomId, initialState, isHost, initializeRoom, subscribeToRoom, unsubscribeFromRoom, setIsHost])

  useEffect(() => {
    return () => {
      // Cleanup on component unmount
      unsubscribeFromRoom();
    };
  }, [unsubscribeFromRoom]);

  const debouncedLeaveRoom = useDebouncedCallback(async () => {
    try {
      await leaveRoom();
      router.push('/boggle/rooms');
    } catch (error) {
      console.error('Failed to leave room:', error);
    }
  }, 300);

  const debouncedSetPlayerReady = useDebouncedCallback(async () => {
    const currentPlayer = players.find(p => p.id === currentUserId);
    if (currentPlayer) {
      try {
        await updatePlayerStatus(currentUserId!, !currentPlayer.is_ready);
      } catch (error) {
        console.error('Failed to update ready status:', error);
      }
    }
  }, 300);

  const debouncedStartGame = useDebouncedCallback(async () => {
    try {
      await startGame();
      router.push(`/boggle/rooms/${roomId}/play`);
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  }, 300);

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow">
      <Counter message="Hello" />
      <h2 className="text-2xl font-bold text-gray-900">Waiting Room</h2>
      
      {/* Player List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Players</h3>
        <ul className="divide-y divide-gray-200">
          {players?.map((player) => (
            <li 
              key={player.id} 
              className="py-3 flex justify-between items-center"
            >
              <div className="flex items-center space-x-3">
                <span className="text-gray-900">{player.name}</span>
                {player.is_host && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                    Host
                  </span>
                )}
                {player.is_ready ? (
                  <span className="flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                    <Check className="w-3 h-3 mr-1" />
                    Ready
                  </span>
                ) : (
                  <span className="flex items-center px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                    <X className="w-3 h-3 mr-1" />
                    Not Ready
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={debouncedLeaveRoom}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
        >
          Leave Room
        </button>
        {players?.length > 0 && (
          players.find(p => p.id === currentUserId)?.is_ready ? (
            <button
              onClick={debouncedSetPlayerReady}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Not Ready
            </button>
          ) : (
            <button
              onClick={debouncedSetPlayerReady}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Ready
            </button>
          )
        )}
        {storeIsHost && players?.every(p => p.is_ready) && (
          <button
            onClick={debouncedStartGame}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Start Game
          </button>
        )}
      </div>
    </div>
  )
}