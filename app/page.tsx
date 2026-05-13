'use client';
import dynamic from 'next/dynamic';
import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { createClient } from '../lib/supabase/client';
import AuthModal from '../components/game/AuthModal';
import ProfileModal from '../components/game/ProfileModal';
import { DailyLeaderboard } from '../components/game/DailyLeaderboard';
import { PvPPanel } from '../components/game/PvPPanel';
import ThemeToggle from '../components/game/ThemeToggle';

const DynamicEngine = dynamic(() => import('../components/game/SudokuEngine'), { ssr: false });

export default function Home() {
  const { 
    initGame, 
    initDaily, // ИСПРАВЛЕНО: добавлено импортирование функции
    maxMistakes, 
    mistakes, 
    score, 
    timeElapsed, 
    isDaily, 
    isPro,
    setBlindMode,
    isBlindMode,
    difficulty
  } = useGameStore();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  const supabase = createClient();

  const syncProfile = useCallback(async (sessionUser: any) => {
    if (!sessionUser) {
      useGameStore.setState({ isPro: false });
      return;
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_pro, nick_color')
      .eq('id', sessionUser.id)
      .single();
    
    if (profile) {
      useGameStore.setState({ 
        isPro: profile.is_pro, 
        nickColor: profile.nick_color || 'text-slate-300' 
      });
    }
  }, [supabase]);

  useEffect(() => {
    setMounted(true);
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      syncProfile(sessionUser);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      syncProfile(sessionUser);
      if (event === 'SIGNED_IN') setIsAuthOpen(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase, syncProfile]);

  const formattedTime = `${Math.floor(timeElapsed / 60).toString().padStart(2, '0')}:${(timeElapsed % 60).toString().padStart(2, '0')}`;

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col items-center py-6 px-4 transition-colors duration-300">
      <div className="max-w-md w-full space-y-6">
        
        {/* ХЕЙДЕР С КНОПКОЙ UPGRADE */}
        <div className="flex justify-between items-center bg-white dark:bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="flex flex-col">
            <span className="text-[7px] text-slate-400 font-black uppercase tracking-[0.2em]">Cyber-Status</span>
            <span className={`text-[10px] font-black uppercase ${isPro ? 'text-yellow-500 animate-pulse' : 'text-indigo-600 dark:text-cyan-400'}`}>
              {isPro ? '⭐ PRO ELITE' : 'Standard User'}
            </span>
          </div>

          <div className="flex gap-2 items-center">
            {user && !isPro && (
              <button 
                onClick={() => {/* Stripe Trigger */}}
                className="relative overflow-hidden bg-indigo-600 text-white text-[9px] font-black px-4 py-2 rounded-lg uppercase transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(79,70,229,0.4)] group"
              >
                <span className="relative z-10">Upgrade to Pro</span>
                <div className="absolute inset-0 bg-white/20 animate-pulse group-hover:hidden"></div>
                <div className="absolute -inset-1 bg-indigo-500 rounded-lg blur opacity-30 animate-pulse"></div>
              </button>
            )}
            
            <ThemeToggle />
            <button 
              onClick={() => user ? setIsProfileOpen(true) : setIsAuthOpen(true)}
              className="text-[9px] font-black bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-3 py-2 rounded-lg uppercase hover:border-indigo-500 transition-colors"
            >
              {user ? `[${user.email.split('@')[0]}]` : 'Auth'}
            </button>
          </div>
        </div>

        {/* СТАТИСТИКА */}
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-cyan-500 to-indigo-600 dark:from-indigo-500 dark:via-cyan-400 dark:to-indigo-500 filter drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]">
            SUDOKU ARENA
          </h1>
          
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-lg relative overflow-hidden">
            {isPro && <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-pulse" />}
            
            <div className="flex flex-col gap-1">
              <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Armor</span>
              <div className="flex gap-1">
                {[...Array(maxMistakes)].map((_, i) => (
                  <div key={i} className={`h-2.5 w-4 rounded-sm transition-all duration-500 ${i < (maxMistakes - mistakes) ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'bg-slate-200 dark:bg-slate-800'}`} />
                ))}
              </div>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Clock</span>
              <span className={`font-mono text-2xl font-black tracking-widest ${isDaily ? 'text-orange-500 animate-pulse' : ''}`}>
                {formattedTime}
              </span>
            </div>

            <div className="flex flex-col items-end">
               <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Score</span>
               <span className="text-indigo-600 dark:text-indigo-400 font-mono font-black text-xl">{score}</span>
            </div>
          </div>
        </header>

        {/* РЕЖИМЫ ИГРЫ */}
        <div className="space-y-3">
          <PvPPanel />
          
          {/* КНОПКА DAILY CHALLENGE (С ФУНКЦИЕЙ ОТМЕНЫ) */}
          <button
            onClick={() => isDaily ? initGame('medium') : initDaily()}
            className={`w-full py-3.5 border-2 rounded-xl text-xs font-black uppercase transition-all shadow-lg ${
              isDaily 
                ? 'bg-red-500/10 border-red-500 text-red-500 shadow-red-500/20 hover:bg-red-500 hover:text-white' 
                : 'bg-white dark:bg-slate-900 border-orange-500/30 text-orange-500 hover:border-orange-500'
            }`}
          >
            {isDaily ? '🛑 Abort Daily Challenge' : '🔥 Enter Daily Challenge'}
          </button>

          {/* ВЫБОР СЛОЖНОСТИ (СКРЫТ ВО ВРЕМЯ DAILY) */}
          {!isDaily && (
            <div className="flex gap-2 animate-fade-in">
              {['easy', 'medium', 'hard'].map((lvl) => (
                <button 
                  key={lvl} 
                  onClick={() => initGame(lvl)}
                  className={`flex-1 py-2.5 border-2 rounded-xl text-xs font-black uppercase transition-all ${
                    difficulty === lvl
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' 
                      : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          )}

          {/* СЛЕПОЙ РЕЖИМ (СКРЫТ ВО ВРЕМЯ DAILY) */}
          {!isDaily && (
            <div className="flex bg-slate-200 dark:bg-slate-800 p-1.5 rounded-xl animate-fade-in">
              <button
                onClick={() => setBlindMode(false)}
                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                  !isBlindMode ? 'bg-white dark:bg-slate-900 shadow-sm text-indigo-600 dark:text-cyan-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => setBlindMode(true)}
                className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                  isBlindMode ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                👁️ Blind Mode
              </button>
            </div>
          )}
        </div>

        <DynamicEngine user={user} />
        <DailyLeaderboard />
        
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} onLogout={() => {
            supabase.auth.signOut();
            setIsProfileOpen(false);
        }} />
      </div>
    </main>
  );
}