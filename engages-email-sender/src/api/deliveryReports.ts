import { Router } from 'express';
import { prepareSmsStats } from '../telnyxUtils';

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

router.get('/smsStats/:engageMessageId', async (req, res) => {
  debugRequest(debugEngages, req);

  const { engageMessageId } = req.params;

  const smsStats = await prepareSmsStats(engageMessageId);

  return res.json(smsStats);
});

router.get('/reportsList', async (req, res) => {
  debugRequest(debugEngages, req);

  const { page, perPage } = req.query;

  const _page = Number(page || '1');
  const _limit = Number(perPage || '20');

  const deliveryReports = await DeliveryReports.find()
    .limit(_limit)
    .skip((_page - 1) * _limit)
    .sort({ createdAt: -1 });

  if (!deliveryReports) {
    return res.json({ list: [], totalCount: 0 });
  }

  const totalCount = await DeliveryReports.countDocuments();

  return res.json({
    list: deliveryReports,
    totalCount
  });
});

router.get(`/reportsList/:engageMessageId`, async (req, res) => {
  debugRequest(debugEngages, req);

  const deliveryReports = await DeliveryReports.findOne({
    engageMessageId: req.params.engageMessageId
  });

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
