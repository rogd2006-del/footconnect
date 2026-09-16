const views = document.querySelectorAll('.view');
const navItems = document.querySelectorAll('.nav-item');
const toast = document.querySelector('.toast');
const createModal = document.querySelector('#create-modal');
let games = [];
let joinedGames = new Set();
let toastTimer;

async function api(path, options = {}) {
  const response = await fetch(path, { headers: { 'content-type': 'application/json' }, ...options });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'Something went wrong.');
  return payload.data;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

function showView(viewId) {
  views.forEach(view => view.classList.toggle('active', view.id === viewId));
  navItems.forEach(item => item.classList.toggle('active', item.dataset.view === viewId));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function gameMarkup(game, type = 'list') {
  const spots = game.capacity - game.joined;
  if (type === 'featured') {
    return `<div class="game-topline"><span class="live-pill"><i></i> ${spots} spots open</span><span>${game.distance} km away</span></div><div class="game-info"><div><p class="game-time">${game.startsAt}</p><h3>${game.turf}</h3><p class="game-meta">${game.format} <span>•</span> ${game.skill} <span>•</span> 90 min</p></div><div class="player-stack"><strong>${game.joined}<span>/${game.capacity}</span></strong></div></div><div class="game-bottom"><div class="progress"><span style="width:${(game.joined / game.capacity) * 100}%"></span></div><button class="join-btn" data-join="${game.id}">${joinedGames.has(game.id) ? 'Joined ✓' : 'Join game ↗'}</button></div>`;
  }
  return `<div class="list-icon green-icon">⚽</div><div class="list-content"><div class="game-topline"><span class="live-pill"><i></i> ${spots} spots open</span><span>${game.distance} km</span></div><h3>${game.turf}</h3><p>${game.startsAt} · ${game.format}</p></div><button class="round-arrow" data-join="${game.id}" aria-label="Join game">${joinedGames.has(game.id) ? '✓' : '↗'}</button>`;
}

function renderGames() {
  const openGames = games.filter(game => game.joined < game.capacity);
  const featured = document.querySelector('.featured-game');
  if (featured && openGames[0]) {
    featured.dataset.gameId = openGames[0].id;
    featured.innerHTML = gameMarkup(openGames[0], 'featured');
  }
  const list = document.querySelector('.game-list');
  if (list) list.innerHTML = openGames.map(game => `<article class="game-list-item">${gameMarkup(game)}</article>`).join('');
}

function setJoined(gameId) {
  if (joinedGames.has(gameId)) {
    showToast('You are already on this team.');
    return;
  }
  api(`/api/games/${gameId}/join`, { method: 'POST', body: '{}' }).then(game => {
    joinedGames.add(gameId);
    games = games.map(item => item.id === game.id ? game : item);
    renderGames();
    showToast('You’re in! Game added to My games.');
  }).catch(error => showToast(error.message));
}

async function loadData() {
  try {
    games = await api('/api/games');
    renderGames();
  } catch (error) {
    showToast('Live data is unavailable. Showing the demo games.');
    console.error(error);
  }
}

document.addEventListener('click', event => {
  const viewTrigger = event.target.closest('[data-view]');
  if (viewTrigger) showView(viewTrigger.dataset.view);

  const joinTrigger = event.target.closest('[data-join]');
  if (joinTrigger) setJoined(joinTrigger.dataset.join);

  const modalTrigger = event.target.closest('[data-modal]');
  if (modalTrigger) createModal.classList.add('open');

  if (event.target.matches('[data-close-modal]') || event.target === createModal) createModal.classList.remove('open');

  const formatOption = event.target.closest('.format-option');
  if (formatOption) {
    document.querySelectorAll('.format-option').forEach(option => option.classList.remove('selected'));
    formatOption.classList.add('selected');
  }

  const heart = event.target.closest('.heart');
  if (heart) {
    heart.textContent = heart.textContent === '♡' ? '♥' : '♡';
    heart.style.color = heart.textContent === '♥' ? 'var(--green)' : '';
    showToast(heart.textContent === '♥' ? 'Turf saved to your favourites.' : 'Turf removed from favourites.');
  }
});

document.querySelector('.modal-submit').addEventListener('click', async () => {
  const turfName = document.querySelector('.modal select').value;
  const turfId = turfName === 'Andheri Football Arena' ? 'andheri-arena' : turfName === 'PlayMax Sports Club' ? 'playmax' : 'kicksters';
  const startsAt = `${document.querySelector('input[type="date"]').value} ${document.querySelector('input[type="time"]').value}`;
  const format = document.querySelector('.format-option.selected').textContent;
  try {
    const game = await api('/api/games', { method: 'POST', body: JSON.stringify({ turfId, startsAt, format, capacity: format === '5v5' ? 10 : format === '7v7' ? 14 : 22 }) });
    games = [game, ...games];
    renderGames();
    createModal.classList.remove('open');
    showToast('Game created. Invite your crew!');
  } catch (error) {
    showToast(error.message);
  }
});

document.querySelector('.notification-btn').addEventListener('click', () => showToast('No new notifications. You’re all caught up.'));
document.querySelectorAll('.map-pin').forEach(pin => pin.addEventListener('click', () => showToast(pin.classList.contains('pin-main') ? 'Andheri Football Arena · 3 spots open' : 'Turf details coming soon')));
loadData();
