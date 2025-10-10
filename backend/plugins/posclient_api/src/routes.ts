import { Router } from 'express';
import { posInitialSetup } from './modules/posclient/routes';

export const router: Router = Router();
router.get(`/initial-setup`, posInitialSetup);
router.post(`/pl:posclient/initial-setup`, posInitialSetup);
