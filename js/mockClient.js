const VIEW_FALLBACK = 'morning';

function slugify (value) {
  if (!value) return VIEW_FALLBACK;
  return String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

async function fetchJson (path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Mock fetch failed for ${path}: ${response.status}`);
  }
  return await response.json();
}

export async function loadMock (resource, idOrView) {
  switch (resource) {
    case 'state':
      return await fetchJson('./mocks/state.json');
    case 'layout': {
      const slug = slugify(idOrView || VIEW_FALLBACK);
      return await fetchJson(`./mocks/layout-${slug}.json`);
    }
    case 'health':
      return await fetchJson('./mocks/health.json');
    case 'tile': {
      const slug = slugify(idOrView);
      return await fetchJson(`./mocks/tile-${slug}.json`);
    }
    default:
      throw new Error(`Unsupported mock resource requested: ${resource}`);
  }
}
