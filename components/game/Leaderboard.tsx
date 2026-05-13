'use client';
import { useEffect, useState } from 'react';
import { createClient } from '../../lib/supabase/client';

export function Leaderboard() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchLeaders = async () => {
      const { data } = await supabase.from('profiles').select('username, elo_rating').order('elo_rating', { ascending: false }).limit(5);
      if (data) setLeaders(data);
    };
    fetchLeaders();
    
    // Подписка на обновления в реальном времени
    const channel = supabase.channel('public:profiles').on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchLeaders).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  return (
    <div className="w-full bg-slate-900/40 border border-slate-800 rounded-xl p-5 mt-4 shadow-lg">
      <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-4 text-center">Global Top Players</h3>
      <div className="space-y-3">
        {leaders.map((user, i) => (
          <div key={i} className="flex justify-between items-center text-sm border-b border-slate-800/50 pb-2">
            <span className="text-slate-300 font-medium">
              <span className={`mr-3 font-black ${i === 0 ? 'text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-600' : 'text-slate-600'}`}>#{i+1}</span> 
              {user.username || 'Anonymous'}
            </span>
            <span className="font-mono text-indigo-400 font-bold">{user.elo_rating} ELO</span>
          </div>
        ))}
        {leaders.length === 0 && <p className="text-center text-slate-600 text-xs">No records yet. Be the first!</p>}
      </div>
    </div>
  );
}