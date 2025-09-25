import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  use: {
    headless: true,
    baseURL: 'http://127.0.0.1:4000'
  },
  webServer: {
    command: 'npm run serve',
    url: 'http://127.0.0.1:4000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  },
  timeout: 60000
});
