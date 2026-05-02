import { Router } from 'express';
import { pool } from '../db/postgres';
import { redis } from '../cache/redis';
import { getSignalCount, resetSignalCount } from '../ingestion/signalIngestion';

export const healthRouter = Router();

healthRouter.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    await redis.ping();
    res.json({
      status: 'healthy',
      postgres: 'up',
      redis: 'up',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(503).json({ status: 'unhealthy', error: String(err) });
  }
});

export const startMetrics = () => {
  setInterval(() => {
    const count = getSignalCount();
    resetSignalCount();
    console.log(`📊 Throughput: ${count} signals/sec (last 5s avg: ${Math.round(count/5)}/sec)`);
  }, 5000);
};
