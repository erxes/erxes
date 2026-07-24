import { Router } from 'express';
import { importErkhetTransactions } from './modules/accounting/routes/erkhetMigration';

export const router: Router = Router();

router.post('/migration/erkhet/transactions', importErkhetTransactions);
