import { Router } from 'express';
import { messagingAttachmentRouter } from '@/messaging/attachments';
import { messagingAdminRouter } from '@/messaging/admin';

export const router: Router = Router();

router.use(messagingAttachmentRouter);
router.use(messagingAdminRouter);
