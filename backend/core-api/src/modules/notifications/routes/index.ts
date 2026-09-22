import { Router } from 'express';
import { router as senderConfirmRouter } from './senderConfirm';

const router: Router = Router();

router.use('/email-senders/confirm', senderConfirmRouter);

export { router };
