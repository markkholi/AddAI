let muted = true;
let context: AudioContext | null = null;

export function isMuted(): boolean {
  return muted;
}

export function setMuted(next: boolean): void {
  muted = next;
}

function getContext(): AudioContext | null {
  const AudioCtx = window.AudioContext;
  if (!AudioCtx) {
    return null;
  }
  if (!context) {
    context = new AudioCtx();
  }
  return context;
}

function blip(frequency: number, duration: number): void {
  if (muted) {
    return;
  }
  const audio = getContext();
  if (!audio) {
    return;
  }
  if (audio.state === 'suspended') {
    void audio.resume();
  }
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  gain.gain.value = 0.07;
  oscillator.connect(gain);
  gain.connect(audio.destination);
  const now = audio.currentTime;
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  oscillator.start(now);
  oscillator.stop(now + duration);
}

export function playCorrect(): void {
  blip(784, 0.14);
}

export function playWrong(): void {
  blip(247, 0.16);
}
