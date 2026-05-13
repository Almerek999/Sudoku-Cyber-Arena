'use client';
import { useEffect, useState } from 'react';
import { createClient } from '../../lib/supabase/client';

export function DailyLeaderboard() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Запрашиваем данные, включая новые поля для скинов и PRO-статуса
      const { data, error } = await supabase
        .from('daily_leaderboard')
        .select('*')
        .eq('challenge_date', today)
        .order('score', { ascending: false }) // Топ по очкам
        .order('time_taken', { ascending: true }) // При равенстве — кто быстрее
        .limit(10);

      if (data) setLeaders(data);
      if (error) console.error("Ошибка синхронизации лидеров:", error);
      setLoading(false);
    };

    fetchLeaderboard();
  }, [supabase]);

  // Форматирование секунд в классический вид 00:00
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="bg-slate-900 border-2 border-orange-500/50 p-5 rounded-2xl shadow-[0_0_20px_rgba(249,115,22,0.2)] mt-6 animate-fade-in">
      <h3 className="text-orange-500 font-black tracking-widest text-center mb-4 uppercase flex items-center justify-center gap-2">
        <span className="animate-pulse">🏆</span> GLOBAL DAILY TOP 10 <span className="animate-pulse">🏆</span>
      </h3>
      
      {loading ? (
        <p className="text-center text-slate-500 font-mono animate-pulse italic text-xs">Считывание нейронных сигналов...</p>
      ) : leaders.length === 0 ? (
        <p className="text-center text-slate-500 font-mono text-xs italic">База данных пуста. Твой шанс стать легендой сегодня!</p>
      ) : (
        <div className="space-y-2">
          {leaders.map((player, index) => (
            <div 
              key={player.id} 
              className={`flex justify-between items-center p-3 rounded-lg font-mono text-sm border transition-all duration-300 hover:scale-[1.02] ${
                index === 0 
                  ? 'bg-orange-500/20 border-orange-500/50 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)]' 
                  : 'bg-slate-800 text-slate-300 border-slate-700/50 hover:border-slate-500'
              }`}
            >
              <div className="flex gap-3 items-center">
                <span className="font-black text-lg w-5 text-center text-slate-500">{index + 1}</span>
                <div className="flex items-center gap-1.5">
                  {/* Применяем кастомный цвет ника из базы данных */}
                  <span className={`font-bold truncate max-w-[110px] ${player.nick_color || 'text-slate-300'}`}>
                    {player.username}
                  </span>
                  
                  {/* Метка PRO-игрока */}
                  {player.is_pro && (
                    <span 
                      className="text-yellow-400 text-[10px] drop-shadow-[0_0_5px_rgba(250,204,21,0.8)] animate-pulse cursor-help" 
                      title="Pro User: Elite Armor & AI Hints"
                    >
                      ⭐
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3 items-center">
                <div className="flex flex-col items-end text-[9px] opacity-70 uppercase tracking-tighter leading-tight">
                  <span className="flex items-center gap-1">⏱ {formatTime(player.time_taken)}</span>
                  <span className="flex items-center gap-1 text-red-400">❌ {player.mistakes} err</span>
                </div>
                <div className="pl-2 border-l border-slate-700 flex flex-col items-center">
                  <span className="text-[8px] text-slate-500 font-black uppercase">Score</span>
                  <span className="text-cyan-400 font-black text-sm">{player.score}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Футер для стиля */}
      <div className="mt-5 pt-3 border-t border-slate-800 flex justify-between items-center px-1">
        <span className="text-[8px] text-slate-600 font-mono uppercase tracking-widest">Net: Stable</span>
        <span className="text-[8px] text-slate-600 font-mono uppercase tracking-widest text-right">Cyber-Rank System v2.1</span>
      </div>
    </div>
  );
}