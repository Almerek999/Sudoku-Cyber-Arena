import { create } from 'zustand';
import { createClient } from '../lib/supabase/client';

const supabase = createClient();

// --- КИБЕР-АКУСТИКА (Звуковой движок) ---
const playSound = (type: 'correct' | 'error' | 'victory' | 'gameover') => {
  if (typeof window === 'undefined') return;
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();

  const playTone = (freq: number, wave: OscillatorType, duration: number, startTime: number = 0, vol: number = 0.1) => {
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.type = wave; osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(ctx.currentTime + startTime); osc.stop(ctx.currentTime + startTime + duration);
  };

  if (type === 'correct') { playTone(800, 'sine', 0.1); playTone(1200, 'sine', 0.15, 0.1); } 
  else if (type === 'error') { playTone(150, 'sawtooth', 0.3, 0, 0.2); } 
  else if (type === 'victory') { [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => playTone(freq, 'square', 0.2, i * 0.15)); } 
  else if (type === 'gameover') { [300, 250, 200, 150].forEach((freq, i) => playTone(freq, 'sawtooth', 0.4, i * 0.3, 0.2)); }
};

// --- ГЕНЕРАТОР МАТРИЦЫ (Судоку) ---
const generateSudoku = (difficulty: string, isDaily: boolean = false) => {
  let seed = new Date().setHours(0, 0, 0, 0); 
  const random = () => {
    if (!isDaily) return Math.random();
    let x = Math.sin(seed++) * 10000; return x - Math.floor(x);
  };

  const base = [
    [1,2,3,4,5,6,7,8,9], [4,5,6,7,8,9,1,2,3], [7,8,9,1,2,3,4,5,6],
    [2,3,1,5,6,4,8,9,7], [5,6,4,8,9,7,2,3,1], [8,9,7,2,3,1,5,6,4],
    [3,1,2,6,4,5,9,7,8], [6,4,5,9,7,8,3,1,2], [9,7,8,3,1,2,6,4,5]
  ];
  
  for (let i = 0; i < 9; i += 3) {
    for (let j = 0; j < 3; j++) {
      const r1 = i + Math.floor(random() * 3); const r2 = i + Math.floor(random() * 3);
      [base[r1], base[r2]] = [base[r2], base[r1]];
    }
  }
  for (let i = 0; i < 9; i += 3) {
    for (let j = 0; j < 3; j++) {
      const c1 = i + Math.floor(random() * 3); const c2 = i + Math.floor(random() * 3);
      for (let r = 0; r < 9; r++) {
        const temp = base[r][c1]; base[r][c1] = base[r][c2]; base[r][c2] = temp;
      }
    }
  }

  const solution = base.map(row => [...row]); const board = base.map(row => [...row]);
  let removeCount = difficulty === 'easy' ? 30 : difficulty === 'medium' ? 45 : 55;
  let removed = 0;
  while (removed < removeCount) {
    const r = Math.floor(random() * 9); const c = Math.floor(random() * 9);
    if (board[r][c] !== 0) { board[r][c] = 0; removed++; }
  }
  return { board, solution, initialBoard: board.map(row => [...row]) };
};

// --- ИНТЕРФЕЙС СОСТОЯНИЯ ЦИФРОВОЙ АРЕНЫ ---
interface GameState {
  board: number[][]; initialBoard: number[][]; solution: number[][];
  selectedCell: [number, number] | null; notes: Record<string, number[]>;
  isNotesMode: boolean; isBlindMode: boolean; isDaily: boolean;
  hints: number; mistakes: number; maxMistakes: number; score: number; difficulty: string;
  isGameOver: boolean; isVictory: boolean; aiMessage: string | null;
  timeElapsed: number; timerInterval: any;
  
  // PvP Параметры
  pvpRoom: string | null; isPvPHost: boolean; opponentScore: number; opponentMistakes: number; channel: any;
  
  // PRO Функционал
  isPro: boolean; nickColor: string;

  initGame: (difficulty: string) => void;
  initDaily: () => void;
  setSelectedCell: (cell: [number, number] | null) => void;
  setNumber: (num: number) => void; clearCell: () => void;
  toggleNotesMode: () => void; setBlindMode: (isActive: boolean) => void;
  useHint: () => void; useAiCoach: () => Promise<void>; clearAiMessage: () => void;
  startTimer: () => void; stopTimer: () => void;
  
  // PvP Действия
  hostPvP: () => void; joinPvP: (roomCode: string) => void; leavePvP: () => void;
  broadcastScore: () => void; broadcastLoss: () => void;
}

// --- ГЛАВНОЕ ЯДРО ХРАНИЛИЩА ---
export const useGameStore = create<GameState>((set, get) => ({
  board: Array(9).fill(Array(9).fill(0)), initialBoard: Array(9).fill(Array(9).fill(0)), solution: Array(9).fill(Array(9).fill(0)),
  selectedCell: null, notes: {}, isNotesMode: false, isBlindMode: false, isDaily: false,
  hints: 3, mistakes: 0, maxMistakes: 3, score: 0, difficulty: 'medium',
  isGameOver: false, isVictory: false, aiMessage: null, timeElapsed: 0, timerInterval: null,
  pvpRoom: null, isPvPHost: false, opponentScore: 0, opponentMistakes: 0, channel: null,
  isPro: false, nickColor: 'text-slate-300',

  // --- ЛОГИКА ТАЙМЕРА ---
  startTimer: () => {
    const { timerInterval } = get(); if (timerInterval) clearInterval(timerInterval);
    const interval = setInterval(() => set((state) => ({ timeElapsed: state.timeElapsed + 1 })), 1000);
    set({ timerInterval: interval });
  },
  stopTimer: () => { const { timerInterval } = get(); if (timerInterval) { clearInterval(timerInterval); set({ timerInterval: null }); } },

  // --- ИНИЦИАЛИЗАЦИЯ СЕЙФ-ЗОНЫ ---
  initGame: (difficulty) => {
    const { isPro } = get();
    const { board, solution, initialBoard } = generateSudoku(difficulty, false);
    set({
      difficulty, board, initialBoard, solution, selectedCell: null, notes: {}, isNotesMode: false, isDaily: false,
      hints: isPro ? 5 : 3,        // Расширенные лимиты для Pro
      maxMistakes: isPro ? 5 : 3,  // Дополнительная броня для Pro
      mistakes: 0, score: 0, isGameOver: false, isVictory: false, aiMessage: null, timeElapsed: 0,
    });
    get().startTimer();
  },

  initDaily: () => {
    const { isPro } = get();
    const { board, solution, initialBoard } = generateSudoku('hard', true);
    set({
      difficulty: 'hard', board, initialBoard, solution, selectedCell: null, notes: {}, isNotesMode: false, isBlindMode: false, isDaily: true,
      hints: isPro ? 3 : 1,        // Бонус в ежедневном вызове
      maxMistakes: isPro ? 5 : 3,
      mistakes: 0, score: 0, isGameOver: false, isVictory: false, aiMessage: null, timeElapsed: 0,
    });
    get().startTimer();
  },

  // --- PVP ПРОТОКОЛ (Supabase Channels) ---
  hostPvP: () => {
    const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const { board, solution, initialBoard } = generateSudoku('medium', false);
    const channel = supabase.channel(`room-${roomCode}`, { config: { broadcast: { self: false } } });
    
    channel.on('broadcast', { event: 'sync' }, ({ payload }) => {
      if (payload.action === 'REQUEST_BOARD') {
        channel.send({ type: 'broadcast', event: 'sync', payload: { action: 'SHARE_BOARD', board, initialBoard, solution } });
        get().startTimer();
      }
      if (payload.action === 'UPDATE_SCORE') {
        set({ opponentScore: payload.score, opponentMistakes: payload.mistakes });
      }
      if (payload.action === 'GAME_OVER_LOSS') {
        get().stopTimer();
        set({ isVictory: true, aiMessage: "СИСТЕМА: Соперник уничтожен. Вы победили!" });
        playSound('victory');
      }
    }).subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        set({ pvpRoom: roomCode, isPvPHost: true, channel, board, initialBoard, solution, score: 0, mistakes: 0, opponentScore: 0, opponentMistakes: 0, timeElapsed: 0 });
      }
    });
  },

  joinPvP: (roomCode: string) => {
    const channel = supabase.channel(`room-${roomCode}`, { config: { broadcast: { self: false } } });
    channel.on('broadcast', { event: 'sync' }, ({ payload }) => {
      if (payload.action === 'SHARE_BOARD') {
        set({ board: payload.board, initialBoard: payload.initialBoard, solution: payload.solution, score: 0, mistakes: 0, pvpRoom: roomCode, isPvPHost: false, channel, timeElapsed: 0 });
        get().startTimer();
      }
      if (payload.action === 'UPDATE_SCORE') {
        set({ opponentScore: payload.score, opponentMistakes: payload.mistakes });
      }
      if (payload.action === 'GAME_OVER_LOSS') {
        get().stopTimer();
        set({ isVictory: true, aiMessage: "СИСТЕМА: Соперник уничтожен. Вы победили!" });
        playSound('victory');
      }
    }).subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({ type: 'broadcast', event: 'sync', payload: { action: 'REQUEST_BOARD' } });
      }
    });
  },

  broadcastScore: () => {
    const { channel, score, mistakes } = get();
    if (channel) channel.send({ type: 'broadcast', event: 'sync', payload: { action: 'UPDATE_SCORE', score, mistakes } });
  },

  broadcastLoss: () => {
    const { channel } = get();
    if (channel) channel.send({ type: 'broadcast', event: 'sync', payload: { action: 'GAME_OVER_LOSS' } });
  },

  leavePvP: () => {
    const { channel } = get(); if (channel) supabase.removeChannel(channel);
    set({ pvpRoom: null, isPvPHost: false, opponentScore: 0, opponentMistakes: 0, channel: null });
    get().initGame('medium');
  },

  // --- ОБРАБОТКА ДЕЙСТВИЙ (Input) ---
  setNumber: (num) => {
    const { selectedCell, isNotesMode, board, initialBoard, solution, notes, mistakes, maxMistakes, score, difficulty, isBlindMode, isDaily, pvpRoom } = get();
    if (!selectedCell || get().isGameOver || get().isVictory) return;
    const [r, c] = selectedCell;
    if (initialBoard[r][c] !== 0 || board[r][c] !== 0) return;

    if (isNotesMode) {
      const key = `${r}-${c}`; const currentNotes = notes[key] || [];
      const newNotes = currentNotes.includes(num) ? currentNotes.filter(n => n !== num) : [...currentNotes, num];
      set({ notes: { ...notes, [key]: newNotes } });
    } else {
      if (num === solution[r][c]) {
        const newBoard = board.map(row => [...row]); newBoard[r][c] = num;
        const newNotes = { ...notes }; delete newNotes[`${r}-${c}`];
        const isVictory = newBoard.every((row, ri) => row.every((cell, ci) => cell === solution[ri][ci]));
        
        if (isVictory) { playSound('victory'); get().stopTimer(); } 
        else playSound('correct');
        
        const dailyBonus = isDaily ? 50 : 0;
        const multiplier = isBlindMode ? 2 : 1;
        set({ board: newBoard, notes: newNotes, score: score + ((difficulty === 'hard' ? 25 : difficulty === 'medium' ? 15 : 10) * multiplier) + dailyBonus, isVictory, aiMessage: null });
        if (pvpRoom) get().broadcastScore(); 

      } else {
        const newMistakes = mistakes + 1;
        if (newMistakes >= maxMistakes) {
          playSound('gameover'); get().stopTimer();
          set({ mistakes: newMistakes, score: Math.max(0, score - 5), isGameOver: true });
          if (pvpRoom) get().broadcastLoss(); // Передача сигнала поражения
        } else {
          playSound('error'); set({ mistakes: newMistakes, score: Math.max(0, score - 5) });
        }
        if (pvpRoom) get().broadcastScore();
      }
    }
  },

  // --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
  setSelectedCell: (cell) => set({ selectedCell: cell, aiMessage: null }),
  toggleNotesMode: () => set((state) => ({ isNotesMode: !state.isNotesMode })),
  clearCell: () => {
    const { selectedCell, board, initialBoard } = get();
    if (!selectedCell || get().isGameOver || get().isVictory) return;
    const [r, c] = selectedCell; if (initialBoard[r][c] !== 0) return;
    const newBoard = board.map(row => [...row]); newBoard[r][c] = 0;
    set({ board: newBoard });
  },

  useHint: () => {
    const { hints, selectedCell, initialBoard, board, solution, isGameOver, isVictory, pvpRoom } = get();
    if (hints > 0 && selectedCell && !isGameOver && !isVictory) {
      const [r, c] = selectedCell;
      if (initialBoard[r][c] === 0 && board[r][c] === 0) {
        const newBoard = board.map(row => [...row]); newBoard[r][c] = solution[r][c];
        const isGameWon = newBoard.every((row, ri) => row.every((cell, ci) => cell === solution[ri][ci]));
        if (isGameWon) { playSound('victory'); get().stopTimer(); } else playSound('correct'); 
        set({ board: newBoard, hints: hints - 1, isVictory: isGameWon, aiMessage: null });
        if (pvpRoom) get().broadcastScore();
      }
    }
  },

  useAiCoach: async () => {
    const { selectedCell, board, initialBoard, solution, hints } = get();
    if (!selectedCell || hints <= 0) return;
    const [r, c] = selectedCell;
    if (initialBoard[r][c] !== 0 || board[r][c] !== 0) { set({ aiMessage: `Терминал: Данные в клетке [${r+1}, ${c+1}] уже подтверждены.` }); return; }
    
    set({ aiMessage: "Установка нейро-связи...\nАнализ паттернов...", hints: hints - 1 });
    try {
      const res = await fetch('/api/ai-coach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ board, row: r, col: c, answer: solution[r][c] }) });
      const data = await res.json();
      if (res.ok) { set({ aiMessage: data.message }); playSound('correct'); } 
      else throw new Error(data.message || "Ошибка сервера");
    } catch (e) {
      set({ aiMessage: "[СИСТЕМНЫЙ СБОЙ] Связь потеряна." }); playSound('error');
    }
  },

  setBlindMode: (isActive) => {
    if (get().isBlindMode === isActive) return;
    set({ isBlindMode: isActive });
    if (!get().isDaily && !get().pvpRoom) get().initGame(get().difficulty);
  },

  clearAiMessage: () => set({ aiMessage: null }),
}));