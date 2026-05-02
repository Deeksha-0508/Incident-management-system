import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { signalQueue } from '../queue/worker';

export const ingestionRouter = Router();

const limiter = rateLimit({
  windowMs: 1000,
  max: 500,
  message: { error: 'Rate limit exceeded' }
});

ingestionRouter.use(limiter);

let signalCount = 0;

export const getSignalCount = () => signalCount;
export const resetSignalCount = () => { signalCount = 0; };

ingestionRouter.post('/signals', async (req: Request, res: Response) => {
  try {
    const { componentId, errorType, severity, payload } = req.body;

    if (!componentId || !errorType || !severity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await signalQueue.add('signal', { componentId, errorType, severity, payload });
    signalCount++;

    return res.status(202).json({ message: 'Signal accepted' });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});
