const views = document.querySelectorAll('.view');
const navItems = document.querySelectorAll('.nav-item');
const toast = document.querySelector('.toast');
const createModal = document.querySelector('#create-modal');
let joinedGames = new Set();
let toastTimer;

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

function setJoined(gameId) {
  if (joinedGames.has(gameId)) {
    showToast('You are already on this team.');
    return;
  }

  joinedGames.add(gameId);
  document.querySelectorAll(`[data-join="${gameId}"]`).forEach(button => {
    button.textContent = button.classList.contains('join-btn') ? 'Joined ✓' : '✓';
    button.classList.add('joined');
  });
  showToast('You’re in! Game added to My games.');
}

document.addEventListener('click', event => {
  const viewTrigger = event.target.closest('[data-view]');
  if (viewTrigger) showView(viewTrigger.dataset.view);

  const joinTrigger = event.target.closest('[data-join]');
  if (joinTrigger) setJoined(joinTrigger.dataset.join);

  const modalTrigger = event.target.closest('[data-modal]');
  if (modalTrigger) createModal.classList.add('open');

  if (event.target.matches('[data-close-modal]') || event.target === createModal) {
    createModal.classList.remove('open');
  }

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

document.querySelector('.modal-submit').addEventListener('click', () => {
  createModal.classList.remove('open');
  showToast('Game created. Invite your crew!');
});

document.querySelector('.notification-btn').addEventListener('click', () => showToast('No new notifications. You’re all caught up.'));

document.querySelectorAll('.map-pin').forEach(pin => {
  pin.addEventListener('click', () => showToast(pin.classList.contains('pin-main') ? 'Andheri Football Arena · 3 spots open' : 'Turf details coming soon'));
});
