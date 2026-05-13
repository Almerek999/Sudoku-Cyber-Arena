'use client';
import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';

export function PvPPanel() {
  const { 
    pvpRoom, 
    isPvPHost, 
    opponentScore, 
    opponentMistakes, 
    hostPvP, 
    joinPvP, 
    leavePvP, 
    score, 
    mistakes 
  } = useGameStore();
  
  const [joinCode, setJoinCode] = useState('');

  // === ИНТЕРФЕЙС АКТИВНОЙ БОЕВОЙ АРЕНЫ ===
  if (pvpRoom) {
    return (
      <div className="bg-slate-900 border-2 border-rose-500 p-4 rounded-xl shadow-[0_0_25px_rgba(244,63,94,0.4)] animate-in fade-in zoom-in duration-300 space-y-4 w-full mt-2">
        
        {/* Шапка PvP панели */}
        <div className="flex justify-between items-center border-b border-rose-500/30 pb-3">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            <span className="text-sm text-rose-400 font-black tracking-widest uppercase drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]">
              PVP ARENA ONLINE
            </span>
          </div>
          <button 
            onClick={leavePvP} 
            className="text-[10px] bg-rose-500/10 hover:bg-rose-600 text-rose-500 hover:text-white px-3 py-1.5 rounded-lg border border-rose-500/50 transition-all font-bold uppercase tracking-wider"
          >
            Disconnect
          </button>
        </div>
        
        {/* Состояние: Хост ждет подключения соперника */}
        {isPvPHost && opponentScore === 0 && opponentMistakes === 0 && (
           <div className="bg-rose-950/40 border border-rose-500/30 rounded-lg p-5 text-center animate-pulse shadow-inner">
             <p className="text-xs text-rose-300 font-mono mb-2 uppercase tracking-wider">
               Ожидание подключения соперника...
             </p>
             <p className="text-[10px] text-slate-400 font-mono mb-2">Передай этот код для входа:</p>
             <div className="text-4xl text-white font-black tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.9)] bg-slate-900/50 inline-block px-6 py-2 rounded-xl border border-rose-500/50">
               {pvpRoom}
             </div>
           </div>
        )}

        {/* Состояние: Активная битва (Счетчики) */}
        <div className="grid grid-cols-2 gap-4">
          {/* Плашка ТВОЕГО счета */}
          <div className="bg-slate-800/80 p-4 rounded-xl border-b-4 border-cyan-500 shadow-inner flex flex-col items-center relative overflow-hidden transition-all duration-300 hover:bg-slate-800">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
            <div className="text-[10px] text-cyan-400 uppercase font-black tracking-widest mb-1">YOU</div>
            <div className="text-4xl text-white font-mono font-black drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">
              {score}
            </div>
            <div className="text-[10px] text-red-400 font-bold mt-2 bg-red-950/30 px-2 py-0.5 rounded border border-red-500/20">
              Mistakes: {mistakes}
            </div>
          </div>
          
          {/* Плашка СЧЕТА ПРОТИВНИКА */}
          <div className="bg-slate-800/80 p-4 rounded-xl border-b-4 border-rose-500 shadow-inner flex flex-col items-center relative overflow-hidden transition-all duration-300 hover:bg-slate-800">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-50"></div>
            <div className="text-[10px] text-rose-400 uppercase font-black tracking-widest mb-1">ENEMY</div>
            <div className="text-4xl text-white font-mono font-black drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]">
              {opponentScore}
            </div>
            <div className="text-[10px] text-red-400 font-bold mt-2 bg-red-950/30 px-2 py-0.5 rounded border border-red-500/20">
              Mistakes: {opponentMistakes}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === ИНТЕРФЕЙС ГЛАВНОГО МЕНЮ (Создать / Присоединиться) ===
  return (
    <div className="flex gap-2 w-full mt-2">
      <button
        onClick={hostPvP}
        className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 border-2 border-rose-500/50 hover:border-rose-500 rounded-xl text-xs font-black uppercase transition-all duration-300 text-rose-400 flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.15)] hover:shadow-[0_0_20px_rgba(244,63,94,0.5)] active:scale-95"
      >
        ⚔️ HOST PVP
      </button>
      
      <div className="flex-1 flex shadow-[0_0_15px_rgba(0,0,0,0.2)] rounded-xl group relative">
        <input 
          type="text" 
          placeholder="CODE" 
          maxLength={4}
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} // Защита от ввода пробелов и спецсимволов
          className="w-1/2 bg-slate-900 border-2 border-r-0 border-slate-700 group-hover:border-slate-600 rounded-l-xl text-center text-white font-mono font-bold text-lg focus:outline-none focus:border-rose-500 transition-colors"
        />
        <button
          onClick={() => joinCode.length === 4 && joinPvP(joinCode)}
          disabled={joinCode.length < 4}
          className={`w-1/2 py-3 border-2 rounded-r-xl text-xs font-black uppercase transition-all duration-300 flex justify-center items-center ${
            joinCode.length === 4 
              ? 'bg-rose-600 border-rose-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.7)] cursor-pointer hover:bg-rose-500 active:scale-95' 
              : 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed opacity-70'
          }`}
        >
          JOIN
        </button>
      </div>
    </div>
  );
}