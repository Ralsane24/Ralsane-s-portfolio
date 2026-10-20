// Personalize the portfolio here. Leave email blank to use the local setup dialog.
const portfolio = { email: '', projects: [
  { title: 'Castle Crashers', image: 'assets/castle-crashers.png', alt: 'A stylized floating castle environment created in Blender', description: 'Created in Blender, Castle Crashers is a stylized 3D environment designed as an environmental background. Floating towers, rocky islands, and a sea of clouds create a world that feels ready for an adventure. The composition brings together depth, playful shapes, and contrasting warm roofs and cool skies to give the scene its atmosphere.', tags: ['Blender', '3D environment', 'Environmental background'], note: 'Full environment render — explore the world beyond the thumbnail.' },
  { title: 'A Frame of an Animator’s Dream', image: 'assets/animators-dream.png', alt: 'A frame of two student characters from Ralsane’s animation work', description: 'Made in Adobe Animate, this project showcases my animation work through a frame full of character and warmth. Expressive poses, clear silhouettes, and a shared everyday moment bring the students’ personalities into focus. It reflects my love for visual storytelling and the care that goes into making characters feel alive, one frame at a time.', tags: ['Adobe Animate', 'Animation', 'Character storytelling'], note: 'Still frame from the animation project.' },
  { title: 'Making Fanarts', image: 'assets/fanart.jpg', alt: 'A smiling blond character with floating playing cards in Ralsane’s fanart', description: 'Making fanart is how I celebrate the characters and worlds that inspire me. This illustration explores a playful expression, warm lighting, and floating cards to give the character a sense of energy and personality. It is a space for me to experiment with color, composition, and my own approach to familiar characters.', tags: ['Fanart', 'Digital illustration', 'Character art'], note: 'Original fanart by Ralsane.' }
] };
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.filter').forEach(filter => { filter.classList.toggle('active', filter === button); filter.setAttribute('aria-pressed', String(filter === button)); });
  document.querySelectorAll('.project-card').forEach(card => {
    card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
    if (!card.hidden && !reducedMotion.matches) card.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 350, easing: 'ease-in-out' });
  });
  const count = document.querySelectorAll('.project-card:not([hidden])').length;
  document.querySelector('#project-count').textContent = `${count} ${count === 1 ? 'project' : 'projects'} to explore. Pick one to see the full artwork and its story.`;
}));
const projectDialog = document.querySelector('#project-dialog');
document.querySelectorAll('[data-project]').forEach(card => card.addEventListener('click', () => {
  const project = portfolio.projects[Number(card.dataset.project)];
  document.querySelector('#dialog-title').textContent = project.title;
  document.querySelector('#dialog-description').textContent = project.description;
  const artwork = document.querySelector('#dialog-artwork');
  artwork.src = project.image;
  artwork.alt = project.alt;
  document.querySelector('#dialog-media-note').textContent = project.note;
  document.querySelector('#dialog-tags').replaceChildren(...project.tags.map(tag => { const span = document.createElement('span'); span.textContent = tag; return span; }));
  projectDialog.showModal();
}));
function closeDialog(dialog) {
  if (dialog.classList.contains('closing')) return;
  dialog.classList.add('closing');
  window.setTimeout(() => { dialog.close(); dialog.classList.remove('closing'); }, reducedMotion.matches ? 0 : 210);
}
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.close').addEventListener('click', () => closeDialog(dialog));
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeDialog(dialog); });
  dialog.addEventListener('click', event => { if (event.target !== dialog) return; const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(dialog); });
});
document.querySelector('.dialog-done').addEventListener('click', () => closeDialog(projectDialog));
const contactDialog = document.querySelector('#contact-dialog');
let savedEmail = '';
try { savedEmail = localStorage.getItem('playerone-contact') || ''; } catch { /* Local storage may be unavailable in private browsing. */ }
document.querySelector('#contact-open').addEventListener('click', () => {
  const email = portfolio.email || savedEmail;
  if (email) { window.location.href = `mailto:${encodeURIComponent(email)}?subject=Let%E2%80%99s%20create%20something`; return; }
  contactDialog.showModal();
});
document.querySelector('#email-form').addEventListener('submit', event => {
  event.preventDefault();
  savedEmail = document.querySelector('#email').value.trim();
  try { localStorage.setItem('playerone-contact', savedEmail); document.querySelector('#email-status').textContent = 'Saved! “Let’s talk” will now open your email app. Edit script.js to set this for every visitor.'; }
  catch { document.querySelector('#email-status').textContent = 'Email set for this session. Edit script.js to make it permanent.'; }
});
document.querySelectorAll('.button').forEach(button => button.addEventListener('click', event => {
  if (reducedMotion.matches) return;
  const bounds = button.getBoundingClientRect(); const ripple = document.createElement('span'); ripple.className = 'ripple';
  ripple.style.left = `${(event.detail ? event.clientX - bounds.left : bounds.width / 2) - 10}px`;
  ripple.style.top = `${(event.detail ? event.clientY - bounds.top : bounds.height / 2) - 10}px`;
  button.append(ripple); window.setTimeout(() => ripple.remove(), 700);
}));
document.querySelector('#year').textContent = new Date().getFullYear();
