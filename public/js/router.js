(() => {
  'use strict';

  const routeMap = {
    home: 'appHomeView',
    matches: 'matches',
    match: 'matchDetailsView',
    squad: 'teams',
    teams: 'teams',
    player: 'playerProfileView',
    chat: 'chat',
    profile: 'my-dashboard',
    'my-dashboard': 'my-dashboard',
    admin: 'admin',
    'admin-teams': 'admin',
    'admin-players': 'admin',
    'admin-settings': 'admin',
    'live-scoring': 'live-scoring',
    practice: 'practice',
    toss: 'toss',
    stats: 'stats',
    game: 'gameView',
    about: 'my-dashboard',
    thankyou: 'my-dashboard'
  };

  let currentRoute = 'home';
  let currentParam = '';

  function parseRoute(hash = window.location.hash) {
    const cleaned = String(hash || '').replace(/^#\/?/, '').split('?')[0].replace(/^\/+|\/+$/g, '');
    const segments = cleaned ? cleaned.split('/').map(decodeURIComponent) : ['home'];
    let route = segments[0] || 'home';
    if (route === 'teams') route = 'squad';
    if (route === 'my-dashboard') route = 'profile';
    if (!routeMap[route]) route = 'home';
    return { route, param: segments.slice(1).join('/') };
  }

  function routeLabel(route) {
    return ({
      home:'Home', matches:'Matches', match:'Match details', squad:'Squad', player:'Player profile',
      chat:'Chat', profile:'Profile', admin:'Admin dashboard', 'admin-teams':'Manage teams',
      'admin-players':'Manage players', 'admin-settings':'Settings', 'live-scoring':'Live scoring',
      practice:'Practice team maker', toss:'Toss room', stats:'Statistics', game:'Boundary Blitz'
    })[route] || 'Home';
  }

  function primaryRoute(route) {
    if (route === 'match') return 'matches';
    if (route === 'player') return 'squad';
    return route;
  }

  function setActiveNavigation(route) {
    const activeRoute = primaryRoute(route);
    document.querySelectorAll('[data-route]').forEach((item) => {
      const itemRoute = item.dataset.route;
      const active = itemRoute === activeRoute || (activeRoute === 'squad' && itemRoute === 'teams');
      if (active) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    });
  }

  function routeAllowed(route, target) {
    if (!target) return false;
    if (route === 'toss' && !window.BKGXIApp?.canManage?.()) return false;
    if (target.classList.contains('permission-hidden')) return false;
    if (route.startsWith('admin') && target.classList.contains('hidden')) return false;
    if (route === 'profile' && target.classList.contains('hidden')) return false;
    return true;
  }

  function showRoute(route, param = '', { scroll = true } = {}) {
    const targetId = routeMap[route] || routeMap.home;
    const target = document.getElementById(targetId);
    if (!target) return showRoute('home', '', { scroll });

    if (!routeAllowed(route, target) && route !== 'home') {
      if (route === 'profile') document.getElementById('loginBtn')?.click();
      else if (route.startsWith('admin')) document.getElementById('loginBtn')?.click();
      else if (route === 'toss') window.BKGXIApp?.toast?.('Toss is available only to the captain and vice-captain.');
      return showRoute('home', '', { scroll });
    }

    document.querySelectorAll('[data-route-view]').forEach((view) => {
      const active = view === target;
      view.classList.toggle('route-hidden', !active);
      view.classList.toggle('route-active', active);
      if (active) view.removeAttribute('aria-hidden');
      else view.setAttribute('aria-hidden', 'true');
    });

    currentRoute = route;
    currentParam = param || '';
    document.documentElement.dataset.routerReady = 'true';
    document.documentElement.dataset.route = currentRoute;
    setActiveNavigation(currentRoute);
    document.title = `${routeLabel(currentRoute)} · ${document.getElementById('brandName')?.textContent || 'Ball Kho Gayi XI'}`;
    const announcer = document.getElementById('routeAnnouncer');
    if (announcer) announcer.textContent = `${routeLabel(currentRoute)} screen`;
    if (scroll) window.scrollTo({ top: 0, behavior: 'auto' });
    window.dispatchEvent(new CustomEvent('bkgxi:routechange', { detail: { route: currentRoute, param: currentParam, targetId } }));
  }

  function refresh(options = {}) {
    const parsed = parseRoute();
    showRoute(parsed.route, parsed.param, { scroll: options.scroll === true });
  }

  function navigate(route, param = '') {
    if (route === 'game') { window.location.href = '/game.html'; return; }
    const normalized = route === 'teams' ? 'squad' : route === 'my-dashboard' ? 'profile' : route;
    const nextHash = `#/${normalized}${param ? `/${encodeURIComponent(param)}` : ''}`;
    if (window.location.hash === nextHash) showRoute(normalized, param);
    else window.location.hash = nextHash;
  }

  document.addEventListener('click', (event) => {
    const routeLink = event.target.closest('[data-route]');
    if (!routeLink) return;
    if (routeLink.id === 'mobileAccountBtn') return;
    event.preventDefault();
    navigate(routeLink.dataset.route, routeLink.dataset.routeParam || '');
  });

  window.addEventListener('hashchange', () => refresh({ scroll: true }));
  window.addEventListener('DOMContentLoaded', () => {
    if (!window.location.hash || window.location.hash === '#home') history.replaceState(null, '', '#/home');
    refresh({ scroll: false });
  });

  window.BKGXIRouter = {
    navigate,
    refresh,
    current: () => currentRoute,
    param: () => currentParam,
    parse: parseRoute
  };
})();
