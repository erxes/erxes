import { Router } from 'express';
import { router as facebookRouter } from './modules/integrations/facebook/routes';
import { router as instagramRouter } from './modules/integrations/instagram/routes';
import { router as mailRouter } from './modules/integrations/mail/routes';
import { router as callProRouter } from './modules/integrations/callpro/routes';
import { isCallProEnabled } from './modules/integrations/callpro/config';

export const router: Router = Router();

router.use('/facebook', facebookRouter);
router.use('/instagram', instagramRouter);
router.use('/mail', mailRouter);

if (isCallProEnabled()) {
  router.use('/callpro', callProRouter);
}
