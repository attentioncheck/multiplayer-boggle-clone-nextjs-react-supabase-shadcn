'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { calculateRemainingTime, formatTime } from '@/lib/game-timer';
import { endGame } from '@/app/boggle/rooms/gameactions';

interface GameTimerProps {
  gameStartedAt: string;
  gameDuration: number;
  roomId: string;
}

export function GameTimer({ gameStartedAt, gameDuration, roomId }: GameTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(gameDuration);
  const router = useRouter();

  const handleGameEnd = useCallback(async () => {
    try {
      await endGame(roomId)
      router.push(`/boggle/rooms/${roomId}/results`)
    } catch (error) {
      console.error('Failed to end game:', error)
    }
  }, [roomId, router]);

  useEffect(() => {
    if (!gameStartedAt) return;

    const interval = setInterval(() => {
      const remaining = calculateRemainingTime(gameStartedAt);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        handleGameEnd();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameStartedAt, gameDuration, handleGameEnd]);

  return (
    <Card className="p-4 mb-4">
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold">Time Remaining:</span>
        <span className="text-2xl font-bold text-blue-600">
          {formatTime(timeRemaining)}
        </span>
      </div>
    </Card>
  );
} 