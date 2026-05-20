import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { posInitialSetup } from './modules/posclient/routes';

// Rate limiter for POST /pl:posclient/initial-setup:
// max 100 requests per 15 minutes per IP. The handler performs a MongoDB
// lookup and writes cookies on every call, so an unbounded endpoint is a
// DoS amplifier. CodeQL alert: js/missing-rate-limiting (#986).
const POS_INITIAL_SETUP_POST_LIMITER = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export const router: Router = Router();
router.get(`/initial-setup`, posInitialSetup);
router.post(
  `/pl:posclient/initial-setup`,
  POS_INITIAL_SETUP_POST_LIMITER,
  posInitialSetup,
);
