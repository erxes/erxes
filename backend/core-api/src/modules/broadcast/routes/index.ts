import { Router } from 'express';
import { router as telnyxRouter } from './telnyx';

const router: Router = Router();

router.use('/telnyx', telnyxRouter);

export { router };
