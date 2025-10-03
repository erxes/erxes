import { Router } from 'express';
import { router as facebookRouter } from './modules/integrations/facebook/routes';

export const router: Router = Router();

router.use('/facebook', facebookRouter);
