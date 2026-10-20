// One active screen at a time; fast clicks are queued to the most recent choice.
const screens = [...document.querySelectorAll('#tab-stage > section[id]')];
const screenTabs = [...document.querySelectorAll('[role="tab"]')];
const stage = document.querySelector('#tab-stage');
const curtain = document.querySelector('.pixel-transition');
const validScreen = name => screens.some(screen => screen.id === name);
let currentScreen = validScreen(location.hash.slice(1)) ? location.hash.slice(1) : 'home';
let requestedScreen = currentScreen;
let switching = false;
const screenMessages = { home: 'HOME LOADED — WELCOME, ADVENTURER!', about: 'PLAYER PROFILE — GET TO KNOW RALSANE', projects: 'INVENTORY OPEN — PICK A PROJECT', contact: 'NEW QUEST — LET’S MAKE SOMETHING' };
function renderScreen(name) {
  screens.forEach(screen => {
    const active = screen.id === name;
    screen.hidden = !active;
    screen.setAttribute('role', 'tabpanel');
    screen.setAttribute('aria-labelledby', `tab-${screen.id}`);
    screen.tabIndex = 0;
  });
  screenTabs.forEach(tab => {
    const active = tab.hash === `#${name}`;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  document.querySelector('#scene-name').textContent = name.toUpperCase();
  document.querySelector('#scene-status').textContent = screenMessages[name];
  document.querySelector('.status').lastChild.textContent = ` SAVE POINT: ${name.toUpperCase()}`;
  stage.scrollTop = 0;
  currentScreen = name;
}
function makePixels() {
  const columns = Math.max(8, Math.ceil(curtain.clientWidth / 55));
  const rows = Math.max(5, Math.ceil(curtain.clientHeight / 55));
  curtain.style.gridTemplateColumns = `repeat(${columns},1fr)`;
  curtain.style.gridTemplateRows = `repeat(${rows},1fr)`;
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < rows * columns; i++) {
    const pixel = document.createElement('i');
    pixel.style.setProperty('--delay', `${Math.floor(Math.random() * 160)}ms`);
    pixel.style.setProperty('--shade', ['#315c9c', '#477bc4', '#6394d5', '#a9c9ef'][i % 4]);
    fragment.append(pixel);
  }
  curtain.replaceChildren(fragment);
}
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function switchScreen(name, updateHistory = true) {
  if (!validScreen(name)) return;
  requestedScreen = name;
  if (updateHistory && location.hash !== `#${name}`) history.pushState(null, '', `#${name}`);
  if (switching || name === currentScreen) return;
  switching = true;
  stage.setAttribute('aria-busy', 'true');
  try {
    while (requestedScreen !== currentScreen) {
      if (reducedMotion.matches) { renderScreen(requestedScreen); continue; }
      makePixels();
      curtain.classList.add('running');
      // Commit the initial tile scale before animating the pixel curtain in.
      curtain.getBoundingClientRect();
      curtain.classList.add('covered');
      await pause(340);
      const focusWasInScreen = stage.contains(document.activeElement);
      renderScreen(requestedScreen);
      if (focusWasInScreen) document.querySelector(`#tab-${currentScreen}`).focus({ preventScroll: true });
      curtain.classList.remove('covered');
      await pause(340);
      curtain.classList.remove('running');
    }
  } finally {
    switching = false;
    stage.removeAttribute('aria-busy');
  }
}
document.querySelectorAll('a[href^="#"]').forEach(link => {
  if (!validScreen(link.hash.slice(1))) return;
  link.addEventListener('click', event => { event.preventDefault(); switchScreen(link.hash.slice(1)); });
});
screenTabs.forEach((tab, index) => tab.addEventListener('keydown', event => {
  let next;
  if (event.key === 'ArrowRight') next = (index + 1) % screenTabs.length;
  if (event.key === 'ArrowLeft') next = (index + screenTabs.length - 1) % screenTabs.length;
  if (event.key === 'Home') next = 0;
  if (event.key === 'End') next = screenTabs.length - 1;
  if (next === undefined) return;
  event.preventDefault();
  screenTabs[next].focus();
  switchScreen(screenTabs[next].hash.slice(1));
}));
window.addEventListener('hashchange', () => switchScreen(validScreen(location.hash.slice(1)) ? location.hash.slice(1) : 'home', false));
window.addEventListener('popstate', () => switchScreen(validScreen(location.hash.slice(1)) ? location.hash.slice(1) : 'home', false));
renderScreen(currentScreen);
