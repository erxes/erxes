import { Router } from 'express';

const router = Router();

import { debugEngages, debugRequest } from '../debuggers';
import { DeliveryReports, Logs, Stats } from '../models';

router.get('/statsList/:engageMessageId', async (req, res) => {
  debugRequest(debugEngages, req);

  const { engageMessageId } = req.params;

  const stats = await Stats.findOne({ engageMessageId });

  if (!stats) {
    return res.json({});
  }

  return res.json(stats);
});

router.get(`/reportsList/:engageMessageId`, async (req, res) => {
  debugRequest(debugEngages, req);

  const deliveryReports = await DeliveryReports.findOne({ engageMessageId: req.params.engageMessageId });

  if (!deliveryReports) {
    return res.json({});
  }

  return res.json(deliveryReports);
});

router.get(`/logs/:engageMessageId`, async (req, res) => {
  debugRequest(debugEngages, req);

  const logs = await Logs.find({ engageMessageId: req.params.engageMessageId });

  return res.json(logs);
});

export default router;
