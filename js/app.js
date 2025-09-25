import { loadConfig } from './config.js';
import { DashboardApp } from './dashboardApp.js';

async function bootstrap () {
  try {
    const config = await loadConfig();
    const dashboard = new DashboardApp(config);
    await dashboard.start();
  } catch (error) {
    console.error('Unable to bootstrap dashboard', error);
    const toastContainer = document.getElementById('toastContainer');
    if (toastContainer) {
      const toast = document.createElement('div');
      toast.className = 'toast';
      toast.textContent = `Bootstrap failed: ${error.message}`;
      toastContainer.appendChild(toast);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  bootstrap().catch((error) => console.error(error));
});
