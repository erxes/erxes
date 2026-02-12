import { Router } from 'express';
import { router as broadcastRoutes } from '~/modules/broadcast/routes';
import { router as documentRoutes } from '~/modules/documents/routes';
import { router as organizationRoutes } from '~/modules/organization/routes';
import { router as fileRoutes } from '~/routes/fileRoutes';
import { router as importExportRoutes } from '~/modules/import-export/routes';

const router: Router = Router();

router.use(organizationRoutes);
router.use(fileRoutes);
router.use(documentRoutes);
router.use(broadcastRoutes);
router.use(importExportRoutes);

export { router };
