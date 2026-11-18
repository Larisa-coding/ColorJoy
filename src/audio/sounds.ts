import { useSettings } from '@/store/settings';

let ctx: AudioContext | null = null;
let musicTimer = 0;

const context = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    ctx = new Ctx();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
};

export const unlockAudio = () => {
  context();
};

const tone = (freq: number, dur: number, type: OscillatorType, gain: number, musical = false) => {
  const { sound, music, volume } = useSettings.getState();
  const audio = context();
  if (!audio || volume <= 0) return;
  if (musical ? !music : !sound) return;
  const now = audio.currentTime;
  const osc = audio.createOscillator();
  const amp = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  amp.gain.setValueAtTime(gain * volume, now);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  osc.connect(amp);
  amp.connect(audio.destination);
  osc.start(now);
  osc.stop(now + dur);
};

export const playTap = () => tone(520, 0.06, 'sine', 0.03);
export const playTool = () => tone(640, 0.07, 'triangle', 0.03);
export const playColor = () => tone(720, 0.08, 'sine', 0.025);
export const playFill = () => {
  tone(480, 0.1, 'sine', 0.03);
  window.setTimeout(() => tone(680, 0.12, 'sine', 0.025), 70);
};
export const playSave = () => tone(880, 0.14, 'sine', 0.03);
export const playDone = () => {
  tone(523, 0.12, 'sine', 0.03);
  window.setTimeout(() => tone(659, 0.14, 'sine', 0.03), 90);
  window.setTimeout(() => tone(784, 0.18, 'sine', 0.03), 180);
};

const notes = [392, 440, 494, 523, 494, 440];

export const syncMusic = () => {
  window.clearInterval(musicTimer);
  const { music, volume } = useSettings.getState();
  if (!music || volume <= 0) return;
  let step = 0;
  musicTimer = window.setInterval(() => {
    const state = useSettings.getState();
    if (!state.music) return;
    tone(notes[step % notes.length], 0.35, 'sine', 0.012, true);
    step += 1;
  }, 1700);
};
