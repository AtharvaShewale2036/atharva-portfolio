const KEY = 'snd';
let ctx: AudioContext | null = null;

const enabled = (): boolean => {
  try { return localStorage.getItem(KEY) === 'on'; } catch { return false; }
};

// Square-wave blip; the AudioContext starts suspended until a user gesture, so nothing plays before one.
export function playBlip(kind: 'flip' | 'select'): void {
  if (!enabled()) return;
  ctx ??= new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = kind === 'flip' ? 220 : 660;
  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.08);
}

export function initSoundToggle(): void {
  let session = enabled();
  document.querySelectorAll<HTMLButtonElement>('[data-sound-toggle]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(session));
    btn.addEventListener('click', () => {
      session = !session;
      try { localStorage.setItem(KEY, session ? 'on' : 'off'); } catch {}
      btn.setAttribute('aria-pressed', String(session));
      if (session) playBlip('select');
    });
  });
}
