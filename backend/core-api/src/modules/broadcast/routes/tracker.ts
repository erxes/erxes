import { Request, Response, Router } from 'express';
import { engageTracker } from '../trackers';
import { routeErrorHandling } from '../utils';

const router: Router = Router();

router.post(
  '/',
  routeErrorHandling(async (req: Request, res: Response) => {
    return engageTracker(req, res);
  }),
);

export { router };
