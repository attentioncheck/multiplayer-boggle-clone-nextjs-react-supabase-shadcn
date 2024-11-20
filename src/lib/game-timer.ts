export function calculateRemainingTime(gameStartedAt: string): number {
  const startTime = new Date(gameStartedAt).getTime();
  const currentTime = new Date().getTime();
  const elapsedTime = Math.floor((currentTime - startTime) / 1000);
  return Math.max(180 - elapsedTime, 0); // Default 3 minutes (180 seconds)
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
} 