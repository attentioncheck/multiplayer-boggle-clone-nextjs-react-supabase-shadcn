// interface BoggleCellProps {
//   letter: string;
//   isSelected: boolean;
//   isCycleAvailable: boolean;
//   isCycleCurrent: boolean;
//   onDragStart: () => void;
//   onDragEnter: () => void;
//   onDragEnd: () => void;
//   onTouchStart: () => void;
//   'data-pos': string;
//   isDragging: boolean;
// }

// export function BoggleCell({
//   letter,
//   isSelected,
//   isCycleAvailable,
//   isCycleCurrent,
//   onDragStart,
//   onDragEnter,
//   onDragEnd,
//   onTouchStart,
//   'data-pos': dataPos,
//   isDragging
// }: BoggleCellProps) {
//   return (
//     <button
//       data-pos={dataPos}
//       onMouseDown={() => {
//         console.log(`Clicked letter: ${letter}`);
//         onDragStart();
//       }}
//       onTouchStart={onTouchStart}
//       onMouseEnter={onDragEnter}
//       onMouseUp={onDragEnd}
//       className={`
//         relative group
//         w-20 h-20 sm:w-24 sm:h-24 md:size-32 lg:size-40
//         flex flex-col items-center justify-center
//         rounded-xl border-2
//         text-3xl sm:text-4xl font-bold
//         transition-all duration-200 transform bg-white/40 
//         ${isDragging ? 'cursor-pointer' : 'hover:scale-105 hover:-translate-y-1'}
//         ${isSelected
//           ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white border-blue-400 shadow-lg'
//           : 'bg-white text-gray-800 border-gray-200 hover:border-blue-300 hover:shadow-md'}
//         ${isCycleAvailable ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''}
//         ${isCycleCurrent ? 'ring-4 ring-yellow-500 ring-opacity-75' : ''}
//         touch-none
//       `}
//     >
//       <span className="relative z-10">{letter}</span>
//     </button>
//   );
// } 