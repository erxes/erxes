import { Router } from 'express';
import { router as telnyxRouter } from './telnyx';
import { router as trackerRouter } from './tracker';
import { router as unsubscribeRouter } from './unsubscribe';

const router: Router = Router();

router.use('/telnyx', telnyxRouter);
router.use('/service/engage/tracker', trackerRouter);
router.use('/unsubscribe', unsubscribeRouter);

export { router };
