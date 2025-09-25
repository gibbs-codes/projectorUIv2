# Projector Dashboard UI

A lightweight smart-TV friendly dashboard client that consumes the CTAAPI data service and renders a full screen status board with responsive tiles.

## Features
- Plain HTML, CSS, and JavaScript (ES modules) optimized for 1080p and 4K displays.
- Layout, state, tile, and health polling with independent refresh cadences.
- Keyboard-friendly navigation and manual per-tile refresh actions.
- Dark theme with auto-scaling typography, auto-refresh indicator, and status footer.
- Mock data fixtures for offline development plus Playwright smoke tests.

## Getting Started
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Configure environment**
   Copy `.env.example` to `.env` and supply your dashboard key and the CTAAPI base URL if it differs.
   ```ini
   DASH_KEY=replace-with-dash-key
   API_BASE=http://192.168.0.50:3001
   ```
3. **Run the dev server**
   ```bash
   npm run serve
   ```
   Open `http://localhost:4000` in a TV browser emulator or desktop browser. Append `?apiBase=<url>` to override the API base at runtime, or `?mock=1` to use the bundled JSON fixtures.

## Keyboard Shortcuts
- Arrow keys: move focus between tiles in the grid.
- Enter/Space: manually refresh the focused tile (also available via the `Refresh` button in each tile header).

## Polling Schedule
- State: 15s (`pollStateMs` query param override available)
- Layout: 60s (`pollLayoutMs`)
- Health: 30s (`pollHealthMs`)
- Manual tile refresh cooldown: 20s (`pollTileMs`)

## Testing
Run the Playwright smoke test suite (uses built-in fixtures and intercepts CTAAPI calls):
```bash
npm test
```
The test harness launches the dev server automatically, verifies layout rendering, keyboard navigation, and tile refresh behaviour.

## Extending Tiles
1. Add a renderer in `js/dashboardApp.js` inside the `tileRenderers` map.
2. Provide layout placement data via the CTAAPI layout endpoint (and add optional mocks under `mocks/` & `tests/fixtures/`).
3. Expose the tile content in the state response or implement a custom fetch in the renderer.

## Project Structure
```
├── css/                # Base styles and theme
├── js/                 # Application modules (config, API client, dashboard logic)
├── mocks/              # JSON fixtures for mock mode in the browser
├── scripts/dev-server.js
├── tests/              # Playwright smoke test + fixtures
├── index.html
└── README.md
```
