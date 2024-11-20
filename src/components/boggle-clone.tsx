// 'use client'

// import { useState, useEffect, useCallback, useRef } from 'react'
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Dictionary } from '@/lib/dictionary'
// import { 
//   BOGGLE_DICE, 
//   WORD_LENGTH_MULTIPLIERS, 
//   saveGameState, 
//   loadGameState, 

//   generateBoardFromSeed,
//   hashString,

//   generateValidatedBodleBoard,
// } from '@/lib/boggle-utils'
// import { useRouter, useSearchParams } from 'next/navigation'
// import { Label } from "@/components/ui/label"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"

// const letterPoints: { [key: string]: number } = {
//   'A': 1, 'B': 3, 'C': 3, 'D': 2, 'E': 1, 'F': 4, 'G': 2, 'H': 4, 'I': 1, 'J': 8,
//   'K': 5, 'L': 1, 'M': 3, 'N': 1, 'O': 1, 'P': 3, 'Qu': 10, 'R': 1, 'S': 1, 'T': 1,
//   'U': 1, 'V': 4, 'W': 4, 'X': 8, 'Y': 4, 'Z': 10
// }

// export function BoggleCloneComponent() {
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const seed = searchParams.get('seed')

//   const [board, setBoard] = useState<string[][]>([])
//   const [timer, setTimer] = useState(180) // 3 minutes
//   const [selectedLetters, setSelectedLetters] = useState<{row: number, col: number}[]>([])
//   const [currentWord, setCurrentWord] = useState('')
//   const [foundWords, setFoundWords] = useState<{word: string, points: number}[]>([])
//   const [score, setScore] = useState(0)
//   const [dictionary] = useState(new Dictionary())
//   const [isLoading, setIsLoading] = useState(true)
//   const [possibleWords, setPossibleWords] = useState<string[]>([])



//   // State to track cycleable positions and current index
//   const [cycleState, setCycleState] = useState<{
//     positions: { row: number; col: number }[];
//     currentIndex: number;
//   }>({ positions: [], currentIndex: 0 });

//   // Add new state for drag tracking
//   const [isDragging, setIsDragging] = useState(false)

//   const [gameMode, setGameMode] = useState<'classic' | 'bodle'>('classic')

//   const [targetWord, setTargetWord] = useState<string>('');
//   const [letterStates, setLetterStates] = useState<{
//     [key: string]: { pos: { row: number; col: number }; state: 'default' | 'yellow' | 'green' }[]
//   }>({}); 
//   const [showSuccessModal, setShowSuccessModal] = useState(false);

//   // Add new state for remaining guesses
//   const [remainingGuesses, setRemainingGuesses] = useState<number>(10);

//   // Add new state for game over modal
//   const [showGameOverModal, setShowGameOverModal] = useState(false);

//   const generateNewBoard = useCallback(async () => {
//     if (gameMode === 'classic') {
//       const newSeed = hashString(Date.now().toString())
//       router.replace(`/games/boggle-clone?seed=${newSeed}&mode=classic`, { scroll: false })
//       const validatedBoard = await generateBoardFromSeed(newSeed, dictionary)
//       setBoard(validatedBoard.board)
//       setPossibleWords(validatedBoard.possibleWords)
//     } else {
//       // Bodle mode
//       const validatedBoard = await generateValidatedBodleBoard(dictionary);
//       router.replace(`/games/boggle-clone?mode=bodle`, { scroll: false });
//       setBoard(validatedBoard.board);
//       setPossibleWords(validatedBoard.possibleWords);
//       setTargetWord(validatedBoard.targetWord);
//       setLetterStates({});
//       setRemainingGuesses(10); // Reset guesses
//     }
    
//     setTimer(180);
//     setFoundWords([]);
//     setSelectedLetters([]);
//     setCurrentWord('');
//     setScore(0);
//   }, [dictionary, router, gameMode]);

//   useEffect(() => {
//     const initGame = async () => {
//       await dictionary.initialize()
//       const savedState = loadGameState()
//       if (savedState) {
//         setScore(savedState.score)
//         setFoundWords(savedState.foundWords)
//       }
//       setIsLoading(false)
//     }
//     initGame()
//   }, [dictionary])

//   useEffect(() => {
//     if (timer > 0) {
//       const timerId = setTimeout(() => setTimer(timer - 1), 1000)
//       return () => clearTimeout(timerId)
//     } else {
//       saveGameState({
//         score,
//         foundWords,
//         startTime: Date.now(),
//         highScores: []
//       })
//       setSelectedLetters([])
//       setCurrentWord('')
//       // Show game over modal if in Bodle mode
//       if (gameMode === 'bodle') {
//         setShowGameOverModal(true);
//       }
//     }
//   }, [timer, score, foundWords, gameMode])

//   useEffect(() => {
//     if (!isLoading) {
//       const initBoard = async () => {
//         const modeParam = searchParams.get('mode') || 'classic'
        
        
//         // Update game mode from URL only on initial load
//         if (gameMode !== modeParam) {
//           setGameMode(modeParam as 'classic' | 'bodle')
//         }
        
//         if (modeParam === 'classic') {
//           if (seed) {
//             const validatedBoard = await generateBoardFromSeed(seed, dictionary)
//             setBoard(validatedBoard.board)
//             setPossibleWords(validatedBoard.possibleWords)
//           } else {
//             await generateNewBoard()
//           }
//         } else if (modeParam === 'bodle') {
//           const validatedBoard = await generateValidatedBodleBoard(dictionary)
//           console.log('Bodle board generated:', validatedBoard);
//           setBoard(validatedBoard.board)
//           setPossibleWords(validatedBoard.possibleWords)
//           setTargetWord(validatedBoard.targetWord)
//         }
//       }
//       initBoard()
//     }
//   }, [isLoading, seed, dictionary, generateNewBoard, searchParams, gameMode])

//   const calculateWordPoints = useCallback((word: string) => {
//     const basePoints = word.split('').reduce((sum, letter) => sum + letterPoints[letter], 0)
//     const multiplier = WORD_LENGTH_MULTIPLIERS[word.length] || WORD_LENGTH_MULTIPLIERS[8]
//     return basePoints * multiplier
//   }, [])

//   const submitWord = useCallback(() => {
//     if (currentWord.length >= 3 && 
//         !foundWords.some(w => w.word === currentWord) && 
//         dictionary.isValidWord(currentWord)) {
      
//       if (gameMode === 'bodle') {
//         if (remainingGuesses <= 0) {
//           // No more guesses left
//           return;
//         }
        
//         // Decrease remaining guesses
//         setRemainingGuesses(prev => prev - 1);
        
//         const newLetterStates = { ...letterStates };
        
//         if (currentWord === targetWord) {
//           // Word matches target - all letters green
//           currentWord.split('').forEach(letter => {
//             newLetterStates[letter] = newLetterStates[letter].map(state => ({ ...state, state: 'green' }))
//           });
//           setShowSuccessModal(true);
//         } else {
//           // Check for correct letters in any position
//           currentWord.split('').forEach(letter => {
//             if (targetWord.includes(letter) && !newLetterStates[letter].some(state => state.state === 'green')) {
//               newLetterStates[letter] = newLetterStates[letter].map(state => ({ ...state, state: 'yellow' }))
//             }
//           });
          
//           // If no more guesses left after this one, show game over
//           if (remainingGuesses <= 1) {
//             setTimeout(() => {
//               alert(`Game Over! The word was: ${targetWord}`);
//               generateNewBoard();
//             }, 500);
//           }
//         }
        
//         setLetterStates(newLetterStates);
//       }
      
//       const wordPoints = calculateWordPoints(currentWord);
//       setFoundWords(prev => [...prev, { word: currentWord, points: wordPoints }]);
//       setScore(prevScore => prevScore + wordPoints);
//     }
    
//     setSelectedLetters([]);
//     setCurrentWord('');
//     setCycleState({ positions: [], currentIndex: 0 });
//   }, [currentWord, dictionary, foundWords, gameMode, targetWord, letterStates, remainingGuesses, calculateWordPoints, generateNewBoard]);

 

//   const findAndSelectLetter = useCallback((letter: string) => {
//     const lastSelected = selectedLetters[selectedLetters.length - 1];
//     let possiblePositions: { row: number; col: number }[] = [];

//     // Find all possible positions for this letter
//     for (let i = 0; i < board.length; i++) {
//       for (let j = 0; j < board[i].length; j++) {
//         if (board[i][j] === letter && 
//             !selectedLetters.some(pos => pos.row === i && pos.col === j) &&
//             (!lastSelected || 
//               (Math.abs(lastSelected.row - i) <= 1 && Math.abs(lastSelected.col - j) <= 1))) {
//           possiblePositions.push({ row: i, col: j });
//         }
//       }
//     }

//     if (possiblePositions.length > 0) {
//       const newSelectedLetters = [...selectedLetters, possiblePositions[0]];
//       setSelectedLetters(newSelectedLetters);
//       setCurrentWord(newSelectedLetters.map(pos => board[pos.row][pos.col]).join(''));
//       setCycleState({ positions: possiblePositions, currentIndex: 0 });
//     } else {
//       setCycleState({ positions: [], currentIndex: 0 });
//     }
//   }, [board, selectedLetters, setSelectedLetters, setCurrentWord, setCycleState]);

//   useEffect(() => {
//     const handleKeyPress = (e: KeyboardEvent) => {
//       if (timer === 0) return;

//       if (e.key === 'Enter') {
//         submitWord();
//         return;
//       }

//       if (e.key === 'Backspace') {
//         if (selectedLetters.length > 0) {
//           const newSelectedLetters = selectedLetters.slice(0, -1);
//           setSelectedLetters(newSelectedLetters);
//           setCurrentWord(newSelectedLetters.map(pos => board[pos.row][pos.col]).join(''));
//           setCycleState({ positions: [], currentIndex: 0 });
//         }
//         return;
//       }

//       // Replace Tab with Arrow Keys
//       if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
//         e.preventDefault();
//         if (cycleState.positions.length > 0) {
//           const baseLetters = selectedLetters.slice(0, -1);
//           const newIndex = (cycleState.currentIndex + 1) % cycleState.positions.length;
//           const newPos = cycleState.positions[newIndex];

//           setSelectedLetters([...baseLetters, newPos]);
//           setCurrentWord([...baseLetters, newPos].map(pos => board[pos.row][pos.col]).join(''));
//           setCycleState({ ...cycleState, currentIndex: newIndex });
//         }
//         return;
//       }

//       // Add reverse cycling with left/up arrows
//       if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
//         console.log('ArrowLeft or ArrowUp')
//         e.preventDefault();
//         if (cycleState.positions.length > 0) {
//           const baseLetters = selectedLetters.slice(0, -1);
//           const newIndex = cycleState.currentIndex === 0 
//             ? cycleState.positions.length - 1 
//             : cycleState.currentIndex - 1;
//           const newPos = cycleState.positions[newIndex];

//           setSelectedLetters([...baseLetters, newPos]);
//           setCurrentWord([...baseLetters, newPos].map(pos => board[pos.row][pos.col]).join(''));
//           setCycleState({ ...cycleState, currentIndex: newIndex });
//         }
//         return;
//       }

//       const key = e.key.toUpperCase();
//       if (key === 'Q') {
//         findAndSelectLetter('Qu');
//         return;
//       }

//       if (/^[A-Z]$/.test(key)) {
//         findAndSelectLetter(key);
//       }
//     };

//     window.addEventListener('keydown', handleKeyPress);
//     return () => window.removeEventListener('keydown', handleKeyPress);
//   }, [board, selectedLetters, submitWord, timer, cycleState, findAndSelectLetter]);

//   // Add new handlers for drag functionality
//   const handleDragStart = (row: number, col: number) => {
//     if (timer === 0) return
//     setIsDragging(true)
//     handleLetterSelection(row, col)
//   }

//   const handleDragEnter = (row: number, col: number) => {
//     if (!isDragging) return
//     handleLetterSelection(row, col)
//   }

//   const handleDragEnd = () => {
//     setIsDragging(false)
    
//     // If word is too short, just reset
//     if (currentWord.length < 3) {
//       setSelectedLetters([])
//       setCurrentWord('')
//       return
//     }

//     // Otherwise submit the word
//     submitWord()
//   }

//   const handleTouchMove = (e: React.TouchEvent) => {
//     if (!isDragging) return
    
//     const touch = e.touches[0]
//     const targetElement = document.elementFromPoint(touch.clientX, touch.clientY)
    
//     if (targetElement && targetElement instanceof HTMLElement) {
//       const pos = targetElement.getAttribute('data-pos')
//       if (pos) {
//         const [rowStr, colStr] = pos.split('-')
//         handleLetterSelection(parseInt(rowStr, 10), parseInt(colStr, 10))
//       }
//     }
//   }

//   const handleLetterSelection = (row: number, col: number) => {
//     const isAdjacent = (prev: {row: number, col: number}) => {
//       return Math.abs(prev.row - row) <= 1 && Math.abs(prev.col - col) <= 1
//     }

//     const isAlreadySelected = selectedLetters.some(
//       pos => pos.row === row && pos.col === col
//     )

//     if (!isAlreadySelected && 
//         (selectedLetters.length === 0 || isAdjacent(selectedLetters[selectedLetters.length - 1]))) {
//       const newSelectedLetters = [...selectedLetters, {row, col}]
//       setSelectedLetters(newSelectedLetters)
//       setCurrentWord(newSelectedLetters.map(pos => board[pos.row][pos.col]).join(''))
//     }
//   }

//   // Update cleanup effect for drag state
//   useEffect(() => {
//     const handleWindowMouseUp = () => {
//       if (isDragging) {
//         setIsDragging(false)
        
//         // If word is too short, just reset
//         if (currentWord.length < 3) {
//           setSelectedLetters([])
//           setCurrentWord('')
//           return
//         }

//         // Otherwise submit the word
//         submitWord()
//       }
//     }

//     window.addEventListener('mouseup', handleWindowMouseUp)
//     window.addEventListener('touchend', handleWindowMouseUp)

//     return () => {
//       window.removeEventListener('mouseup', handleWindowMouseUp)
//       window.removeEventListener('touchend', handleWindowMouseUp)
//     }
//   }, [isDragging, currentWord.length, submitWord])

//   if (isLoading) {
//     return <div>Loading dictionary...</div>
//   }

//   const SuccessModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
//     if (!isOpen) return null;
    
//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//         <div className="bg-white p-8 rounded-lg shadow-xl">
//           <h2 className="text-2xl font-bold mb-4">Congratulations!</h2>
//           <p className="mb-6">You found the target word!</p>
//           <Button onClick={onClose}>Play Again</Button>
//         </div>
//       </div>
//     );
//   };

//   const GameOverModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
//     if (!isOpen) return null;
    
//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//         <div className="bg-white p-8 rounded-lg shadow-xl">
//           <h2 className="text-2xl font-bold mb-4">Times Up!</h2>
//           <p className="mb-6">The word was: <span className="font-bold">{targetWord}</span></p>
//           <Button onClick={onClose}>Play Again</Button>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <>
//       <div className="min-h-screen bg-gray-100 p-8">
//         <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Main Game Board - Left Column */}
//           <div className="lg:col-span-2">
//             <Card className="h-full">
//               <CardHeader>
//                 <CardTitle className="text-3xl font-bold text-center">Boggle Clone</CardTitle>
//                 <div className="flex justify-between items-center mt-4">
//                   <div className="text-xl font-semibold">
//                     Time: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
//                   </div>
//                   <div className="text-xl font-semibold">
//                     Score: {score}
//                   </div>
//                 </div>
//               </CardHeader>
//               <CardContent className="space-y-6">
//                 {/* Game Grid - Made Larger */}
//                 <div className="grid grid-cols-4 gap-6 max-w-2xl mx-auto p-4">
//                   {board.map((row, i) =>
//                     row.map((letter, j) => (
//                       <button
//                         key={`${i}-${j}`}
//                         data-pos={`${i}-${j}`}
//                         className={`aspect-square border-2 rounded-lg flex flex-col items-center justify-center text-4xl font-bold transition-all transform hover:scale-105 relative
//                           p-6 m-1
//                           ${selectedLetters.some(pos => pos.row === i && pos.col === j) 
//                             ? 'bg-blue-200 border-blue-600 border-4 shadow-lg' 
//                             : letterStates[letter]?.some(state => state.state === 'green')
//                             ? 'bg-green-200 border-green-600'
//                             : letterStates[letter]?.some(state => state.state === 'yellow')
//                             ? 'bg-yellow-200 border-yellow-600'
//                             : 'bg-white border-gray-300 hover:bg-gray-100 hover:shadow-md'}
//                           ${cycleState.positions.some(pos => pos.row === i && pos.col === j) ? 'cycle-available' : ''}
//                           ${cycleState.positions[cycleState.currentIndex]?.row === i && cycleState.positions[cycleState.currentIndex]?.col === j ? 'cycle-current' : ''}
//                         `}
//                         onMouseDown={() => handleDragStart(i, j)}
//                         onTouchStart={() => handleDragStart(i, j)}
//                         onMouseEnter={() => handleDragEnter(i, j)}
//                         onTouchMove={handleTouchMove}
//                         onMouseUp={handleDragEnd}
//                         onTouchEnd={handleDragEnd}
//                         disabled={timer === 0}
//                       >
//                         <div className="absolute inset-0" />
//                         <span className="relative z-10">{letter}</span>
//                         <span className="text-sm mt-1 text-gray-600 relative z-10">{letterPoints[letter]}</span>
//                       </button>
//                     ))
//                   )}
//                 </div>

//                 {/* Word Input Area */}
//                 <div className="flex space-x-4 max-w-2xl mx-auto">
//                   <div className="flex-grow p-4 bg-white border border-gray-300 rounded-lg text-2xl font-semibold min-h-[60px] flex items-center relative">
//                     {currentWord}
//                   </div>
//                   <Button 
//                     onClick={submitWord} 
//                     disabled={timer === 0}
//                     className="text-lg px-8"
//                   >
//                     Submit
//                   </Button>
//                 </div>
                
//                 <h3 className="text-center text-sm text-gray-500">
//                   Type letters or click/drag • Enter to submit • Backspace to delete • arrow keys to cycle options
//                 </h3>
//               </CardContent>
//             </Card>
//           </div>

//           {/* Stats & Controls - Right Column */}
//           <div className="space-y-6">
//             {/* Game Stats Card */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Game Stats</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4">
//                 <div className="grid grid-cols-1 gap-4">
//                   {gameMode === 'classic' ? (
//                     // Classic mode stats
//                     <>
//                       <div className="bg-white rounded-lg p-4 shadow-sm">
//                         <div className="text-sm text-gray-500">Possible Words</div>
//                         <div className="text-2xl font-bold">
//                           {possibleWords.length}
//                         </div>
//                       </div>
//                       <div className="bg-white rounded-lg p-4 shadow-sm">
//                         <div className="text-sm text-gray-500">Found Words</div>
//                         <div className="text-2xl font-bold">
//                           {foundWords.length} / {possibleWords.length}
//                         </div>
//                       </div>
//                       <div className="bg-white rounded-lg p-4 shadow-sm">
//                         <div className="text-sm text-gray-500">Completion</div>
//                         <div className="text-2xl font-bold">
//                           {Math.round((foundWords.length / possibleWords.length) * 100)}%
//                         </div>
//                       </div>
//                     </>
//                   ) : (
//                     // Bodle mode stats
//                     <>
//                       <div className="bg-white rounded-lg p-4 shadow-sm">
//                         <div className="text-sm text-gray-500">Guesses</div>
//                         <div className="text-2xl font-bold">
//                           {foundWords.length}
//                         </div>
//                       </div>
//                       <div className="bg-blue-100 rounded-lg p-4 shadow-sm">
//                         <div className="text-sm text-blue-500">Remaining Guesses</div>
//                         <div className="text-2xl font-bold text-blue-600">
//                           {remainingGuesses}
//                         </div>
//                       </div>
                  
//                     </>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Found Words Card */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Found Words</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="bg-white border border-gray-200 rounded-lg p-4 h-[300px] overflow-y-auto">
//                   {foundWords.map(({ word, points }, index) => (
//                     <div key={index} className="flex justify-between items-center py-2 border-b">
//                       <span className="text-lg">{word}</span>
//                       <span className="font-semibold text-blue-600">{points} pts</span>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Game Controls */}
//             <Card>
//               <CardContent className="space-y-4 p-6">
//                 <div className="mb-4">
//                   <Label htmlFor="gameMode">Game Mode</Label>
//                   <Select 
//                     value={gameMode} 
//                     onValueChange={(value: 'classic' | 'bodle') => {
//                       window.location.href = `/games/boggle-clone?mode=${value}`
//                     }}
//                   >
//                     <SelectTrigger id="gameMode">
//                       <SelectValue placeholder="Select game mode" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="classic">
//                         Classic
//                         <span className="text-sm text-gray-500 block">Traditional Boggle gameplay</span>
//                       </SelectItem>
//                       <SelectItem value="bodle">
//                         Bodle
//                         <span className="text-sm text-gray-500 block">Daily puzzle with hints</span>
//                       </SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <Button 
//                   onClick={generateNewBoard} 
//                   className="w-full text-lg h-12"
//                 >
//                   New Board
//                 </Button>
//                 <Button 
//                   onClick={() => {
//                     const url = window.location.href
//                     navigator.clipboard.writeText(url)
//                   }}
//                   variant="secondary"
//                   className="w-full"
//                 >
//                   Share Board
//                 </Button>
//               </CardContent>
//             </Card>

//             {timer === 0 && (
//               <Card className="bg-yellow-50">
//                 <CardContent className="p-6">
//                   <h3 className="font-bold text-2xl mb-4">Game Over!</h3>
//                   <p className="text-lg">Final Score: {score}</p>
//                   <p className="text-lg mb-4">Words Found: {foundWords.length} / {possibleWords.length}</p>
//                   <Button 
//                     onClick={generateNewBoard}
//                     className="w-full text-lg h-12"
//                   >
//                     Play Again
//                   </Button>
//                 </CardContent>
//               </Card>
//             )}
//           </div>
//         </div>
//       </div>
//       <SuccessModal 
//         isOpen={showSuccessModal} 
//         onClose={() => {
//           setShowSuccessModal(false);
//           generateNewBoard();
//         }} 
//       />
//       <GameOverModal 
//         isOpen={showGameOverModal} 
//         onClose={() => {
//           setShowGameOverModal(false);
//           generateNewBoard();
//         }} 
//       />
//     </>
//   )
// }


