(() => {
  'use strict';

  const app = window.BKGXIApp;
  const $ = (id) => document.getElementById(id);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  if (!app) return;

  const loading = $('appLoadingOverlay');
  const network = $('appNetworkStatus');
  const profileForm = $('profileForm');
  const profileModal = $('profileModal');
  const chatList = $('chatMessages');
  const jumpLatest = $('chatJumpLatest');
  let previewUrl = '';
  let bannerTimer = 0;
  let lastFocused = null;

  function hideLoading() {
    loading?.classList.add('is-hidden');
    setTimeout(() => loading?.remove(), 450);
  }

  function showBanner(message, state = 'online', persistent = false, action = null) {
    if (!network) return;
    clearTimeout(bannerTimer);
    network.className = `app-network-status is-visible ${state}`;
    network.innerHTML = `<span>${message}</span>${action ? `<button type="button">${action.label}</button>` : ''}`;
    if (action) network.querySelector('button')?.addEventListener('click', action.callback, { once:true });
    if (!persistent) bannerTimer = setTimeout(() => network.classList.remove('is-visible'), 2300);
  }

  function updateConnection() {
    const online = navigator.onLine;
    const dot = $('chatConnectionDot');
    dot?.classList.toggle('offline', !online);
    if (online) {
      showBanner('Back online · syncing team data', 'online');
    } else {
      showBanner('You are offline · changes stay on this phone until you reconnect', 'offline', true);
    }
    app.renderChat?.();
  }

  window.addEventListener('bkgxi:ready', hideLoading, { once:true });
  setTimeout(hideLoading, 9000);
  window.addEventListener('online', updateConnection);
  window.addEventListener('offline', updateConnection);

  window.addEventListener('bkgxi:save-state', (event) => {
    const status = event.detail?.status;
    if (status === 'saving') showBanner('Saving…', 'saving', true);
    if (status === 'saved') showBanner('Saved to the team database', 'online');
    if (status === 'offline') showBanner('Saved on this phone · waiting for internet', 'offline', true);
    if (status === 'error') showBanner('Could not sync · your local copy is safe', 'error', true, { label:'Retry', callback:()=>app.saveData() });
    if (status === 'conflict') showBanner('Newer data was saved on another phone', 'error', true, { label:'Reload latest', callback:()=>window.location.reload() });
  });

  $('toggleLoginPin')?.addEventListener('click', () => {
    const input = $('loginPin');
    if (!input) return;
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    $('toggleLoginPin').textContent = show ? 'Hide' : 'Show';
    $('toggleLoginPin').setAttribute('aria-label', show ? 'Hide PIN' : 'Show PIN');
    input.focus();
  });

  function updateLoginHint() {
    const select = $('loginAccount');
    const message = $('loginMessage');
    if (!select || !message || message.classList.contains('error')) return;
    if (select.value === 'admin') {
      message.textContent = 'Administrator settings use a separate PIN. Captain access is available through the captain player profile.';
      message.className = 'form-message hint';
    } else {
      message.textContent = 'Use the private PIN assigned to the selected player.';
      message.className = 'form-message hint';
    }
  }
  $('loginAccount')?.addEventListener('change', updateLoginHint);
  document.querySelector('[data-close="loginModal"]')?.addEventListener('click', () => {
    const input = $('loginPin'); if (input) input.type = 'password';
    if ($('toggleLoginPin')) $('toggleLoginPin').textContent = 'Show';
  });

  function validateJersey() {
    const input = $('profileJersey');
    const status = $('profileJerseyStatus');
    const current = app.getSessionPlayer?.();
    if (!input || !status || !current) return true;
    const jersey = Number(input.value);
    const duplicate = app.activePlayers().some((player) => player.id !== current.id && Number(player.jersey) === jersey);
    const valid = Number.isInteger(jersey) && jersey >= 0 && jersey <= 999 && !duplicate;
    status.textContent = duplicate ? 'This jersey is already used.' : valid ? 'Jersey number is available.' : 'Enter a number from 0 to 999.';
    status.className = valid ? 'field-success' : 'field-error';
    return valid;
  }

  profileForm?.addEventListener('input', () => { profileForm.dataset.dirty = 'true'; });
  profileForm?.addEventListener('change', () => { profileForm.dataset.dirty = 'true'; });
  $('profileJersey')?.addEventListener('input', validateJersey);
  $('profilePhoto')?.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    const preview = $('profilePhotoPreview');
    if (!file || !preview) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = URL.createObjectURL(file);
    preview.innerHTML = `<img src="${previewUrl}" alt="New profile photo preview">`;
    profileForm.dataset.dirty = 'true';
  });

  function requestProfileClose() {
    if (profileForm?.dataset.dirty === 'true' && !window.confirm('Discard your unsaved profile changes?')) return false;
    if (profileForm) profileForm.dataset.dirty = 'false';
    if (previewUrl) { URL.revokeObjectURL(previewUrl); previewUrl = ''; }
    app.closeModal('profileModal');
    return true;
  }

  document.addEventListener('click', (event) => {
    const close = event.target.closest('[data-close="profileModal"]');
    const backdrop = event.target === profileModal;
    if (!close && !backdrop) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    requestProfileClose();
  }, true);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && profileModal?.classList.contains('show')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      requestProfileClose();
    }
  }, true);

  window.addEventListener('beforeunload', (event) => {
    if (profileForm?.dataset.dirty === 'true') { event.preventDefault(); event.returnValue = ''; }
  });

  function updateJumpButton() {
    if (!chatList || !jumpLatest) return;
    const far = chatList.scrollHeight - chatList.scrollTop - chatList.clientHeight > 150;
    jumpLatest.classList.toggle('hidden', !far);
  }
  chatList?.addEventListener('scroll', updateJumpButton, { passive:true });
  jumpLatest?.addEventListener('click', () => {
    chatList.scrollTo({ top:chatList.scrollHeight, behavior:'smooth' });
    jumpLatest.classList.add('hidden');
  });
  window.addEventListener('bkgxi:render', () => setTimeout(updateJumpButton, 0));

  function focusable(modal) {
    return $$('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', modal)
      .filter((item) => item.offsetParent !== null);
  }
  const modalObserver = new MutationObserver((mutations) => {
    mutations.forEach(({ target }) => {
      if (!(target instanceof HTMLElement) || !target.classList.contains('modal')) return;
      if (target.classList.contains('show')) {
        lastFocused = document.activeElement;
        target.setAttribute('role', 'dialog');
        target.setAttribute('aria-modal', 'true');
        setTimeout(() => focusable(target)[0]?.focus(), 30);
      } else {
        if (target === profileModal && previewUrl) { URL.revokeObjectURL(previewUrl); previewUrl = ''; }
        if (lastFocused instanceof HTMLElement) lastFocused.focus?.();
      }
    });
  });
  $$('.modal').forEach((modal) => modalObserver.observe(modal, { attributes:true, attributeFilter:['class'] }));

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const modal = document.querySelector('.modal.show');
    if (!modal) return;
    const items = focusable(modal);
    if (!items.length) return;
    const first = items[0], last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  document.addEventListener('click', (event) => {
    const play = event.target.closest('[data-open-boundary-blitz]');
    if (play) { event.preventDefault(); window.location.href = '/game.html'; }
  });

  if (!navigator.onLine) updateConnection();
  setTimeout(updateLoginHint, 100);
})();
