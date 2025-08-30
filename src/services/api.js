const CACHE_KEY = 'projectorUI_cachedProfile';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class APIService {
  constructor() {
    this.cache = this.loadFromCache();
  }

  loadFromCache() {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn('Failed to load from cache:', error);
      return null;
    }
  }

  saveToCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      this.cache = data;
    } catch (error) {
      console.warn('Failed to save to cache:', error);
    }
  }

  async fetchActiveProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/active`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (this.isValidProfile(data)) {
        this.saveToCache(data);
        return { data, fromCache: false };
      } else {
        throw new Error('Invalid profile data structure');
      }
    } catch (error) {
      console.warn('API request failed:', error.message);
      
      if (this.cache) {
        console.log('Using cached profile data');
        return { data: this.cache, fromCache: true };
      }
      
      console.log('No cache available, using mock data');
      const mockData = this.getMockProfile();
      return { data: mockData, fromCache: false };
    }
  }

  isValidProfile(profile) {
    return (
      profile &&
      typeof profile === 'object' &&
      Array.isArray(profile.zones) &&
      typeof profile.gridConfig === 'object'
    );
  }

  getMockProfile() {
    return {
      id: 'mock-profile',
      name: 'Mock Profile',
      gridConfig: {
        columns: '1fr 1fr',
        rows: '1fr 1fr',
        areas: [
          ['header', 'sidebar'],
          ['main', 'sidebar']
        ]
      },
      zones: [
        {
          id: 'header',
          name: 'Header Zone',
          gridArea: 'header',
          cards: [
            {
              id: 'welcome-card',
              type: 'text',
              title: 'Welcome',
              content: 'This is a mock profile running in offline mode.'
            }
          ]
        },
        {
          id: 'main',
          name: 'Main Content',
          gridArea: 'main',
          cards: [
            {
              id: 'status-card',
              type: 'status',
              title: 'System Status',
              status: 'online',
              message: 'All systems operational'
            },
            {
              id: 'chart-card',
              type: 'chart',
              title: 'Performance Metrics',
              chartType: 'line',
              data: [10, 25, 15, 30, 45, 35, 50]
            }
          ]
        },
        {
          id: 'sidebar',
          name: 'Sidebar',
          gridArea: 'sidebar',
          cards: [
            {
              id: 'info-card',
              type: 'info',
              title: 'Information',
              items: [
                'Mock data is being used',
                'API polling every 10 seconds',
                'Offline mode active'
              ]
            }
          ]
        }
      ]
    };
  }
}

export default new APIService();