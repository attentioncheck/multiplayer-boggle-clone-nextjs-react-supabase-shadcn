export type ErrorType = 
  | 'AUTH_ERROR'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'DB_ERROR'
  | 'GAME_ERROR';

export class GameError extends Error {
  constructor(
    message: string,
    public type: ErrorType,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'GameError';
  }
}

export function customError(message: string, type: ErrorType, originalError?: unknown): GameError {
  return new GameError(message, type, originalError);
} 