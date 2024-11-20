import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

interface Position {
  row: number;
  col: number;
}

interface BoggleBoardProps {
  board: string[][];
  selectedLetters: Position[];
  onLetterSelect: (position: Position) => void;
  onDragStart?: (row: number, col: number) => void;
  onDragEnter?: (row: number, col: number) => void;
  onDragEnd?: () => void;
  onTouchMove?: (e: React.TouchEvent<HTMLButtonElement>) => void;
  cycleState: {
    positions: Position[];
    currentIndex: number;
  };
  feedbackType: 'success' | 'error' | null;
}

export function BoggleBoard({ 
  board, 
  selectedLetters, 
  onLetterSelect,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onTouchMove,
  cycleState,
  feedbackType
}: BoggleBoardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [touchStarted, setTouchStarted] = useState(false);

  // Clean up drag state when component unmounts or when pointer leaves window
  useEffect(() => {
    const handlePointerUp = () => {
      if (isDragging) {
        setIsDragging(false);
        onDragEnd?.();
      }
    };

    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDragging, onDragEnd]);

  const isSelected = (row: number, col: number) => 
    selectedLetters.some(pos => pos.row === row && pos.col === col);



  const handleDragStart = (row: number, col: number) => {
    setIsDragging(true);
    onDragStart?.(row, col);
  };

  const handleDragEnter = (row: number, col: number) => {
    if (!isDragging) return;
    onDragEnter?.(row, col);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd?.();
  };

  const handleTouchStart = (row: number, col: number) => {
    setTouchStarted(true);
    handleDragStart(row, col);
  };

  const gridCols = board[0]?.length || 4;
  const minSize = 60;
  const maxSize = Math.min(160, window.innerWidth / gridCols);
  const gapSize = Math.max(12, Math.min(24, window.innerWidth / 30));

  return (
    <div className="w-full flex justify-center items-center min-h-[50vh]">
      <div className="w-full max-w-[90vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] p-4">
        <div 
          className="grid mx-auto w-full"
          style={{ 
            gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
            gap: `${gapSize}px`,
          }}
        >
          {board.map((row, rowIndex) => (
            row.map((letter, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                data-pos={`${rowIndex}-${colIndex}`}
                className={`
                  aspect-square relative p-1 rounded-xl border-2 select-none
                  text-xl sm:text-2xl md:text-3xl lg:text-4xl
                  bg-gray-700 text-black dark:text-white
                  transition-all duration-200
                  ${isSelected(rowIndex, colIndex) 
                    ? 'border-blue-500 scale-105' 
                    : 'border-gray-300 hover:border-gray-400 hover:scale-105'}
                  ${feedbackType && isSelected(rowIndex, colIndex)
                    ? feedbackType === 'success'
                      ? 'bg-green-100'
                      : 'bg-red-100'
                    : ''}
                `}
                onClick={() => onLetterSelect({ row: rowIndex, col: colIndex })}
                onPointerDown={() => handleDragStart(rowIndex, colIndex)}
                onPointerEnter={() => handleDragEnter(rowIndex, colIndex)}
                onPointerUp={handleDragEnd}
                onTouchStart={() => handleTouchStart(rowIndex, colIndex)}
                onTouchMove={onTouchMove}
                onTouchEnd={handleDragEnd}
              >
                <span className="relative z-10 transform transition-transform">
                  {letter}
                </span>
                <span className="absolute bottom-1 right-1 text-[0.6em] font-medium opacity-75">
                  {getLetterPoints(letter)}
                </span>
                {isSelected(rowIndex, colIndex) && (
                  <div className="absolute inset-0 bg-blue-400 opacity-20 rounded-xl" />
                )}
              </button>
            ))
          ))}
        </div>
      </div>
    </div>
  );
}

const getLetterPoints = (letter: string) => {
  const points: { [key: string]: number } = {
    'A': 1, 'B': 3, 'C': 3, 'D': 2, 'E': 1, 'F': 4, 'G': 2, 'H': 4, 'I': 1, 'J': 8,
    'K': 5, 'L': 1, 'M': 3, 'N': 1, 'O': 1, 'P': 3, 'Qu': 10, 'R': 1, 'S': 1, 'T': 1,
    'U': 1, 'V': 4, 'W': 4, 'X': 8, 'Y': 4, 'Z': 10
  };
  return points[letter] || 1;
}; 