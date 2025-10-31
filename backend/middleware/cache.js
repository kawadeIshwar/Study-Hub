// Cache middleware for backend responses
import { createClient } from 'redis';

// In-memory cache as fallback
const memoryCache = new Map();
const MEMORY_CACHE_MAX_SIZE = 100;

// Redis client setup (optional, will use memory cache as fallback)
let redisClient = null;
let isRedisConnected = false;

// Initialize Redis if available
const initRedis = async () => {
  if (process.env.REDIS_URL) {
    try {
      redisClient = createClient({
        url: process.env.REDIS_URL
      });

      redisClient.on('error', (err) => {
        console.error('Redis Client Error:', err);
        isRedisConnected = false;
      });

      redisClient.on('connect', () => {
        console.log('✅ Redis connected successfully');
        isRedisConnected = true;
      });

      await redisClient.connect();
    } catch (error) {
      console.log('⚠️ Redis not available, using memory cache');
      redisClient = null;
      isRedisConnected = false;
    }
  } else {
    console.log('💾 Using in-memory cache (Redis URL not configured)');
  }
};

// Initialize on module load
initRedis();

// Cache configuration
const CACHE_DURATION = {
  short: 30, // 30 seconds
  medium: 180, // 3 minutes
  long: 300, // 5 minutes
  default: 180
};

// Get from cache
async function getFromCache(key) {
  try {
    if (isRedisConnected && redisClient) {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } else {
      return memoryCache.get(key) || null;
    }
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

// Set to cache
async function setToCache(key, value, duration = CACHE_DURATION.default) {
  try {
    if (isRedisConnected && redisClient) {
      await redisClient.setEx(key, duration, JSON.stringify(value));
    } else {
      // Use memory cache with size limit
      if (memoryCache.size >= MEMORY_CACHE_MAX_SIZE) {
        // Remove oldest entry
        const firstKey = memoryCache.keys().next().value;
        memoryCache.delete(firstKey);
      }
      memoryCache.set(key, value);
      
      // Auto-expire from memory cache
      setTimeout(() => {
        memoryCache.delete(key);
      }, duration * 1000);
    }
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

// Delete from cache
async function deleteFromCache(key) {
  try {
    if (isRedisConnected && redisClient) {
      await redisClient.del(key);
    } else {
      memoryCache.delete(key);
    }
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

// Clear cache by pattern
async function clearCachePattern(pattern) {
  try {
    if (isRedisConnected && redisClient) {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } else {
      // Clear memory cache by pattern
      for (const key of memoryCache.keys()) {
        if (key.includes(pattern)) {
          memoryCache.delete(key);
        }
      }
    }
  } catch (error) {
    console.error('Cache clear error:', error);
  }
}

// Cache middleware factory
function cacheMiddleware(duration = CACHE_DURATION.default, customKey = null) {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    try {
      // Generate cache key
      const cacheKey = customKey || `cache:${req.originalUrl || req.url}`;
      
      // Try to get from cache
      const cachedData = await getFromCache(cacheKey);
      
      if (cachedData) {
        console.log(`✅ Cache HIT: ${cacheKey}`);
        return res.json(cachedData);
      }

      console.log(`⚠️ Cache MISS: ${cacheKey}`);

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache response
      res.json = function(data) {
        // Cache the response
        setToCache(cacheKey, data, duration).catch(err => {
          console.error('Failed to cache response:', err);
        });

        // Send response
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
}

// Cache invalidation middleware
function invalidateCache(pattern) {
  return async (req, res, next) => {
    try {
      await clearCachePattern(pattern);
      console.log(`🗑️ Cache invalidated: ${pattern}`);
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
    next();
  };
}

export {
  cacheMiddleware,
  invalidateCache,
  getFromCache,
  setToCache,
  deleteFromCache,
  clearCachePattern,
  CACHE_DURATION
};
