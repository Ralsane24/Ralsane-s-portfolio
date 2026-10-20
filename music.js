const soundtrack = document.querySelector('#site-ost');
const musicToggle = document.querySelector('#music-toggle');
const volumeSlider = document.querySelector('#music-volume');
const musicStatus = document.querySelector('#music-status');
let initialVolume = 35;
try {
  const saved = localStorage.getItem('ralsane-music-volume');
  if (saved !== null && Number.isFinite(Number(saved))) initialVolume = Math.min(100, Math.max(0, Number(saved)));
} catch { /* Use the default when storage is unavailable. */ }
function applyVolume(value) {
  soundtrack.volume = value / 100;
  volumeSlider.value = value;
  volumeSlider.style.setProperty('--volume', `${value}%`);
  document.querySelector('#volume-level').textContent = `${value}%`;
  volumeSlider.setAttribute('aria-valuetext', value === 0 ? 'Muted' : `${value} percent`);
}
function updatePlayback() {
  const playing = !soundtrack.paused;
  musicToggle.setAttribute('aria-pressed', String(playing));
  musicToggle.setAttribute('aria-label', playing ? 'Pause background music' : 'Play background music');
  document.querySelector('#music-action').textContent = playing ? 'PAUSE' : 'PLAY';
  document.querySelector('#music-icon').textContent = playing ? 'Ⅱ' : '▶';
  document.querySelector('.music-bar').classList.toggle('playing', playing);
  musicStatus.textContent = playing ? (soundtrack.volume === 0 ? 'NOW PLAYING · MUTED' : 'NOW PLAYING · LOOP ON') : 'PAUSED · PRESS PLAY TO CONTINUE';
}
applyVolume(initialVolume);
volumeSlider.addEventListener('input', () => {
  applyVolume(Number(volumeSlider.value));
  try { localStorage.setItem('ralsane-music-volume', volumeSlider.value); } catch { /* Session volume still works. */ }
  if (!soundtrack.paused) updatePlayback();
});
musicToggle.addEventListener('click', async () => {
  if (!soundtrack.paused) { soundtrack.pause(); return; }
  try { await soundtrack.play(); }
  catch { musicStatus.textContent = 'COULD NOT START AUDIO · PRESS PLAY TO RETRY'; }
});
soundtrack.addEventListener('play', updatePlayback);
soundtrack.addEventListener('pause', updatePlayback);
soundtrack.addEventListener('error', () => { musicStatus.textContent = 'SOUNDTRACK UNAVAILABLE · PLEASE RELOAD'; });
// Attempt playback; browser autoplay rules may require the Play button first.
soundtrack.play().catch(() => { musicStatus.textContent = 'PRESS PLAY TO START THE SOUNDTRACK'; });
