import { Router } from 'express';
import { router as agentsRoutes } from '~/modules/agents/routes';
import { router as broadcastRoutes } from '~/modules/broadcast/routes';
import { router as documentRoutes } from '~/modules/documents/routes';
import { router as organizationRoutes } from '~/modules/organization/routes';
import { router as fileRoutes } from '~/routes/fileRoutes';
import { router as filesModuleRoutes } from '~/modules/files/routes';
import { router as importExportRoutes } from '~/modules/import-export/routes';
import { router as notificationRoutes } from '~/modules/notifications/routes';
import { router as oauthRoutes } from '~/modules/auth/routes/oauth/routes';
import { router as templateRoutes } from '~/modules/template/routes';

const router: Router = Router();

router.use(organizationRoutes);
router.use(fileRoutes);
router.use(filesModuleRoutes);
router.use(documentRoutes);
router.use(broadcastRoutes);
router.use(notificationRoutes);
router.use(importExportRoutes);
router.use(templateRoutes);
router.use(oauthRoutes);
router.use(agentsRoutes);

export { router };
