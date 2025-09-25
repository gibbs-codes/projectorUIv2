import { loadMock } from './mockClient.js';

export class ApiClient {
  constructor (config) {
    this.baseUrl = (config.baseApi || '').replace(/\/$/, '');
    this.dashKey = config.dashKey || '';
    this.useMocks = Boolean(config.useMocks);
  }

  async getState () {
    if (this.useMocks) return await loadMock('state');
    return await this._request('GET', '/v1/dashboard/state');
  }

  async getLayout (viewId) {
    if (this.useMocks) return await loadMock('layout', viewId);
    const path = `/v1/dashboard/layout?view=${encodeURIComponent(viewId)}`;
    return await this._request('GET', path);
  }

  async getHealth () {
    if (this.useMocks) return await loadMock('health');
    return await this._request('GET', '/v1/dashboard/health');
  }

  async getTile (tileId) {
    if (this.useMocks) return await loadMock('tile', tileId);
    return await this._request('GET', `/v1/dashboard/tiles/${encodeURIComponent(tileId)}`);
  }

  async refreshTile (tileId) {
    if (!tileId) throw new Error('tileId is required to refresh');
    if (this.useMocks) return await loadMock('tile', tileId);
    await this.postCommand({ type: 'refresh', tileId });
    return await this.getTile(tileId);
  }

  async postCommand (payload) {
    if (this.useMocks) return { ok: true, payload };
    return await this._request('POST', '/v1/dashboard/command', payload);
  }

  async _request (method, path, body) {
    const headers = { 'Accept': 'application/json' };
    if (body) headers['Content-Type'] = 'application/json';
    if (this.dashKey) headers['X-DASH-KEY'] = this.dashKey;

    const url = `${this.baseUrl}${path}`;

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      const error = new Error(`API request failed ${response.status} ${response.statusText}`);
      error.status = response.status;
      error.body = text;
      throw error;
    }

    if (response.status === 204) return null;
    return await response.json();
  }
}
