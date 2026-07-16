(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const app = () => window.BKGXIApp;
  const router = () => window.BKGXIRouter;
  const isVisible = (element) => Boolean(element && !element.classList.contains('hidden') && !element.classList.contains('permission-hidden'));
  const modalOpen = (id) => Boolean($(id)?.classList.contains('show'));
  const later = (callback, delay = 70) => window.setTimeout(callback, delay);

  function feedback(message) {
    if (app()?.toast) app().toast(message);
    else {
      const fallback = $('toast');
      if (fallback) {
        fallback.textContent = message;
        fallback.classList.add('show');
        setTimeout(() => fallback.classList.remove('show'), 2500);
      }
    }
  }

  function openForSession(modalId, permission = 'login') {
    const api = app();
    if (!api) return;
    const session = api.getSession?.();
    if (!session) {
      api.openModal?.('loginModal');
      feedback('Log in to use this action.');
      return;
    }
    if (permission === 'manage' && !api.canManage?.()) {
      feedback('This action is available to the captain, vice-captain or administrator.');
      return;
    }
    if (permission === 'admin' && !api.isAdmin?.()) {
      feedback('Administrator login is required for this action.');
      return;
    }
    api.openModal?.(modalId);
  }

  function ensureProfileEditor() {
    const api = app();
    if (!api) return;
    if (!api.getSession?.()) return openForSession('profileModal');
    api.openProfileModal?.();
  }

  function ensureNoticeEditor() {
    const api = app();
    if (!api) return;
    if (!api.canManage?.()) return openForSession('noticeModal', 'manage');
    const state = api.getData?.();
    if ($('noticeTitleInput')) $('noticeTitleInput').value = state?.settings?.announcementTitle || '';
    if ($('noticeTextInput')) $('noticeTextInput').value = state?.settings?.announcementText || '';
    api.openModal?.('noticeModal');
  }

  function snapshot(target) {
    return {
      dark: document.body.classList.contains('dark'),
      hash: location.hash,
      chatOpen: $('chatToolsPanel')?.classList.contains('open'),
      activeText: target?.parentElement?.querySelector('.active')?.textContent?.trim() || '',
      updatedPractice: app()?.getData?.()?.practiceTeams?.updatedAt || '',
      modalStates: [...document.querySelectorAll('.modal')].map((modal) => `${modal.id}:${modal.classList.contains('show')}`).join('|')
    };
  }

  function criticalFallback(target, before) {
    const api = app();
    const nav = router();
    if (!target || !api) return;

    const id = target.id;
    const profileAction = target.dataset.profileAction;
    const squadAction = target.dataset.squadAction;
    const adminAction = target.dataset.adminAction;
    const adminPanel = target.dataset.adminPanelTarget;
    const homeAction = target.dataset.homeAction;
    const detailBack = target.dataset.detailBack;

    if (['loginBtn'].includes(id) && !modalOpen('loginModal')) api.openModal?.('loginModal');
    if (['heroLoginBtn','mobileAccountBtn','accountBtn','homeProfileButton'].includes(id) && before.hash === location.hash && !modalOpen('loginModal')) {
      if (api.getSession?.()) nav?.navigate?.('profile'); else api.openModal?.('loginModal');
    }
    if (['editProfileBtn','profileQuickEditBtn'].includes(id) && !modalOpen('profileModal')) ensureProfileEditor();
    if (id === 'profilePhotoShortcut' && !modalOpen('profileModal')) {
      ensureProfileEditor();
      feedback('Profile editor opened. Choose a photo, then tap Save changes.');
    }
    if (id === 'changePinBtn' && !modalOpen('pinModal')) openForSession('pinModal');

    if (['themeBtn','mobileThemeBtn'].includes(id) && before.dark === document.body.classList.contains('dark')) api.toggleTheme?.();
    if (profileAction === 'theme' && before.dark === document.body.classList.contains('dark')) api.toggleTheme?.();

    if (id === 'chatInfoToggle' && before.chatOpen === $('chatToolsPanel')?.classList.contains('open')) $('chatToolsPanel')?.classList.toggle('open');
    if (id === 'chatJumpLatest') {
      const chat = $('chatMessages');
      if (chat) chat.scrollTo({ top: chat.scrollHeight, behavior: 'smooth' });
    }

    if (['scheduleBtn','captainScheduleBtn'].includes(id) && !modalOpen('scheduleModal')) openForSession('scheduleModal', 'manage');
    if (['quickResultBtn','captainResultBtn'].includes(id) && !modalOpen('resultModal')) {
      if (api.canManage?.()) api.openResultModal?.(); else openForSession('resultModal', 'manage');
    }
    if (['startLiveBtn','liveSetupBtn'].includes(id) && !modalOpen('liveSetupModal')) {
      if (api.canScore?.()) api.openLiveSetup?.(); else openForSession('liveSetupModal', 'manage');
    }
    if (id === 'addPlayerBtn' && !modalOpen('playerModal')) {
      if (api.isAdmin?.()) api.openPlayerModal?.(); else openForSession('playerModal', 'admin');
    }
    if (id === 'addOpponentTeamBtn' && !modalOpen('opponentTeamModal')) {
      if (api.isAdmin?.()) api.openOpponentTeamModal?.(); else openForSession('opponentTeamModal', 'admin');
    }
    if ((id === 'editNoticeBtn' || homeAction === 'notice') && !modalOpen('noticeModal')) ensureNoticeEditor();

    if (homeAction && before.hash === location.hash && !document.querySelector('.modal.show')) api.handleHomeAction?.(homeAction);
    if (squadAction === 'stats' && before.hash === location.hash) nav?.navigate?.('stats');
    if (squadAction === 'practice' && before.hash === location.hash) {
      if (api.canManage?.()) nav?.navigate?.('practice'); else feedback('Practice team maker is available to team leadership.');
    }
    if (detailBack && before.hash === location.hash) nav?.navigate?.(detailBack);

    if (profileAction === 'notifications' && before.hash === location.hash) {
      nav?.navigate?.('chat');
      later(() => $('chatToolsPanel')?.classList.add('open'), 90);
    }
    if (profileAction === 'game' && before.hash === location.hash) location.href = '/game.html';
    if (profileAction === 'admin' && before.hash === location.hash) nav?.navigate?.(api.isAdmin?.() ? 'admin' : 'live-scoring');

    if (adminPanel && before.hash === location.hash) {
      const routes = { overview:'admin', teams:'admin-teams', players:'admin-players', settings:'admin-settings' };
      nav?.navigate?.(routes[adminPanel] || 'admin');
    }
    if (adminAction && before.hash === location.hash && !document.querySelector('.modal.show')) {
      if (!api.isAdmin?.()) return feedback('Administrator login is required.');
      if (adminAction === 'schedule') api.openModal?.('scheduleModal');
      else if (adminAction === 'live') api.openLiveSetup?.();
      else if (adminAction === 'result') api.openResultModal?.();
      else if (adminAction === 'game') location.href = '/game.html';
      else nav?.navigate?.(adminAction);
    }

    if (id === 'renamePracticeBtn' && !modalOpen('practiceNameModal')) openForSession('practiceNameModal', 'manage');
    if (id === 'shuffleTeamsBtn' && before.updatedPractice === api.getData?.()?.practiceTeams?.updatedAt) {
      if (api.canManage?.()) api.shufflePracticeTeams?.(); else feedback('Only team leadership can shuffle practice teams.');
    }
  }

  function improveButtonSemantics() {
    document.querySelectorAll('button').forEach((button) => {
      if (!button.hasAttribute('type') && !button.closest('form')) button.type = 'button';
      const label = button.textContent.replace(/\s+/g, ' ').trim();
      if (!button.getAttribute('aria-label') && label) button.setAttribute('aria-label', label.slice(0, 120));
      if (!button.title && label) button.title = label.slice(0, 120);
    });
    document.querySelectorAll('a[href="#"],a[href="#teams"]').forEach((link) => {
      if (link.id === 'profileWhatsappLink' || link.id === 'chatWhatsappLink') return;
      if (link.getAttribute('href') === '#teams') {
        link.href = '#/squad';
        link.dataset.route = 'squad';
      }
    });
  }

  document.addEventListener('click', (event) => {
    const target = event.target.closest('button,a');
    if (!target || target.disabled || target.getAttribute('aria-disabled') === 'true') return;
    const before = snapshot(target);
    target.classList.add('button-pressed');
    later(() => target.classList.remove('button-pressed'), 160);
    later(() => criticalFallback(target, before), 85);
  }, true);

  window.addEventListener('error', (event) => {
    if (!event?.message || /ResizeObserver loop/i.test(event.message)) return;
    console.error('Ball Kho Gayi XI interface error:', event.error || event.message);
    feedback('That action hit an error. Your saved team data is safe—please try the button again.');
  });

  window.addEventListener('unhandledrejection', (event) => {
    const message = String(event?.reason?.message || event?.reason || '');
    if (!message || /fetch|network|notification|permission/i.test(message)) return;
    console.error('Ball Kho Gayi XI action failed:', event.reason);
    feedback('That action could not finish. Check the connection and try again.');
  });

  improveButtonSemantics();
  window.addEventListener('bkgxi:render', improveButtonSemantics);
})();
