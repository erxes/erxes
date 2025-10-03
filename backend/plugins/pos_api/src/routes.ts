import { Router } from 'express';
import { posInit, posSyncConfig, unfetchOrderInfo } from './modules/pos/routes';

export const router: Router = Router();
router.get(`/pos-init`, posInit)
// router.use(`/file-export`, exportFileRunner)
router.post(`/api/unfetch-order-info`, unfetchOrderInfo)
router.post(`/pos-sync-config`, posSyncConfig)

