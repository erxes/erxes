import { Request, Response, Router } from 'express';
import { engageTracker } from '../trackers';
import { sendgridTracker } from '../trackers/sendgrid';
import { routeErrorHandling } from '../utils';

const router: Router = Router();

router.post(
  '/',
  routeErrorHandling(async (req: Request, res: Response) => {
    return engageTracker(req, res);
  }),
);

router.post(
  '/sendgrid',
  routeErrorHandling(async (req: Request, res: Response) => {
    return sendgridTracker(req, res);
  }),
);

export { router };
