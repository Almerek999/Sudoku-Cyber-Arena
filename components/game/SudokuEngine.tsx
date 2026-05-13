'use client';
import { useEffect, useState } from 'react';
import { Board } from './Board';
import { Numpad } from './Numpad';
import { useGameStore } from '../../store/gameStore';
import { createClient } from '../../lib/supabase/client';

export default function SudokuEngine({ user }: { user: any }) {
  const { 
    initGame, 
    board, 
    isGameOver, 
    isVictory, 
    score, 
    mistakes, 
    setNumber, 
    clearCell, 
    aiMessage, 
    clearAiMessage, 
    isDaily, 
    timeElapsed,
    isPro,
    nickColor,
    pvpRoom
  } = useGameStore();

  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  // Инициализация первой игры при загрузке
  useEffect(() => {
    setMounted(true);
    if (board[0][0] === 0 && !pvpRoom) {
      initGame('medium');
    }
  }, []);

  // Логика сохранения статистики в Supabase
  useEffect(() => {
    const saveStats = async () => {
      if ((isVictory || isGameOver) && user && !saved) {
        
        // 1. Обновление общего профиля игрока
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        const currentElo = profile?.elo_rating || 0;
        const currentPlayed = profile?.games_played || 0;
        const currentWon = profile?.games_won || 0;
        const currentHigh = profile?.high_score || 0;

        await supabase.from('profiles').update({
          elo_rating: isVictory ? currentElo + score : Math.max(0, currentElo - 5),
          games_played: currentPlayed + 1,
          games_won: isVictory ? currentWon + 1 : currentWon,
          high_score: Math.max(currentHigh, score)
        }).eq('id', user.id);

        // 2. Запись истории матча
        await supabase.from('matches').insert({
          user_id: user.id,
          difficulty: useGameStore.getState().difficulty,
          result: isVictory ? 'victory' : 'defeat',
          score: score
        });

        // 3. Сохранение в Глобальный Лидерборд (если это Daily Challenge)
        if (isDaily && isVictory) {
          const today = new Date().toISOString().split('T')[0];
          
          await supabase.from('daily_leaderboard').insert({
            user_id: user.id,
            username: profile?.username || user.email?.split('@')[0] || 'Cyber_Player',
            challenge_date: today,
            time_taken: timeElapsed,
            mistakes: mistakes,
            score: score,
            nick_color: nickColor, // Твой купленный скин
            is_pro: isPro          // Твой статус
          });
        }

        setSaved(true);
      }
    };

    saveStats();
    
    // Сброс флага сохранения при начале новой игры
    if (!isVictory && !isGameOver) {
      setSaved(false);
    }
  }, [isVictory, isGameOver, user, score, saved, supabase, isDaily, timeElapsed, mistakes, nickColor, isPro]);

  // Обработка ввода с клавиатуры
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (isGameOver || isVictory) return;
      if (e.key >= '1' && e.key <= '9') setNumber(parseInt(e.key));
      if (e.key === 'Backspace' || e.key === 'Delete') clearCell();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setNumber, clearCell, isGameOver, isVictory]);

  if (!mounted) return null;

  return (
    <div className="w-full space-y-4 animate-fade-in">
      
      {/* НЕЙРО-ТЕРМИНАЛ ИИ-ТРЕНЕРА */}
      {aiMessage && (
        <div className="bg-slate-950 border-2 border-cyan-500/50 p-4 rounded-xl shadow-[0_0_25px_rgba(6,182,212,0.15)] relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500 animate-pulse"></div>
          <button 
            onClick={clearAiMessage}
            className="absolute top-2 right-3 text-slate-500 hover:text-cyan-400 font-bold transition-colors"
          >
            ✕
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
            <span className="text-[10px] text-cyan-400 font-black tracking-[0.2em] uppercase">
              Neuro-Link Established
            </span>
          </div>
          <p className="text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap italic">
            {aiMessage}
          </p>
        </div>
      )}

      {/* ЭКРАН ПОРАЖЕНИЯ */}
      {isGameOver && (
        <div className="bg-red-950/40 border-2 border-red-500 p-6 rounded-2xl text-center animate-shake shadow-[0_0_30px_rgba(239,68,68,0.3)]">
          <h2 className="text-red-500 font-black text-4xl tracking-tighter italic mb-2">SYSTEM FAILURE</h2>
          <p className="text-red-200/70 font-mono text-sm uppercase tracking-widest">
            Armor depleted. Final Score: {score}
          </p>
        </div>
      )}
      
      {/* ЭКРАН ПОБЕДЫ */}
      {isVictory && (
        <div className="bg-green-950/40 border-2 border-green-500 p-6 rounded-2xl text-center shadow-[0_0_30px_rgba(34,197,94,0.3)] animate-bounce-subtle">
          <h2 className="text-green-400 font-black text-4xl tracking-tighter italic mb-1">MISSION CLEAR</h2>
          <div className="space-y-1">
            <p className="text-green-200/70 font-mono text-sm uppercase tracking-widest">
              Data synchronized. Efficiency: {Math.max(0, 100 - mistakes * 10)}%
            </p>
            {isDaily && (
              <p className="text-orange-400 font-black text-xs uppercase animate-pulse">
                Daily Record Sent to Taraz HQ
              </p>
            )}
          </div>
        </div>
      )}

      {/* ИГРОВОЕ ПОЛЕ */}
      <div className={`transition-all duration-1000 ${
        isGameOver || isVictory ? 'opacity-20 grayscale scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}>
        <Board />
        <Numpad />
      </div>

      {/* ФУТЕР ДВИЖКА */}
      <div className="flex justify-between items-center px-2 py-1 opacity-40">
        <div className="text-[8px] font-mono uppercase tracking-widest text-slate-500">
          Core: {isPro ? 'Pro-Edition v2.1' : 'Standard-Edition'}
        </div>
        <div className="text-[8px] font-mono uppercase tracking-widest text-slate-500">
          User: {user?.email?.split('@')[0] || 'Guest_User'}
        </div>
      </div>
    </div>
  );
}