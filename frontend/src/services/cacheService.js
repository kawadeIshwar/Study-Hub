// Cache service for storing API responses and reducing backend calls
class CacheService {
  constructor() {
    this.CACHE_VERSION = 'v1';
    this.CACHE_DURATION = {
      notes: 5 * 60 * 1000, // 5 minutes for notes
      communities: 3 * 60 * 1000, // 3 minutes for communities
      members: 2 * 60 * 1000, // 2 minutes for members
      messages: 30 * 1000, // 30 seconds for messages
      user: 10 * 60 * 1000, // 10 minutes for user data
    };
  }

  // Get cache key with version
  getCacheKey(key) {
    return `${this.CACHE_VERSION}_${key}`;
  }

  // Set item in localStorage with timestamp
  set(key, data, customDuration = null) {
    try {
      const cacheKey = this.getCacheKey(key);
      const cacheData = {
        data,
        timestamp: Date.now(),
        duration: customDuration || this.CACHE_DURATION[key.split('_')[0]] || 5 * 60 * 1000
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      // Handle quota exceeded error
      if (error.name === 'QuotaExceededError') {
        this.clearOldCache();
      }
      return false;
    }
  }

  // Get item from localStorage if not expired
  get(key) {
    try {
      const cacheKey = this.getCacheKey(key);
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) return null;

      const { data, timestamp, duration } = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid
      if (now - timestamp < duration) {
        return data;
      }

      // Cache expired, remove it
      this.remove(key);
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // Remove specific cache item
  remove(key) {
    try {
      const cacheKey = this.getCacheKey(key);
      localStorage.removeItem(cacheKey);
    } catch (error) {
      console.error('Cache remove error:', error);
    }
  }

  // Clear all cache for this version
  clearAll() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_VERSION)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Cache clear error:', error);
    }
  }

  // Clear old/expired cache entries
  clearOldCache() {
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();

      keys.forEach(key => {
        if (key.startsWith(this.CACHE_VERSION)) {
          try {
            const cached = localStorage.getItem(key);
            const { timestamp, duration } = JSON.parse(cached);
            
            if (now - timestamp >= duration) {
              localStorage.removeItem(key);
            }
          } catch (e) {
            // Invalid cache entry, remove it
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.error('Clear old cache error:', error);
    }
  }

  // Cache wrapper for API calls
  async cacheAPICall(key, apiCall, customDuration = null) {
    // Try to get from cache first
    const cached = this.get(key);
    if (cached) {
      console.log(`✅ Cache HIT for ${key}`);
      return { data: cached, fromCache: true };
    }

    // If not in cache, make API call
    console.log(`⚠️ Cache MISS for ${key}, fetching from API...`);
    try {
      const response = await apiCall();
      const data = response.data;
      
      // Store in cache
      this.set(key, data, customDuration);
      
      return { data, fromCache: false };
    } catch (error) {
      console.error(`API call failed for ${key}:`, error);
      throw error;
    }
  }

  // Invalidate cache by pattern
  invalidatePattern(pattern) {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes(pattern)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Invalidate pattern error:', error);
    }
  }

  // Check cache health
  getCacheStats() {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_VERSION));
      const now = Date.now();
      
      let valid = 0;
      let expired = 0;
      let totalSize = 0;

      cacheKeys.forEach(key => {
        try {
          const cached = localStorage.getItem(key);
          totalSize += cached.length;
          const { timestamp, duration } = JSON.parse(cached);
          
          if (now - timestamp < duration) {
            valid++;
          } else {
            expired++;
          }
        } catch (e) {
          expired++;
        }
      });

      return {
        total: cacheKeys.length,
        valid,
        expired,
        sizeKB: (totalSize / 1024).toFixed(2)
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return null;
    }
  }
}

// Export singleton instance
const cacheService = new CacheService();
export default cacheService;
