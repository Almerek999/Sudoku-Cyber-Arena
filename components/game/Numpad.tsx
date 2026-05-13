'use client';
import { useGameStore } from '../../store/gameStore';

export function Numpad() {
  const { setNumber, clearCell, isNotesMode, toggleNotesMode, hints, useAiCoach } = useGameStore();

  return (
    <div className="mt-6 w-full transition-colors duration-300">
      <div className="flex justify-between mb-3 gap-2">
        <button
          onClick={toggleNotesMode}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 border-2 ${
            isNotesMode 
              ? 'bg-indigo-600 border-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' 
              : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          ✏️ Notes {isNotesMode ? 'ON' : 'OFF'}
        </button>
        
        {/* ВОТ ОНА — НАША НОВАЯ КНОПКА AI COACH */}
        <button
          onClick={useAiCoach}
          disabled={hints <= 0}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 border-2 ${
            hints > 0
              ? 'bg-white dark:bg-slate-900 border-cyan-400/50 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]'
              : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 opacity-50 cursor-not-allowed'
          }`}
        >
          🧠 AI COACH ({hints})
        </button>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => setNumber(num)}
            className="py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-xl font-black text-slate-800 dark:text-slate-200 transition-all hover:bg-indigo-50 hover:border-indigo-300 dark:hover:bg-indigo-900/40 dark:hover:border-indigo-500 active:scale-95 shadow-sm dark:shadow-none"
          >
            {num}
          </button>
        ))}
        <button
          onClick={clearCell}
          className="py-4 bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-900/50 rounded-xl text-lg font-black text-red-600 dark:text-red-400 transition-all hover:bg-red-100 dark:hover:bg-red-900/50 active:scale-95 shadow-sm dark:shadow-none"
        >
          X
        </button>
      </div>
    </div>
  );
}