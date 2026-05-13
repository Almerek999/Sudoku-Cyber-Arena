'use client';
import { useEffect, useState } from 'react';
import { createClient } from '../../lib/supabase/client';

export default function ProfileModal({ isOpen, onClose, user, onLogout }: { isOpen: boolean, onClose: () => void, user: any, onLogout: () => void }) {
  const [stats, setStats] = useState<any>(null);
  const [matchHistory, setMatchHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    if (isOpen && user) {
      setLoading(true);
      const fetchData = async () => {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        const { data: matchesData } = await supabase.from('matches').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5);
        setStats(profileData);
        setMatchHistory(matchesData || []);
        setLoading(false);
      };
      fetchData();
    }
  }, [isOpen, user, supabase]);

  if (!isOpen) return null;

  const played = stats?.games_played || 0;
  const won = stats?.games_won || 0;
  const elo = stats?.elo_rating || 0;
  const lost = played - won;
  const winrate = played > 0 ? Math.round((won / played) * 100) : 0;
  
  let rank = { name: 'BRONZE', color: 'text-orange-500 dark:text-orange-400' };
  if (elo >= 2000) rank = { name: 'CYBER MASTER', color: 'text-fuchsia-500 dark:text-fuchsia-400' };
  else if (elo >= 1000) rank = { name: 'DIAMOND', color: 'text-cyan-500 dark:text-cyan-400' };
  else if (elo >= 500) rank = { name: 'GOLD', color: 'text-yellow-500 dark:text-yellow-400' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-sm p-4 transition-all overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-2xl w-full max-w-sm relative shadow-2xl dark:shadow-[0_0_40px_rgba(6,182,212,0.2)] my-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white font-black text-xl transition-colors">✕</button>
        
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg dark:shadow-[0_0_15px_rgba(79,70,229,0.5)]">
            <span className="text-2xl font-black text-white">{user?.email?.[0].toUpperCase()}</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white truncate px-4">{user?.email?.split('@')[0]}</h2>
          <p className={`${rank.color} text-xs font-bold tracking-widest uppercase mt-1`}>Rank: {rank.name}</p>
        </div>

        {loading ? (
          <div className="text-center py-10 text-slate-500 animate-pulse font-bold tracking-widest">SYNCING DATA...</div>
        ) : (
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50 text-center">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Total ELO</p>
                <p className={`font-mono font-black text-2xl ${rank.color}`}>{elo}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50 text-center">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">High Score</p>
                <p className="text-yellow-600 dark:text-yellow-400 font-mono font-black text-2xl">{stats?.high_score || 0}</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Winrate</span>
                <span className="font-mono font-black text-lg text-slate-900 dark:text-white">{winrate}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-full overflow-hidden mb-4 relative">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-1000" style={{ width: `${winrate}%` }} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center border-t border-slate-200 dark:border-slate-700/50 pt-3">
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-black">Matches</p>
                  <p className="text-slate-900 dark:text-white font-mono font-bold text-lg">{played}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-black">Wins</p>
                  <p className="text-green-600 dark:text-green-400 font-mono font-bold text-lg">{won}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-500 uppercase font-black">Losses</p>
                  <p className="text-red-600 dark:text-red-400 font-mono font-bold text-lg">{lost}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <h3 className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                <span>Recent Operations</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700/50"></div>
              </h3>
              <div className="space-y-2">
                {matchHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-2 font-mono">No data found in logs</p>
                ) : (
                  matchHistory.map((match) => (
                    <div key={match.id} className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/50 p-2 rounded-lg">
                      <div className="flex items-center gap-3">
                        {match.result === 'victory' ? (
                          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.8)]" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
                        )}
                        <div>
                          <p className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase">{match.difficulty}</p>
                          <p className="text-[9px] text-slate-500 uppercase">{new Date(match.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className={`font-mono font-black text-sm ${match.result === 'victory' ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'}`}>
                        {match.result === 'victory' ? '+' : ''}{match.score} ELO
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        <button 
          onClick={onLogout}
          className="w-full py-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-500 border border-red-200 dark:border-red-900/50 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-red-100 dark:hover:bg-red-600 hover:text-red-700 dark:hover:text-white transition-all active:scale-95"
        >
          Disconnect Terminal
        </button>
      </div>
    </div>
  );
}