'use client';
import { useState } from 'react';
import { createClient } from '../../lib/supabase/client';

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const supabase = createClient();

  if (!isOpen) return null;

  const handleAuth = async (type: 'login' | 'signup') => {
    setLoading(true);
    setMessage('');
    const { error } = type === 'login' 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) setMessage(error.message);
    else if (type === 'signup') setMessage('Check your email for confirmation!');
    setLoading(false);
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
      onClick={onClose} // Закрытие при клике на фон
    >
      <div 
        className="bg-slate-900 border-2 border-indigo-500/30 p-8 rounded-3xl w-full max-w-sm space-y-6 shadow-[0_0_50px_rgba(79,70,229,0.2)]"
        onClick={(e) => e.stopPropagation()} // ВАЖНО: предотвращает закрытие при клике ВНУТРЬ формы
      >
        <div className="text-center">
          <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Neural Access</h2>
          <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Enter your credentials</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] text-indigo-400 font-black uppercase ml-1">Email Terminal</label>
            <input 
              type="email" 
              placeholder="cyber@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] text-indigo-400 font-black uppercase ml-1">Access Key</label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors font-mono"
            />
          </div>
        </div>

        {message && <p className="text-[10px] text-rose-500 font-bold text-center bg-rose-500/10 py-2 rounded-lg">{message}</p>}

        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => handleAuth('login')}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 rounded-xl text-xs uppercase transition-all disabled:opacity-50"
          >
            {loading ? '...' : 'Sign In'}
          </button>
          <button 
            onClick={() => handleAuth('signup')}
            disabled={loading}
            className="bg-slate-800 hover:bg-slate-700 text-white font-black py-3 rounded-xl text-xs uppercase transition-all disabled:opacity-50"
          >
            Join
          </button>
        </div>

        <button 
          onClick={onClose}
          className="w-full text-[9px] text-slate-600 font-black uppercase hover:text-slate-400 transition-colors"
        >
          Abort Mission
        </button>
      </div>
    </div>
  );
}