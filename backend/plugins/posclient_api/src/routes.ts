import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { posInitialSetup } from './modules/posclient/routes';

// Rate limiter for the GET /initial-setup route (alert #985):
// max 100 requests per 15 minutes per IP to mitigate DoS amplification
// against the per-request DB lookup performed by posInitialSetup.
const INITIAL_SETUP_LIMITER = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

export const router: Router = Router();
router.get(`/initial-setup`, INITIAL_SETUP_LIMITER, posInitialSetup);
router.post(`/pl:posclient/initial-setup`, posInitialSetup);
