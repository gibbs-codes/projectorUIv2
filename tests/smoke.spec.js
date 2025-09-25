import { readFileSync } from 'fs';
import { test, expect } from '@playwright/test';

const loadFixture = (name) => {
  const content = readFileSync(new URL(`./fixtures/${name}.json`, import.meta.url), 'utf8');
  return JSON.parse(content);
};

const fixtures = {
  state: loadFixture('state'),
  health: loadFixture('health'),
  layoutMorning: loadFixture('layout-morning'),
  layoutWork: loadFixture('layout-work'),
  tileClock: loadFixture('tile-clock-now')
};

test.beforeEach(async ({ page }) => {
  await page.route('**/v1/dashboard/state', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fixtures.state) });
  });

  await page.route('**/v1/dashboard/health', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fixtures.health) });
  });

  await page.route('**/v1/dashboard/layout?*', async (route) => {
    const url = new URL(route.request().url());
    const viewParam = url.searchParams.get('view') || 'Morning';
    const payload = viewParam === 'Work' ? fixtures.layoutWork : fixtures.layoutMorning;
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(payload) });
  });

  await page.route('**/v1/dashboard/tiles/clock-now', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fixtures.tileClock) });
  });

  await page.route('**/v1/dashboard/command', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
  });
});

test('renders layout and supports basic interactions', async ({ page }) => {
  await page.goto('http://127.0.0.1:4000/?apiBase=http://cta.test');

  const tiles = page.locator('.tile');
  await expect(tiles).toHaveCount(5);

  const overdueTask = page.locator('[data-tile-id="todoist-summary"] .list__item--overdue');
  await expect(overdueTask).toBeVisible();

  await expect(page.locator('#connectionState')).toContainText('Connection healthy');
  await expect(page.locator('#lastUpdated')).toContainText('Last updated');

  // Layout attributes applied
  await expect(page.locator('[data-tile-id="calendar-today"]')).toHaveAttribute('data-row', '3');
  await expect(page.locator('[data-tile-id="calendar-today"]')).toHaveAttribute('data-column', '1');

  // Switch view and ensure layout request fires
  const [layoutRequest] = await Promise.all([
    page.waitForRequest((request) => request.url().includes('/v1/dashboard/layout?view=Work')),
    page.getByRole('tab', { name: 'Work' }).click()
  ]);
  expect(layoutRequest).toBeTruthy();
  await expect(page.locator('[data-tile-id="todoist-summary"]')).toHaveAttribute('data-row', '1');

  // Keyboard navigation moves focus
  await page.locator('[data-tile-id="clock-now"]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-tile-id="weather-current"]')).toBeFocused();

  // Manual refresh posts command
  const [commandRequest] = await Promise.all([
    page.waitForRequest((request) => request.url().includes('/v1/dashboard/command') && request.method() === 'POST'),
    page.locator('[data-tile-id="clock-now"] .tile-refresh').click()
  ]);
  expect(commandRequest.postDataJSON()).toMatchObject({ type: 'refresh', tileId: 'clock-now' });
});
