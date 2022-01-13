import { Router } from 'express';
import { prepareSmsStats } from '../telnyxUtils';
import { routeErrorHandling } from '../utils';

const router = Router();

import { debugEngages, debugRequest } from '../debuggers';
import { DeliveryReports, Logs, Stats } from '../models';

router.get(
  '/statsList/:engageMessageId',
  routeErrorHandling(async (req, res) => {
    debugRequest(debugEngages, req);

    const { engageMessageId } = req.params;
    const stats = await Stats.findOne({ engageMessageId });

    if (!stats) {
      return res.json({});
    }

    return res.json(stats);
  })
);

router.get(
  '/smsStats/:engageMessageId',
  routeErrorHandling(async (req, res) => {
    debugRequest(debugEngages, req);

    const { engageMessageId } = req.params;

    const smsStats = await prepareSmsStats(engageMessageId);

    return res.json(smsStats);
  })
);

router.get(
  `/reportsList/:engageMessageId`,
  routeErrorHandling(async (req, res) => {
    debugRequest(debugEngages, req);

    const deliveryReports = await DeliveryReports.findOne({
      engageMessageId: req.params.engageMessageId
    });

    if (!deliveryReports) {
      return res.json({});
    }

    return res.json(deliveryReports);
  })
);

router.get(
  `/logs/:engageMessageId`,
  routeErrorHandling(async (req, res) => {
    debugRequest(debugEngages, req);

    const logs = await Logs.find({
      engageMessageId: req.params.engageMessageId
    });

    return res.json(logs);
  })
);

export default router;
