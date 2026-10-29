import { NextFunction, Request, Response, Router } from 'express';
import { extractUserFromHeader } from 'erxes-api-shared/utils';
import { importErkhetTransactions } from './modules/accounting/routes/erkhetMigration';
import { importErkhetReferences } from './modules/accounting/routes/erkhetReferenceMigration';

export const router: Router = Router();

const requireUser = (req: Request, res: Response, next: NextFunction) => {
  if (!extractUserFromHeader(req.headers)) {
    return res.status(401).json({ error: 'Login required' });
  }

  return next();
};

router.post(
  '/migration/erkhet/references',
  requireUser,
  importErkhetReferences,
);
router.post(
  '/migration/erkhet/transactions',
  requireUser,
  importErkhetTransactions,
);
