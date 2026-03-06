import { Router } from 'express';
import { router as telnyxRouter } from './telnyx';
import { router as trackerRouter } from './tracker';

const router: Router = Router();

router.use('/telnyx', telnyxRouter);
router.use('/service/engage/tracker', trackerRouter);

export { router };
