import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface GameReadyModalProps {
  isOpen: boolean
  players: Array<{
    id: string
    name: string
    isReady: boolean
  }>
  onReady: () => Promise<void>
}

export function GameReadyModal({ isOpen, players, onReady }: GameReadyModalProps) {
  const [loading, setLoading] = useState(false)

  const handleReady = async () => {
    setLoading(true)
    await onReady()
    setLoading(false)
  }

  return (
    <Dialog open={isOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Waiting for players...</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2">
            {players.map(player => (
              <div key={player.id} className="flex items-center justify-between">
                <span>{player.name}</span>
                {player.isReady ? (
                  <span className="text-green-500">Ready</span>
                ) : (
                  <span className="text-yellow-500">Not Ready</span>
                )}
              </div>
            ))}
          </div>
          <Button 
            onClick={handleReady} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              'Ready'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 