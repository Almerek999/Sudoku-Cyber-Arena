'use client';
import { useGameStore } from '../../store/gameStore';

export function Board() {
  const { board, initialBoard, selectedCell, setSelectedCell, notes, isBlindMode, isGameOver, isVictory } = useGameStore();

  return (
    <div className="w-full aspect-square bg-white dark:bg-slate-900 border-4 border-slate-800 dark:border-slate-700 grid grid-cols-9 shadow-xl dark:shadow-[0_0_30px_rgba(79,70,229,0.15)] rounded-sm overflow-hidden transition-colors duration-300">
      {board.map((row, rIndex) =>
        row.map((cell, cIndex) => {
          const isSelected = selectedCell?.[0] === rIndex && selectedCell?.[1] === cIndex;
          const isInitial = initialBoard[rIndex][cIndex] !== 0;
          const selectedNumber = selectedCell && board[selectedCell[0]][selectedCell[1]] !== 0 ? board[selectedCell[0]][selectedCell[1]] : null;
          const isSameNumber = cell !== 0 && cell === selectedNumber && !isSelected;

          const borderRight = cIndex % 3 === 2 && cIndex !== 8 ? 'border-r-2 border-r-slate-800 dark:border-r-slate-500' : 'border-r border-r-slate-300 dark:border-r-slate-800';
          const borderBottom = rIndex % 3 === 2 && rIndex !== 8 ? 'border-b-2 border-b-slate-800 dark:border-b-slate-500' : 'border-b border-b-slate-300 dark:border-b-slate-800';

          let bgClass = 'bg-transparent';
          if (isSelected) bgClass = 'bg-indigo-200 dark:bg-indigo-900/60';
          else if (isSameNumber && !isBlindMode) bgClass = 'bg-indigo-100 dark:bg-indigo-900/30';

          // ЛОГИКА СЛЕПОГО РЕЖИМА
          const isHidden = isBlindMode && !isSelected && !isGameOver && !isVictory;

          let textClass = 'text-slate-900 dark:text-slate-200';
          if (isHidden) {
            textClass = 'text-transparent dark:text-transparent blur-sm select-none';
          } else if (isInitial) {
            textClass = 'text-slate-900 dark:text-white font-black';
          } else {
            textClass = 'text-indigo-600 dark:text-cyan-400 font-semibold';
          }

          return (
            <div
              key={`${rIndex}-${cIndex}`}
              onClick={() => setSelectedCell([rIndex, cIndex])}
              className={`relative flex items-center justify-center text-2xl sm:text-3xl cursor-pointer transition-all duration-300 ${borderRight} ${borderBottom} ${bgClass} ${textClass}`}
            >
              {cell !== 0 ? (
                cell
              ) : notes[`${rIndex}-${cIndex}`]?.length > 0 && !isHidden ? (
                <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-0.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <div key={n} className="flex items-center justify-center text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      {notes[`${rIndex}-${cIndex}`].includes(n) ? n : ''}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })
      )}
    </div>
  );
}