import { createClient } from 'redis';

let redisClient;

export async function initializeRedis() {
  try {
    const redisHost = process.env.REDIS_HOST || 'localhost';
    const redisPort = process.env.REDIS_PORT || 6379;
    const redisPassword = process.env.REDIS_PASSWORD;
    const useTLS = process.env.REDIS_USE_TLS === 'true';
    
    // Build Redis URL based on whether we're using Azure or local
    let redisUrl;
    if (redisPassword) {
      // Azure Redis or authenticated Redis
      const protocol = useTLS ? 'rediss' : 'redis';
      redisUrl = `${protocol}://:${redisPassword}@${redisHost}:${redisPort}`;
    } else {
      // Local Redis without password
      redisUrl = `redis://${redisHost}:${redisPort}`;
    }
    
    const clientConfig = {
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.warn('⚠️  Redis max retries reached, continuing without Redis');
            return new Error('Max retries reached');
          }
          return Math.min(retries * 100, 3000);
        }
      }
    };

    // Add TLS options for Azure Redis
    if (useTLS) {
      clientConfig.socket.tls = true;
      clientConfig.socket.rejectUnauthorized = false; // For Azure Redis
    }

    redisClient = createClient(clientConfig);

    redisClient.on('error', (err) => {
      console.warn('⚠️  Redis error (continuing without Redis):', err.message);
    });

    redisClient.on('connect', () => {
      console.log('✓ Redis connected to', redisHost);
    });

    await redisClient.connect();
    console.log('✓ Redis initialized');
    console.log('✅ Redis ready');
  } catch (error) {
    console.warn('⚠️  Redis initialization failed (continuing without Redis):', error.message);
    // Create mock redis client for graceful degradation
    redisClient = {
      get: async () => null,
      set: async () => true,
      del: async () => true,
      exists: async () => false
    };
  }
}

export function getRedis() {
  return redisClient;
}

