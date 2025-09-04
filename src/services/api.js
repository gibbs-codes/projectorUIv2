const PROFILE_CACHE_KEY = 'projectorUI_cachedProfile';
const CARDS_CACHE_KEY = 'projectorUI_cachedCards';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

class APIService {
  constructor() {
    this.profileCache = this.loadProfileFromCache();
    this.cardsCache = this.loadCardsFromCache();
  }

  loadProfileFromCache() {
    try {
      const cached = localStorage.getItem(PROFILE_CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn('Failed to load profile from cache:', error);
      return null;
    }
  }

  loadCardsFromCache() {
    try {
      const cached = localStorage.getItem(CARDS_CACHE_KEY);
      return cached ? JSON.parse(cached) : {};
    } catch (error) {
      console.warn('Failed to load cards from cache:', error);
      return {};
    }
  }

  saveProfileToCache(data) {
    try {
      localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(data));
      this.profileCache = data;
    } catch (error) {
      console.warn('Failed to save profile to cache:', error);
    }
  }

  saveCardsToCache(cards) {
    try {
      localStorage.setItem(CARDS_CACHE_KEY, JSON.stringify(cards));
      this.cardsCache = cards;
    } catch (error) {
      console.warn('Failed to save cards to cache:', error);
    }
  }

  saveSingleCardToCache(cardId, cardData) {
    try {
      this.cardsCache[cardId] = cardData;
      this.saveCardsToCache(this.cardsCache);
    } catch (error) {
      console.warn('Failed to save single card to cache:', error);
    }
  }

  async fetchCard(cardId) {
    if (this.cardsCache[cardId]) {
      return this.cardsCache[cardId];
    }

    try {
      const response = await fetch(`${API_BASE_URL}/display/cards/${cardId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const cardData = await response.json();
      this.saveSingleCardToCache(cardId, cardData);
      return cardData;
    } catch (error) {
      console.warn(`Failed to fetch card ${cardId}:`, error.message);
      return this.getMissingCardPlaceholder(cardId);
    }
  }

  async fetchMultipleCards(cardIds) {
    const cards = {};
    const fetchPromises = cardIds.map(async (cardId) => {
      try {
        const card = await this.fetchCard(cardId);
        cards[cardId] = card;
      } catch (error) {
        console.warn(`Failed to fetch card ${cardId}:`, error);
        cards[cardId] = this.getMissingCardPlaceholder(cardId);
      }
    });

    await Promise.all(fetchPromises);
    return cards;
  }

  async fetchActiveProfile() {
    try {
      console.log('🔄 API: Starting fetchActiveProfile request to:', `${API_BASE_URL}/display/activeProfile`);
      
      const response = await fetch(`${API_BASE_URL}/display/activeProfile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      });

      console.log('📡 API: Response status:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const apiData = await response.json();
      console.log('📦 API: Raw API response data:', JSON.stringify(apiData, null, 2));
      
      if (!this.isValidApiResponse(apiData)) {
        console.error('❌ API: Invalid API response structure. Expected: {profileId, profile: {zones: {}}}');
        console.log('🔍 API: Actual structure keys:', Object.keys(apiData));
        throw new Error('Invalid API response structure');
      }

      console.log('✅ API: Response validation passed');
      console.log('🏷️ API: Profile ID:', apiData.profileId);
      console.log('🗂️ API: Profile zones:', Object.keys(apiData.profile.zones || {}));

      const allCardIds = this.extractCardIds(apiData.profile);
      console.log('🃏 API: Extracted card IDs:', allCardIds);
      
      const cardData = await this.fetchMultipleCards(allCardIds);
      console.log('🃏 API: Fetched cards data keys:', Object.keys(cardData));

      const transformedProfile = this.transformProfileData(apiData, cardData);
      console.log('🔄 API: Transformed profile structure:', {
        id: transformedProfile.id,
        name: transformedProfile.name,
        gridConfig: transformedProfile.gridConfig,
        zonesCount: transformedProfile.zones.length,
        zoneIds: transformedProfile.zones.map(z => z.id)
      });
      
      this.saveProfileToCache(transformedProfile);
      console.log('💾 API: Profile saved to cache');
      return { data: transformedProfile, fromCache: false };

    } catch (error) {
      console.warn('⚠️ API: API request failed:', error.message);
      console.log('📍 API: Error stack:', error.stack);
      
      if (this.profileCache) {
        console.log('📥 API: Using cached profile data:', {
          id: this.profileCache.id,
          name: this.profileCache.name,
          zonesCount: this.profileCache.zones?.length || 0
        });
        return { data: this.profileCache, fromCache: true };
      }
      
      console.log('🎭 API: No cache available, using mock data');
      const mockData = this.getMockProfile();
      return { data: mockData, fromCache: false };
    }
  }

  isValidApiResponse(apiData) {
    console.log('🔍 API: Validating API response structure...');
    
    if (!apiData) {
      console.error('❌ API: Response data is null/undefined');
      return false;
    }
    
    if (typeof apiData !== 'object') {
      console.error('❌ API: Response is not an object, got:', typeof apiData);
      return false;
    }
    
    if (!apiData.profileId) {
      console.error('❌ API: Missing profileId field');
      return false;
    }
    
    if (!apiData.profile) {
      console.error('❌ API: Missing profile field');
      return false;
    }
    
    if (typeof apiData.profile !== 'object') {
      console.error('❌ API: Profile is not an object, got:', typeof apiData.profile);
      return false;
    }
    
    if (!apiData.profile.zones) {
      console.error('❌ API: Missing profile.zones field');
      return false;
    }
    
    if (typeof apiData.profile.zones !== 'object') {
      console.error('❌ API: Profile.zones is not an object, got:', typeof apiData.profile.zones);
      return false;
    }
    
    console.log('✅ API: Response structure validation passed');
    return true;
  }

  extractCardIds(profile) {
    console.log('🃏 API: Extracting card IDs from profile zones...');
    const cardIds = [];
    
    if (!profile.zones) {
      console.log('🃏 API: No zones found in profile');
      return cardIds;
    }

    Object.entries(profile.zones).forEach(([zoneId, zone]) => {
      console.log(`🃏 API: Processing zone "${zoneId}":`, zone);
      if (Array.isArray(zone.cards)) {
        console.log(`🃏 API: Found ${zone.cards.length} cards in zone "${zoneId}":`, zone.cards);
        cardIds.push(...zone.cards);
      } else {
        console.warn(`⚠️ API: Zone "${zoneId}" cards is not an array:`, zone.cards);
      }
    });

    const uniqueCardIds = [...new Set(cardIds)];
    console.log('🃏 API: Total unique card IDs extracted:', uniqueCardIds);
    return uniqueCardIds;
  }

  validateProfileStructure(profile) {
    console.log('🔍 API: Validating complete profile structure...');
    const issues = [];

    if (!profile) {
      issues.push('Profile is null/undefined');
      return issues;
    }

    if (!profile.id) issues.push('Missing profile.id');
    if (!profile.name && !profile.id) issues.push('Missing both profile.name and profile.id');
    
    if (!profile.gridConfig) {
      issues.push('Missing profile.gridConfig');
    } else {
      if (!profile.gridConfig.columns && !profile.gridConfig.rows) {
        issues.push('GridConfig missing both columns and rows');
      }
      if (!profile.gridConfig.areas || !Array.isArray(profile.gridConfig.areas)) {
        issues.push('GridConfig missing valid areas array');
      }
    }

    if (!Array.isArray(profile.zones)) {
      issues.push('Profile.zones is not an array');
    } else {
      if (profile.zones.length === 0) {
        issues.push('Profile.zones array is empty');
      }

      profile.zones.forEach((zone, index) => {
        if (!zone) {
          issues.push(`Zone at index ${index} is null/undefined`);
          return;
        }
        
        if (!zone.id) issues.push(`Zone at index ${index} missing id`);
        if (!zone.gridArea) issues.push(`Zone at index ${index} missing gridArea`);
        if (!zone.name) issues.push(`Zone at index ${index} missing name (not critical)`);
        
        if (zone.cards && !Array.isArray(zone.cards)) {
          issues.push(`Zone "${zone.id}" cards is not an array`);
        }
      });
    }

    if (issues.length > 0) {
      console.error('❌ API: Profile validation failed with issues:', issues);
    } else {
      console.log('✅ API: Profile structure validation passed');
    }

    return issues;
  }

  transformProfileData(apiData, cardData) {
    console.log('🔄 API: Starting profile data transformation...');
    
    const { profileId, profile } = apiData;
    const zones = profile.zones || {};
    
    console.log('🏗️ API: Transform input - profileId:', profileId);
    console.log('🏗️ API: Transform input - profile.name:', profile.name);
    console.log('🏗️ API: Transform input - zones keys:', Object.keys(zones));
    console.log('🏗️ API: Transform input - cardData keys:', Object.keys(cardData));
    
    const zoneKeys = Object.keys(zones);
    console.log('🏗️ API: Zone keys for processing:', zoneKeys);
    
    // Log details about each zone
    zoneKeys.forEach(key => {
      const zone = zones[key];
      console.log(`🏗️ API: Zone "${key}":`, {
        name: zone.name,
        width: zone.width,
        cards: zone.cards,
        cardsLength: Array.isArray(zone.cards) ? zone.cards.length : 'not array'
      });
    });
    
    const columns = zoneKeys.map(key => `${zones[key].width || 33}%`).join(' ');
    console.log('🏗️ API: Generated columns:', columns);
    
    const transformedZones = zoneKeys.map(zoneId => {
      console.log(`🏗️ API: Transforming zone "${zoneId}"...`);
      const zone = zones[zoneId];
      const zoneCards = Array.isArray(zone.cards) 
        ? zone.cards.map(cardId => {
            const card = cardData[cardId] || this.getMissingCardPlaceholder(cardId);
            console.log(`🏗️ API: Card "${cardId}" for zone "${zoneId}":`, card ? 'found' : 'missing');
            return card;
          })
        : [];

      const transformedZone = {
        id: zoneId,
        name: zone.name || this.capitalizeFirst(zoneId) + ' Zone',
        gridArea: zoneId,
        cards: zoneCards
      };
      
      console.log(`🏗️ API: Transformed zone "${zoneId}":`, {
        id: transformedZone.id,
        name: transformedZone.name,
        gridArea: transformedZone.gridArea,
        cardsCount: transformedZone.cards.length
      });
      
      return transformedZone;
    });

    const result = {
      id: profileId,
      name: profile.name || this.capitalizeFirst(profileId) + ' Profile',
      gridConfig: {
        columns: columns || '1fr',
        rows: '1fr',
        areas: [zoneKeys]
      },
      zones: transformedZones
    };
    
    console.log('🏗️ API: Final transformed profile:', {
      id: result.id,
      name: result.name,
      gridConfig: result.gridConfig,
      zonesCount: result.zones.length,
      zonesData: result.zones.map(z => ({
        id: z.id,
        name: z.name,
        gridArea: z.gridArea,
        cardsCount: z.cards.length
      }))
    });

    // Validate the final result
    const validationIssues = this.validateProfileStructure(result);
    if (validationIssues.length > 0) {
      console.error('❌ API: Transformed profile failed validation:', validationIssues);
      console.log('🛠️ API: Attempting to fix common issues...');
      
      // Try to fix common issues
      const fixedResult = this.fixProfileIssues(result, validationIssues);
      const revalidationIssues = this.validateProfileStructure(fixedResult);
      
      if (revalidationIssues.length > 0) {
        console.error('❌ API: Could not fix all profile issues, using fallback');
        return this.createFallbackProfile(profileId);
      }
      
      console.log('✅ API: Profile issues fixed successfully');
      return fixedResult;
    }
    
    return result;
  }

  fixProfileIssues(profile, issues) {
    console.log('🛠️ API: Attempting to fix profile issues:', issues);
    const fixed = JSON.parse(JSON.stringify(profile)); // Deep copy

    // Fix missing ID
    if (!fixed.id) {
      fixed.id = 'auto-generated-' + Date.now();
      console.log('🛠️ API: Added missing profile ID:', fixed.id);
    }

    // Fix missing name
    if (!fixed.name) {
      fixed.name = this.capitalizeFirst(fixed.id) + ' Profile';
      console.log('🛠️ API: Added missing profile name:', fixed.name);
    }

    // Fix missing or invalid gridConfig
    if (!fixed.gridConfig) {
      fixed.gridConfig = {
        columns: '1fr',
        rows: '1fr',
        areas: [['main']]
      };
      console.log('🛠️ API: Added missing gridConfig');
    } else {
      if (!fixed.gridConfig.columns && !fixed.gridConfig.rows) {
        fixed.gridConfig.columns = '1fr';
        fixed.gridConfig.rows = '1fr';
        console.log('🛠️ API: Added missing grid columns/rows');
      }
      
      if (!fixed.gridConfig.areas || !Array.isArray(fixed.gridConfig.areas)) {
        fixed.gridConfig.areas = [['main']];
        console.log('🛠️ API: Fixed invalid grid areas');
      }
    }

    // Fix zones array
    if (!Array.isArray(fixed.zones)) {
      fixed.zones = [];
      console.log('🛠️ API: Converted zones to array');
    }

    // If zones array is empty, create a default zone
    if (fixed.zones.length === 0) {
      fixed.zones.push({
        id: 'main',
        name: 'Main Zone',
        gridArea: 'main',
        cards: [{
          id: 'fallback-message',
          type: 'text',
          title: 'Profile Recovery',
          content: 'This profile was automatically recovered from invalid data.'
        }]
      });
      console.log('🛠️ API: Added default zone');
    }

    // Fix individual zones
    fixed.zones.forEach((zone, index) => {
      if (!zone) {
        fixed.zones[index] = this.createDefaultZone(`zone-${index}`);
        console.log(`🛠️ API: Fixed null zone at index ${index}`);
        return;
      }

      if (!zone.id) {
        zone.id = `zone-${index}`;
        console.log(`🛠️ API: Added missing zone ID: ${zone.id}`);
      }

      if (!zone.gridArea) {
        zone.gridArea = zone.id;
        console.log(`🛠️ API: Added missing zone gridArea: ${zone.gridArea}`);
      }

      if (!zone.name) {
        zone.name = this.capitalizeFirst(zone.id) + ' Zone';
        console.log(`🛠️ API: Added missing zone name: ${zone.name}`);
      }

      if (!Array.isArray(zone.cards)) {
        zone.cards = [];
        console.log(`🛠️ API: Fixed zone "${zone.id}" cards array`);
      }
    });

    return fixed;
  }

  createDefaultZone(id) {
    return {
      id: id,
      name: this.capitalizeFirst(id) + ' Zone',
      gridArea: id,
      cards: []
    };
  }

  createFallbackProfile(originalId) {
    console.log('🚨 API: Creating complete fallback profile');
    return {
      id: originalId || 'fallback-profile',
      name: 'Fallback Profile (Data Recovery)',
      gridConfig: {
        columns: '1fr',
        rows: '1fr',
        areas: [['main']]
      },
      zones: [{
        id: 'main',
        name: 'Main Zone',
        gridArea: 'main',
        cards: [{
          id: 'fallback-error',
          type: 'error',
          title: 'Profile Loading Error',
          content: 'The original profile could not be loaded due to data structure issues. This is a fallback view. Please check the console for detailed error information.'
        }]
      }]
    };
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  getMissingCardPlaceholder(cardId) {
    return {
      id: cardId,
      type: 'text',
      title: 'Missing Card',
      content: `Card "${cardId}" could not be loaded. It may have been deleted or there was a network error.`
    };
  }

  getMockProfile() {
    return {
      id: 'mock-profile',
      name: 'Mock Profile (Offline Mode)',
      gridConfig: {
        columns: '25% 50% 25%',
        rows: '1fr',
        areas: [['left', 'center', 'right']]
      },
      zones: [
        {
          id: 'left',
          name: 'Left Zone',
          gridArea: 'left',
          cards: [
            {
              id: 'mock-status',
              type: 'status',
              title: 'Connection Status',
              status: 'offline',
              message: 'Using cached data - check your connection'
            }
          ]
        },
        {
          id: 'center',
          name: 'Center Zone', 
          gridArea: 'center',
          cards: [
            {
              id: 'mock-welcome',
              type: 'text',
              title: 'Welcome to Projector UI v2',
              content: 'This is mock data displayed while your Display API is unavailable. The app will automatically reconnect when your API is back online.'
            },
            {
              id: 'mock-chart',
              type: 'chart',
              title: 'Sample Metrics',
              chartType: 'bar',
              data: [12, 19, 3, 17, 25, 13, 22]
            }
          ]
        },
        {
          id: 'right',
          name: 'Right Zone',
          gridArea: 'right',
          cards: [
            {
              id: 'mock-info',
              type: 'info',
              title: 'System Information',
              items: [
                'API polling every 10 seconds',
                'Offline fallback active',
                'Data cached locally',
                `API endpoint: ${API_BASE_URL}`
              ]
            }
          ]
        }
      ]
    };
  }
}

export default new APIService();