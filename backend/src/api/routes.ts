import { Router, Request, Response } from 'express';
import { pool } from '../db/postgres';
import { Signal } from '../db/mongo';
import { getState } from '../workflow/states/WorkItemState';
import { setDashboardState, getDashboardState } from '../cache/redis';
import { v4 as uuidv4 } from 'uuid';

export const apiRouter = Router();

// Get all work items (dashboard)
apiRouter.get('/work-items', async (req: Request, res: Response) => {
  try {
    const cached = await getDashboardState('work-items');
    if (cached) return res.json(cached);

    const result = await pool.query(
      `SELECT * FROM work_items ORDER BY
       CASE severity WHEN 'P0' THEN 1 WHEN 'P1' THEN 2 WHEN 'P2' THEN 3 ELSE 4 END,
       created_at DESC`
    );
    await setDashboardState('work-items', result.rows);
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch work items' });
  }
});

// Get single work item with signals
apiRouter.get('/work-items/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM work_items WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const signals = await Signal.find({ workItemId: id }).sort({ receivedAt: -1 }).limit(100);
    const rca = await pool.query('SELECT * FROM rca_records WHERE work_item_id = $1', [id]);

    return res.json({
      workItem: result.rows[0],
      signals,
      rca: rca.rows[0] || null
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch work item' });
  }
});

// Transition work item status
apiRouter.patch('/work-items/:id/transition', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM work_items WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const workItem = result.rows[0];
    const currentState = getState(workItem.status);

    if (currentState.label() === 'RESOLVED') {
      const rca = await pool.query('SELECT * FROM rca_records WHERE work_item_id = $1', [id]);
      if (rca.rows.length === 0) {
        return res.status(400).json({ error: 'RCA required before closing' });
      }
    }

    const nextStatus = currentState.next();
    await pool.query(
      `UPDATE work_items SET status = $1, updated_at = NOW() WHERE id = $2`,
      [nextStatus, id]
    );

    await setDashboardState('work-items', null);
    return res.json({ message: `Transitioned to ${nextStatus}`, status: nextStatus });
  } catch (err) {
    return res.status(500).json({ error: 'Transition failed' });
  }
});

// Submit RCA
apiRouter.post('/work-items/:id/rca', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { incident_start, incident_end, root_cause_category, fix_applied, prevention_steps } = req.body;

    if (!incident_start || !incident_end || !root_cause_category || !fix_applied || !prevention_steps) {
      return res.status(400).json({ error: 'All RCA fields are required' });
    }

    const start = new Date(incident_start);
    const end = new Date(incident_end);
    const mttr = Math.round((end.getTime() - start.getTime()) / 60000);

    const rcaId = uuidv4();
    await pool.query(
      `INSERT INTO rca_records (id, work_item_id, incident_start, incident_end, root_cause_category, fix_applied, prevention_steps)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [rcaId, id, incident_start, incident_end, root_cause_category, fix_applied, prevention_steps]
    );

    await pool.query(
      `UPDATE work_items SET mttr_minutes = $1, end_time = $2, updated_at = NOW() WHERE id = $3`,
      [mttr, incident_end, id]
    );

    return res.json({ message: 'RCA submitted', mttr_minutes: mttr });
  } catch (err) {
    return res.status(500).json({ error: 'RCA submission failed' });
  }
});
