import { Worker, Queue } from 'bullmq';
import { redis } from '../cache/redis';
import { pool } from '../db/postgres';
import { Signal } from '../db/mongo';
import { getAlertStrategy } from '../workflow/strategies/AlertStrategy';
import { v4 as uuidv4 } from 'uuid';

export const signalQueue = new Queue('signals', { connection: redis });

const debounceMap = new Map<string, string>();

export const startWorker = () => {
  const worker = new Worker('signals', async (job) => {
    const { componentId, errorType, severity, payload } = job.data;

    let workItemId = debounceMap.get(componentId);

    if (!workItemId) {
      workItemId = uuidv4();
      debounceMap.set(componentId, workItemId);

      await pool.query(
        `INSERT INTO work_items (id, component_id, severity, status, start_time)
         VALUES ($1, $2, $3, 'OPEN', NOW())`,
        [workItemId, componentId, severity]
      );

      const strategy = getAlertStrategy(componentId);
      strategy.notify(componentId, `New incident: ${errorType}`);

      setTimeout(() => debounceMap.delete(componentId), 10000);
    } else {
      await pool.query(
        `UPDATE work_items SET signal_count = signal_count + 1, updated_at = NOW()
         WHERE id = $1`,
        [workItemId]
      );
    }

    await Signal.create({ workItemId, componentId, errorType, severity, payload });

  }, { connection: redis, concurrency: 10 });

  worker.on('completed', (job) => {
    console.log(`✅ Signal processed: ${job.id}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Signal failed: ${job?.id}`, err.message);
  });

  console.log('✅ Queue worker started');
};
