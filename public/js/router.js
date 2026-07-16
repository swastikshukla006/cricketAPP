(() => {
  'use strict';

  const routeMap = {
    home: 'appHomeView',
    matches: 'matches',
    squad: 'teams',
    teams: 'teams',
    chat: 'chat',
    profile: 'my-dashboard',
    'my-dashboard': 'my-dashboard',
    admin: 'admin',
    'live-scoring': 'live-scoring',
    practice: 'practice',
    toss: 'toss',
    stats: 'stats',
    about: 'thankyou',
    thankyou: 'thankyou'
  };

  let currentRoute = 'home';

  function parseRoute(hash = window.location.hash) {
    const cleaned = String(hash || '').replace(/^#\/?/, '').split('?')[0].split('/')[0].trim();
    return routeMap[cleaned] ? cleaned : 'home';
  }

  function routeLabel(route) {
    return ({ home:'Home', matches:'Matches', squad:'Squad', teams:'Squad', chat:'Chat', profile:'Profile', admin:'Admin dashboard', 'live-scoring':'Live scoring', practice:'Practice team maker', toss:'Toss room', stats:'Statistics', about:'About' })[route] || 'Home';
  }

  function setActiveNavigation(route) {
    document.querySelectorAll('[data-route]').forEach((item) => {
      const itemRoute = item.dataset.route;
      const active = itemRoute === route || (route === 'teams' && itemRoute === 'squad');
      item.toggleAttribute('aria-current', active);
      if (active) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    });
  }

  function showRoute(route, { scroll = true } = {}) {
    const targetId = routeMap[route] || routeMap.home;
    const target = document.getElementById(targetId);
    if (!target) return showRoute('home', { scroll });

    if ((target.classList.contains('hidden') || target.classList.contains('permission-hidden')) && route !== 'home') {
      if (route === 'profile') document.getElementById('loginBtn')?.click();
      return showRoute('home', { scroll });
    }

    document.querySelectorAll('[data-route-view]').forEach((view) => {
      const active = view === target;
      view.classList.toggle('route-hidden', !active);
      view.classList.toggle('route-active', active);
      view.toggleAttribute('aria-hidden', !active);
      if (active) view.removeAttribute('aria-hidden');
    });

    currentRoute = route === 'teams' ? 'squad' : route;
    document.documentElement.dataset.routerReady = 'true';
    document.documentElement.dataset.route = currentRoute;
    setActiveNavigation(currentRoute);
    document.title = `${routeLabel(currentRoute)} · ${document.getElementById('brandName')?.textContent || 'Ball Kho Gayi XI'}`;
    const announcer = document.getElementById('routeAnnouncer');
    if (announcer) announcer.textContent = `${routeLabel(currentRoute)} screen`;
    if (scroll) window.scrollTo({ top: 0, behavior: 'auto' });
    window.dispatchEvent(new CustomEvent('bkgxi:routechange', { detail: { route: currentRoute, targetId } }));
  }

  function refresh(options = {}) {
    showRoute(parseRoute(), { scroll: options.scroll === true });
  }

  function navigate(route) {
    const normalized = route === 'teams' ? 'squad' : route;
    const nextHash = `#/${normalized}`;
    if (window.location.hash === nextHash) showRoute(normalized);
    else window.location.hash = nextHash;
  }

  document.addEventListener('click', (event) => {
    const routeLink = event.target.closest('[data-route]');
    if (!routeLink) return;
    event.preventDefault();
    if (routeLink.id === 'mobileAccountBtn') return;
    navigate(routeLink.dataset.route);
  });

  window.addEventListener('hashchange', () => refresh({ scroll: true }));
  window.addEventListener('DOMContentLoaded', () => {
    if (!window.location.hash || window.location.hash === '#home') history.replaceState(null, '', '#/home');
    refresh({ scroll: false });
  });

  window.BKGXIRouter = { navigate, refresh, current: () => currentRoute };
})();
