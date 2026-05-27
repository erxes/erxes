import { Router } from 'express';
import { router as facebookRouter } from './modules/integrations/facebook/routes';
import { router as instagramRouter } from './modules/integrations/instagram/routes';

export const router: Router = Router();

router.use('/facebook', facebookRouter);
router.use('/instagram', instagramRouter);
