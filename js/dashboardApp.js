import { ApiClient } from './apiClient.js';

const VIEWS = ['Morning', 'Work', 'Evening'];

export class DashboardApp {
  constructor (config) {
    this.config = config;
    this.apiClient = new ApiClient(config);
    this.dashboardGrid = document.getElementById('dashboardGrid');
    this.viewSwitcher = document.querySelector('.view-switcher');
    this.refreshIndicator = document.getElementById('autoRefreshIndicator');
    this.connectionStateEl = document.getElementById('connectionState');
    this.lastUpdatedEl = document.getElementById('lastUpdated');
    this.toastContainer = document.getElementById('toastContainer');

    this.currentView = VIEWS[0];
    this.currentLayout = null;
    this.currentState = null;
    this.healthState = null;
    this.pendingRequests = 0;
    this.intervals = new Map();
    this.tileRefreshLocks = new Map();
    this.isVisible = true;
    this.lastStateAt = null;

    document.addEventListener('visibilitychange', () => {
      this.isVisible = document.visibilityState === 'visible';
    });
  }

  async start () {
    this.renderViewSwitcher();
    await this.loadInitialData();
    this.startPolling();
  }

  renderViewSwitcher () {
    this.viewSwitcher.innerHTML = '';
    VIEWS.forEach((view) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'view-switcher__button';
      button.dataset.viewId = view;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', view === this.currentView ? 'true' : 'false');
      button.textContent = view;
      button.addEventListener('click', () => this.changeView(view));
      button.addEventListener('keydown', (event) => this.handleViewKeydown(event, view));
      this.viewSwitcher.appendChild(button);
    });
  }

  handleViewKeydown (event, view) {
    const index = VIEWS.indexOf(view);
    if (event.key === 'ArrowRight') {
      const next = VIEWS[(index + 1) % VIEWS.length];
      this.focusViewButton(next);
      event.preventDefault();
    } else if (event.key === 'ArrowLeft') {
      const prev = VIEWS[(index - 1 + VIEWS.length) % VIEWS.length];
      this.focusViewButton(prev);
      event.preventDefault();
    }
  }

  focusViewButton (view) {
    const button = this.viewSwitcher.querySelector(`[data-view-id="${view}"]`);
    if (button) button.focus();
  }

  async changeView (view) {
    if (view === this.currentView) return;
    this.currentView = view;
    this.updateViewButtons();
    await this.refreshLayout(true);
    await this.refreshState(true);
  }

  updateViewButtons () {
    for (const button of this.viewSwitcher.querySelectorAll('button')) {
      button.setAttribute('aria-selected', button.dataset.viewId === this.currentView ? 'true' : 'false');
    }
  }

  async loadInitialData () {
    try {
      this.setConnectionState('connecting');
      const state = await this.withActivity(() => this.apiClient.getState());
      if (state?.view && VIEWS.includes(state.view)) {
        this.currentView = state.view;
        this.updateViewButtons();
      }
      const [layout, health] = await Promise.all([
        this.withActivity(() => this.apiClient.getLayout(this.currentView)),
        this.withActivity(() => this.apiClient.getHealth())
      ]);
      this.currentState = state;
      this.healthState = health;
      this.applyLayout(layout);
      this.updateState(state);
      this.applyHealth(health);
      this.updateFooter(state?.lastUpdated || Date.now());
      this.setConnectionState('healthy');
    } catch (error) {
      console.error('Failed to load dashboard', error);
      this.setConnectionState('error', error.message);
      this.showToast(`Failed to load dashboard: ${error.message}`);
    }
  }

  startPolling () {
    this.stopPolling();
    this.intervals.set('state', setInterval(() => this.refreshState(), this.config.pollIntervals.state));
    this.intervals.set('layout', setInterval(() => this.refreshLayout(), this.config.pollIntervals.layout));
    this.intervals.set('health', setInterval(() => this.refreshHealth(), this.config.pollIntervals.health));
  }

  stopPolling () {
    for (const handle of this.intervals.values()) {
      clearInterval(handle);
    }
    this.intervals.clear();
  }

  async refreshState (force = false) {
    if (!this.isVisible && !force) return;
    try {
      const state = await this.withActivity(() => this.apiClient.getState());
      this.currentState = state;
      this.updateState(state);
      this.updateFooter(state?.lastUpdated || Date.now());
      this.lastStateAt = Date.now();
      this.setConnectionState('healthy');
    } catch (error) {
      console.warn('State polling failed', error);
      this.setConnectionState('stale', error.message);
      this.showToast(`State refresh failed: ${error.message}`);
    }
  }

  async refreshLayout (force = false) {
    if (!this.isVisible && !force) return;
    try {
      const layout = await this.withActivity(() => this.apiClient.getLayout(this.currentView));
      this.applyLayout(layout);
      if (this.currentState?.tiles) {
        this.updateTiles(this.currentState.tiles);
      }
    } catch (error) {
      console.warn('Layout polling failed', error);
      this.showToast(`Layout refresh failed: ${error.message}`);
    }
  }

  async refreshHealth () {
    if (!this.isVisible) return;
    try {
      const health = await this.withActivity(() => this.apiClient.getHealth());
      this.healthState = health;
      this.applyHealth(health);
    } catch (error) {
      console.warn('Health polling failed', error);
      this.showToast(`Health update failed: ${error.message}`);
    }
  }

  async queueTileRefresh (tileId) {
    const now = Date.now();
    const lockUntil = this.tileRefreshLocks.get(tileId) || 0;
    if (now < lockUntil) {
      this.showToast(`Tile recently refreshed. Try again in ${Math.ceil((lockUntil - now) / 1000)}s.`);
      return;
    }
    this.tileRefreshLocks.set(tileId, now + this.config.pollIntervals.tile);
    try {
      const tileData = await this.withActivity(() => this.apiClient.refreshTile(tileId));
      if (this.currentState && this.currentState.tiles) {
        this.currentState.tiles[tileId] = tileData;
      }
      this.updateTile(tileId, tileData);
    } catch (error) {
      console.error(`Tile refresh failed for ${tileId}`, error);
      this.showToast(`Tile refresh failed: ${error.message}`);
      this.tileRefreshLocks.set(tileId, Date.now());
    }
  }

  applyLayout (layout) {
    if (!layout) return;
    this.currentLayout = layout;
    const columns = layout?.grid?.columns || 12;
    const rows = layout?.grid?.rows || 6;
    this.dashboardGrid.style.setProperty('--grid-columns', columns);
    this.dashboardGrid.style.setProperty('--grid-rows', rows);

    const existing = new Map();
    for (const tile of this.dashboardGrid.querySelectorAll('.tile')) {
      existing.set(tile.dataset.tileId, tile);
    }

    const desiredOrder = layout.tiles || [];

    desiredOrder.forEach((tileDef) => {
      const id = tileDef.id;
      const tileEl = existing.get(id) || this.createTileElement(tileDef);
      this.positionTile(tileEl, tileDef);
      if (!tileEl.isConnected) {
        this.dashboardGrid.appendChild(tileEl);
      }
      existing.delete(id);
    });

    for (const leftover of existing.values()) {
      leftover.remove();
    }
  }

  createTileElement (tileDef) {
    const tile = document.createElement('article');
    tile.className = 'tile';
    tile.dataset.tileId = tileDef.id;
    tile.tabIndex = 0;
    tile.setAttribute('role', 'region');
    tile.setAttribute('aria-labelledby', `tile-${tileDef.id}-title`);
    tile.dataset.column = tileDef.column;
    tile.dataset.row = tileDef.row;

    const header = document.createElement('header');
    header.className = 'tile__header';

    const title = document.createElement('h2');
    title.className = 'tile__title';
    title.textContent = tileDef.title || tileDef.id;
    title.id = `tile-${tileDef.id}-title`;

    const refreshButton = document.createElement('button');
    refreshButton.type = 'button';
    refreshButton.className = 'tile-refresh';
    refreshButton.dataset.tileRefresh = tileDef.id;
    refreshButton.textContent = 'Refresh';
    refreshButton.addEventListener('click', () => this.queueTileRefresh(tileDef.id));

    header.appendChild(title);
    header.appendChild(refreshButton);

    const badgeBar = document.createElement('div');
    badgeBar.className = 'tile__badges';

    const content = document.createElement('div');
    content.className = 'tile__content';

    tile.appendChild(header);
    tile.appendChild(badgeBar);
    tile.appendChild(content);

    tile.addEventListener('keydown', (event) => this.handleTileKeydown(event, tile));

    return tile;
  }

  positionTile (tileEl, tileDef) {
    const column = tileDef.column || 1;
    const row = tileDef.row || 1;
    const columnSpan = tileDef.columnSpan || tileDef.width || 1;
    const rowSpan = tileDef.rowSpan || tileDef.height || 1;

    tileEl.style.gridColumn = `${column} / span ${columnSpan}`;
    tileEl.style.gridRow = `${row} / span ${rowSpan}`;
    tileEl.dataset.column = column;
    tileEl.dataset.row = row;
    tileEl.dataset.columnSpan = columnSpan;
    tileEl.dataset.rowSpan = rowSpan;
  }

  updateState (state) {
    if (!state) return;
    if (state.view && state.view !== this.currentView && VIEWS.includes(state.view)) {
      this.currentView = state.view;
      this.updateViewButtons();
      this.refreshLayout(true).catch((error) => console.warn('View change layout refresh failed', error));
    }
    if (state.tiles) {
      this.updateTiles(state.tiles);
    }
  }

  updateTiles (tiles) {
    Object.entries(tiles || {}).forEach(([tileId, tileData]) => {
      this.updateTile(tileId, tileData);
    });
  }

  updateTile (tileId, tileData) {
    const tile = this.dashboardGrid.querySelector(`[data-tile-id="${tileId}"]`);
    if (!tile) return;

    const layoutTile = (this.currentLayout?.tiles || []).find((item) => item.id === tileId) || { title: tileId };

    const headerTitle = tile.querySelector('.tile__title');
    if (headerTitle) headerTitle.textContent = layoutTile.title || tileId;

    const badgeBar = tile.querySelector('.tile__badges');
    badgeBar.innerHTML = '';

    const status = this.deriveTileStatus(tileId, tileData);
    if (status.stale) {
      badgeBar.appendChild(this.createBadge('Stale', 'badge--warning'));
    }
    if (status.status === 'error') {
      badgeBar.appendChild(this.createBadge(status.message || 'Error', 'badge--error'));
    }

    const content = tile.querySelector('.tile__content');
    content.innerHTML = '';

    const renderer = tileRenderers[tileId] || tileRenderers[tileData?.type] || renderFallback;
    try {
      renderer(content, tileData, layoutTile);
    } catch (error) {
      console.error(`Tile renderer failed for ${tileId}`, error);
      renderFallback(content, { error: error.message, raw: tileData });
    }
  }

  deriveTileStatus (tileId, tileData) {
    const fromHealth = this.healthState?.tiles?.[tileId] || {};
    const status = tileData?.status || fromHealth.status || 'healthy';
    const stale = Boolean(fromHealth.stale || status === 'stale');
    const message = tileData?.error?.message || tileData?.error || fromHealth.message || '';
    return { status, stale, message };
  }

  applyHealth (health) {
    if (!health) return;
    const state = health.status || 'unknown';
    this.setConnectionState(state === 'healthy' ? 'healthy' : state);
    this.updateFooter(this.currentState?.lastUpdated || Date.now());
    if (!health.tiles) return;
    Object.keys(health.tiles).forEach((tileId) => {
      const tile = this.dashboardGrid.querySelector(`[data-tile-id="${tileId}"]`);
      if (tile) {
        this.updateTile(tileId, this.currentState?.tiles?.[tileId]);
      }
    });
  }

  handleTileKeydown (event, tile) {
    switch (event.key) {
      case 'Enter':
      case ' ': {
        const tileId = tile.dataset.tileId;
        this.queueTileRefresh(tileId);
        event.preventDefault();
        break;
      }
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        this.navigateTiles(tile, event.key);
        event.preventDefault();
        break;
      default:
        break;
    }
  }

  navigateTiles (tile, direction) {
    const tiles = Array.from(this.dashboardGrid.querySelectorAll('.tile'));
    const currentRect = this.getTileRectMeta(tile);
    let nextTile = null;

    const axis = (direction === 'ArrowLeft' || direction === 'ArrowRight') ? 'h' : 'v';
    const forward = direction === 'ArrowRight' || direction === 'ArrowDown';

    const candidates = tiles.filter((item) => item !== tile);

    let bestScore = Infinity;

    candidates.forEach((candidate) => {
      const rect = this.getTileRectMeta(candidate);
      if (axis === 'h') {
        if (forward && rect.left <= currentRect.left) return;
        if (!forward && rect.left >= currentRect.left) return;
        const distance = Math.abs(rect.left - currentRect.left) + Math.abs(rect.top - currentRect.top);
        if (distance < bestScore) {
          bestScore = distance;
          nextTile = candidate;
        }
      } else {
        if (forward && rect.top <= currentRect.top) return;
        if (!forward && rect.top >= currentRect.top) return;
        const distance = Math.abs(rect.top - currentRect.top) + Math.abs(rect.left - currentRect.left);
        if (distance < bestScore) {
          bestScore = distance;
          nextTile = candidate;
        }
      }
    });

    if (nextTile) {
      nextTile.focus();
    }
  }

  getTileRectMeta (tile) {
    return {
      left: Number(tile.dataset.column) || 0,
      top: Number(tile.dataset.row) || 0,
      width: Number(tile.dataset.columnSpan) || 1,
      height: Number(tile.dataset.rowSpan) || 1
    };
  }

  createBadge (label, modifier) {
    const badge = document.createElement('span');
    badge.className = `badge ${modifier}`;
    badge.textContent = label;
    return badge;
  }

  setConnectionState (state, message = '') {
    if (!this.connectionStateEl) return;
    const normalized = state || 'unknown';
    this.connectionStateEl.dataset.state = normalized;
    const label = normalized === 'healthy'
      ? 'Connection healthy'
      : normalized === 'stale'
        ? 'Connection stale'
        : normalized === 'error'
          ? 'Connection error'
          : 'Connecting…';
    this.connectionStateEl.textContent = message ? `${label}: ${message}` : label;
  }

  updateFooter (timestamp) {
    if (!this.lastUpdatedEl) return;
    const date = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp);
    if (Number.isNaN(date.getTime())) return;
    const formatted = `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} ${date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
    this.lastUpdatedEl.textContent = `Last updated ${formatted}`;
  }

  showToast (message) {
    if (!this.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    this.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 4000);
  }

  async withActivity (fn) {
    try {
      this.pendingRequests += 1;
      this.updateRefreshIndicator();
      return await fn();
    } finally {
      this.pendingRequests = Math.max(0, this.pendingRequests - 1);
      this.updateRefreshIndicator();
    }
  }

  updateRefreshIndicator () {
    if (!this.refreshIndicator) return;
    if (this.pendingRequests > 0) {
      this.refreshIndicator.classList.add('is-active');
    } else {
      this.refreshIndicator.classList.remove('is-active');
    }
  }
}

const tileRenderers = {
  'clock-now': (container, data) => {
    const datetime = data?.time ? new Date(data.time) : new Date();
    const timezone = data?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const time = document.createElement('div');
    time.className = 'clock-time';
    time.textContent = datetime.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

    const tz = document.createElement('div');
    tz.className = 'clock-tz';
    tz.textContent = `${datetime.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })} · ${timezone}`;

    container.appendChild(time);
    container.appendChild(tz);
  },
  'weather-current': (container, data) => {
    const temp = document.createElement('div');
    const temperature = data?.temperature;
    const unit = data?.unit || '°F';
    temp.className = 'weather-temp';
    const displayTemp = typeof temperature === 'number' ? Math.round(temperature) : '--';
    temp.textContent = `${displayTemp}${unit}`;

    const detail = document.createElement('div');
    detail.className = 'weather-detail';
    const condition = data?.condition || 'Unknown';
    const humidity = data?.humidity != null ? `${data.humidity}% humidity` : null;
    detail.textContent = humidity ? `${condition} · ${humidity}` : condition;

    container.appendChild(temp);
    container.appendChild(detail);
  },
  'todoist-summary': (container, data) => {
    const tasks = Array.isArray(data?.tasks) ? data.tasks.slice(0, 5) : [];
    if (!tasks.length) {
      const empty = document.createElement('div');
      empty.textContent = 'No tasks remaining.';
      container.appendChild(empty);
      return;
    }
    const list = document.createElement('ul');
    list.className = 'list';
    tasks.forEach((task) => {
      const item = document.createElement('li');
      item.className = 'list__item';
      if (task.overdue) {
        item.classList.add('list__item--overdue');
      }
      const name = document.createElement('span');
      name.textContent = task.content;

      const project = document.createElement('span');
      project.className = 'task-project';
      project.textContent = task.project || '';

      const due = document.createElement('span');
      due.className = 'task-due';
      if (task.due) {
        const dueDate = new Date(task.due);
        if (!Number.isNaN(dueDate.getTime())) {
          due.textContent = dueDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
        }
      }

      item.appendChild(name);
      item.appendChild(project);
      item.appendChild(due);
      list.appendChild(item);
    });
    container.appendChild(list);
  },
  'calendar-today': (container, data) => {
    const events = Array.isArray(data?.events) ? data.events : [];
    if (!events.length) {
      const empty = document.createElement('div');
      empty.textContent = 'No events scheduled.';
      container.appendChild(empty);
      return;
    }
    const list = document.createElement('ul');
    list.className = 'list';
    events.forEach((event) => {
      const item = document.createElement('li');
      item.className = 'list__item';
      const time = document.createElement('span');
      time.className = 'event-time';
      const start = new Date(event.start);
      if (!Number.isNaN(start.getTime())) {
        time.textContent = start.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
      }
      const title = document.createElement('span');
      title.textContent = event.title;
      const location = document.createElement('span');
      location.textContent = event.location || '';
      item.appendChild(time);
      item.appendChild(title);
      item.appendChild(location);
      list.appendChild(item);
    });
    container.appendChild(list);
  },
  'cta-transit': (container, data) => {
    const routes = Array.isArray(data?.routes) ? data.routes : [];
    if (!routes.length) {
      const empty = document.createElement('div');
      empty.textContent = 'No arrivals available.';
      container.appendChild(empty);
      return;
    }
    const list = document.createElement('div');
    list.className = 'routes';
    routes.forEach((route) => {
      const routeEl = document.createElement('div');
      routeEl.className = 'route';
      const routeName = document.createElement('span');
      routeName.textContent = route.name || route.routeId || 'Route';
      const arrivals = document.createElement('span');
      arrivals.className = 'arrival-dest';
      const arrivalList = Array.isArray(route.arrivals) ? route.arrivals : [];
      arrivals.textContent = arrivalList.length
        ? arrivalList.map((arrival) => arrival.destination || arrival.stop || '—').join(', ')
        : '—';
      const eta = document.createElement('span');
      eta.className = 'arrival-time';
      eta.textContent = arrivalList.length
        ? arrivalList.map((arrival) => `${arrival.etaMinutes}m`).join(' · ')
        : '';
      routeEl.appendChild(routeName);
      routeEl.appendChild(arrivals);
      routeEl.appendChild(eta);
      list.appendChild(routeEl);
    });
    container.appendChild(list);
  }
};

function renderFallback (container, data = {}) {
  const pre = document.createElement('pre');
  pre.textContent = JSON.stringify(data, null, 2);
  container.appendChild(pre);
}
