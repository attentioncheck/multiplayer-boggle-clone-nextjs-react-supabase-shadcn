'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { WaitingRoom } from '@/components/WaitingRoom'
import type { GameRoom } from '@/types/types'
import { createClient } from '@/app/utils/supabase/client'
import { useDebouncedCallback } from 'use-debounce'
import { useRoomStore } from '@/stores/roomStore'

export default function RoomsList() {
  const router = useRouter()
  const [rooms, setRooms] = useState<GameRoom[]>([])
  const [roomName, setRoomName] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentRoom, setCurrentRoom] = useState<{ id: string; isHost: boolean } | null>(null)

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const response = await fetch('/api/rooms/waiting')
        const waitingRooms = await response.json()
        setRooms(waitingRooms)
      } catch (error) {
        console.error('Failed to load rooms:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRooms()
    const interval = setInterval(loadRooms, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const checkExistingRoom = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const response = await fetch('/api/rooms/waiting')
        const existingRooms = await response.json() as GameRoom[]
        const userRoom = existingRooms.find((room: GameRoom) => 
          room.players?.some((p: { id: string }) => p.id === user.id)
        )

        if (userRoom) {
          router.push(`/boggle/rooms/${userRoom.id}/setup`)
        }
      } catch (error) {
        console.error('Failed to check existing room:', error)
      }
    }

    checkExistingRoom()
  }, [router])

  const debouncedCreateRoom = useDebouncedCallback(
    async (name: string) => {
      if (name.trim()) {
        try {
          const roomId = crypto.randomUUID()
          setCurrentRoom({ id: roomId, isHost: true })
          
          // Create room in store first (which will handle optimistic updates)
          await useRoomStore.getState().createRoom(name.trim(), roomId)
          
          // Then route to the setup page
          router.push(`/boggle/rooms/${roomId}/setup`)
        } catch (error) {
          console.error('Network error:', error)
          router.push('/boggle/rooms')
        }
      }
    },
    500
  )

  const debouncedJoinRoom = useDebouncedCallback(
    async (roomId: string) => {
      try {
        const response = await fetch(`/api/rooms/${roomId}/join`, {
          method: 'POST',
        })
        
        if (response.ok) {
          router.push(`/boggle/rooms/${roomId}/setup`)
        }
      } catch (error) {
        console.error('Failed to join room:', error)
      }
    },
    300
  )

  const handleCreateRoom = () => {
    debouncedCreateRoom(roomName)
  }

  const handleJoinRoom = (roomId: string) => {
    debouncedJoinRoom(roomId)
  }

  if (currentRoom && window.location.pathname !== '/boggle/rooms') {
    return (
      <WaitingRoom
        roomId={currentRoom.id}
        isHost={currentRoom.isHost}
      />
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="dark:text-white">Create Room</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Input
            className="dark:bg-gray-800 dark:text-white dark:border-gray-700"
            placeholder="Room name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <Button 
            className="dark:bg-blue-600 dark:hover:bg-blue-700" 
            onClick={handleCreateRoom}
          >
            Create
          </Button>
        </CardContent>
      </Card>

      <Card className="dark:bg-gray-900">
        <CardHeader>
          <CardTitle className="dark:text-white">Available Rooms</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="dark:text-gray-300">Loading rooms...</div>
          ) : rooms.length === 0 ? (
            <div className="dark:text-gray-300">No rooms available</div>
          ) : (
            <div className="grid gap-4">
              {rooms.map((room) => (
                <div 
                  key={room.id} 
                  className="flex items-center justify-between p-4 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                >
                  <div>
                    <div className="font-semibold dark:text-white">{room.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Host: {room.hostName}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Players: {room.playerCount}/{room.maxPlayers}
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleJoinRoom(room.id)}
                    className="dark:bg-blue-600 dark:hover:bg-blue-700"
                  >
                    Join
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 