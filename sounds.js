// Tiny synthesized chiptune cues; no extra audio downloads required.
let effectsEnabled = true;
try { effectsEnabled = localStorage.getItem('ralsane-sfx') !== 'off'; } catch {}
const effectsToggle = document.querySelector('#sfx-toggle');
function updateEffectsToggle() {
  effectsToggle.setAttribute('aria-pressed', String(effectsEnabled));
  effectsToggle.textContent = effectsEnabled ? 'SFX ON' : 'SFX OFF';
  effectsToggle.setAttribute('aria-label', effectsEnabled ? 'Turn off interface sounds' : 'Turn on interface sounds');
}
updateEffectsToggle();
effectsToggle.addEventListener('click', () => {
  effectsEnabled = !effectsEnabled;
  try { localStorage.setItem('ralsane-sfx', effectsEnabled ? 'on' : 'off'); } catch {}
  updateEffectsToggle();
  if (effectsEnabled) bitSound('click');
});
let soundContext;
let lastHoverSound = 0;
function getSoundContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!soundContext) soundContext = new AudioContextClass();
  return soundContext;
}
function bitSound(kind) {
  if (!effectsEnabled) return;
  const context = getSoundContext();
  if (!context || context.state !== 'running') return;
  const volume = Number(document.querySelector('#music-volume').value) / 100;
  if (volume === 0) return;
  const start = context.currentTime;
  const click = kind === 'click';
  const duration = click ? .105 : .045;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(click ? 523.25 : 880, start);
  oscillator.frequency.setValueAtTime(click ? 783.99 : 1174.66, start + (click ? .04 : .022));
  if (click) oscillator.frequency.setValueAtTime(1046.5, start + .073);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume * (click ? .085 : .045), start + .003);
  gain.gain.setValueAtTime(volume * (click ? .085 : .045), start + duration - .015);
  gain.gain.linearRampToValueAtTime(0, start + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + .01);
  oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
}
// Browsers unlock Web Audio on the first click or keyboard interaction.
function unlockSounds() {
  const context = getSoundContext();
  if (context && context.state === 'suspended') context.resume().catch(() => {});
}
document.addEventListener('pointerdown', unlockSounds, { capture: true });
document.addEventListener('keydown', unlockSounds, { capture: true });
const soundTargets = 'button, a[href], input[type="range"]';
document.addEventListener('pointerover', event => {
  if (event.pointerType === 'touch') return;
  const target = event.target.closest(soundTargets);
  if (!target || target.disabled || target.contains(event.relatedTarget)) return;
  const now = performance.now();
  if (now - lastHoverSound < 65) return;
  lastHoverSound = now;
  bitSound('hover');
});
document.addEventListener('focusin', event => {
  if (event.target.matches(soundTargets) && event.target.matches(':focus-visible')) bitSound('hover');
});
document.addEventListener('click', event => {
  const target = event.target.closest('button, a[href]');
  if (!target || target.disabled) return;
  const context = getSoundContext();
  if (!context) return;
  if (context.state === 'suspended') context.resume().then(() => bitSound('click')).catch(() => {});
  else bitSound('click');
}, { capture: true });
