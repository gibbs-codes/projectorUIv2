const DEFAULT_BASE = 'http://192.168.0.50:3001';

const defaultIntervals = {
  state: 15000,
  layout: 60000,
  health: 30000,
  tile: 20000
};

function parseQueryParams () {
  try {
    return new URLSearchParams(window.location.search);
  } catch (error) {
    console.warn('Unable to parse query params', error);
    return new URLSearchParams();
  }
}

async function fetchRemoteConfig () {
  try {
    const response = await fetch('/__config__', { cache: 'no-store' });
    if (!response.ok) return {};
    return await response.json();
  } catch (error) {
    console.warn('Falling back to defaults, config endpoint unreachable', error);
    return {};
  }
}

export async function loadConfig () {
  const params = parseQueryParams();
  const remote = await fetchRemoteConfig();
  const config = {
    baseApi: remote.baseApi || DEFAULT_BASE,
    dashKey: remote.dashKey || '',
    pollIntervals: { ...defaultIntervals },
    useMocks: params.get('mock') === '1'
  };

  const override = params.get('apiBase');
  if (override) {
    config.baseApi = override;
  }

  const stateInterval = Number(params.get('pollStateMs'));
  if (!Number.isNaN(stateInterval) && stateInterval > 0) config.pollIntervals.state = stateInterval;

  const layoutInterval = Number(params.get('pollLayoutMs'));
  if (!Number.isNaN(layoutInterval) && layoutInterval > 0) config.pollIntervals.layout = layoutInterval;

  const healthInterval = Number(params.get('pollHealthMs'));
  if (!Number.isNaN(healthInterval) && healthInterval > 0) config.pollIntervals.health = healthInterval;

  const tileInterval = Number(params.get('pollTileMs'));
  if (!Number.isNaN(tileInterval) && tileInterval > 0) config.pollIntervals.tile = tileInterval;

  if (!config.dashKey && !config.useMocks) {
    console.warn('DASH_KEY missing. API calls will likely fail. Use ?mock=1 for mock data.');
  }

  return config;
}
