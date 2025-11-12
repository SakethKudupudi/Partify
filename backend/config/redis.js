import redis from 'redis';

let redisClient;

export async function initializeRedis() {
  try {
    redisClient = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      retry_strategy: () => 10000
    });

    redisClient.on('error', (err) => {
      console.warn('⚠️  Redis error (continuing without Redis):', err.message);
    });

    console.log('✓ Redis initialized');
  } catch (error) {
    console.warn('⚠️  Redis initialization skipped (optional)');
  }
}

export function getRedis() {
  return redisClient;
}

