import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initPostgres } from './db/postgres';
import { initMongo } from './db/mongo';
import { ingestionRouter } from './ingestion/signalIngestion';
import { apiRouter } from './api/routes';
import { healthRouter } from './observability/health';
import { startWorker } from './queue/worker';
import { startMetrics } from './observability/health';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', ingestionRouter);
app.use('/api', apiRouter);
app.use('/', healthRouter);

const start = async () => {
  try {
    await initPostgres();
    await initMongo();
    startWorker();
    startMetrics();

    app.listen(PORT, () => {
      console.log(`🚀 IMS Backend running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start:', err);
    process.exit(1);
  }
};

start();
