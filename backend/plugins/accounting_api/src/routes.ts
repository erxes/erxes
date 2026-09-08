import { Router } from 'express';
import { importErkhetTransactions } from './modules/accounting/routes/erkhetMigration';
import { importErkhetReferences } from './modules/accounting/routes/erkhetReferenceMigration';

export const router: Router = Router();

router.post('/migration/erkhet/references', importErkhetReferences);
router.post('/migration/erkhet/transactions', importErkhetTransactions);
