import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

export const redis = new Redis(process.env.REDIS_URL!);

redis.on('connect', () => console.log('✅ Redis connected'));
redis.on('error', (err) => console.error('Redis error:', err));

export const setDashboardState = async (key: string, value: any) => {
  await redis.set(`dashboard:${key}`, JSON.stringify(value), 'EX', 60);
};

export const getDashboardState = async (key: string) => {
  const val = await redis.get(`dashboard:${key}`);
  return val ? JSON.parse(val) : null;
};
