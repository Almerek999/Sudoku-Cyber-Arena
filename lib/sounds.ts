export const playSound = (type: 'correct' | 'error' | 'victory' | 'gameover') => {
  if (typeof window === 'undefined') return;

  // Инициализируем аудио-контекст браузера
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();

  // Функция для создания звуковых волн
  const playTone = (freq: number, wave: OscillatorType, duration: number, startTime: number = 0, vol: number = 0.1) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + startTime);
    osc.stop(ctx.currentTime + startTime + duration);
  };

  // Кибер-звуки
  if (type === 'correct') {
    // Двойной высокий писк
    playTone(800, 'sine', 0.1);
    playTone(1200, 'sine', 0.15, 0.1);
  } else if (type === 'error') {
    // Низкий жесткий бас-гудок
    playTone(150, 'sawtooth', 0.3, 0, 0.2);
  } else if (type === 'victory') {
    // Триумфальный мажорный арпеджио-аккорд
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      playTone(freq, 'square', 0.2, i * 0.15);
    });
  } else if (type === 'gameover') {
    // Мрачное затухание
    [300, 250, 200, 150].forEach((freq, i) => {
      playTone(freq, 'sawtooth', 0.4, i * 0.3, 0.2);
    });
  }
};