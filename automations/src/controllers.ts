import { Router } from 'express';
import { debugError, debugEngages, debugRequest } from './debuggers';
import Automations from './models/Automations';

export const routeErrorHandling = (fn, callback?: any) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (e) {
      debugError(e.message);

      if (callback) {
        return callback(res, e);
      }

      return next(e);
    }
  };
};

const router = Router();

router.post(
  '/create',
  routeErrorHandling(async (req, res) => {
    debugRequest(debugEngages, req);

    const { doc } = req.body;
    const automation = await Automations.create({ ...doc });

    return res.json({ ...(await Automations.getAutomation({ _id: automation._id })) });
  })
);

router.post(
  '/update',
  routeErrorHandling(async (req, res) => {
    debugRequest(debugEngages, req);
    const { doc } = req.body;
    const { _id } = doc;

    await Automations.updateOne({ _id }, { $set: { ...doc } });
    const updated = await Automations.getAutomation({ _id });

    return res.json({ ...updated });
  })
);

router.post(
  '/remove',
  routeErrorHandling(async (req, res) => {
    debugRequest(debugEngages, req);

    const { automationIds } = req.body;
    await Automations.deleteMany({ _id: { $in: automationIds } });

    return res.json({ status: 'ok' });
  })
);

router.get(
  '/detail/:id',
  routeErrorHandling(async (req, res) => {
    debugRequest(debugEngages, req);

    const { id } = req.params;

    const automations = await Automations.getAutomation({ _id: id });

    return res.json(automations);
  })
);

router.get(
  '/list',
  routeErrorHandling(async (req, res) => {
    const { page, perPage, status, searchValue } = req.query;

    const _page = Number(page || '1');
    const _limit = Number(perPage || '20');

    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (searchValue) {
      filter.name = new RegExp(`.*${searchValue}.*`, 'i')
    }

    const automations = await Automations.find(filter)
      .limit(_limit)
      .skip((_page - 1) * _limit)
      .sort({ createdAt: -1 });

    if (!automations) {
      return res.json({ list: [], totalCount: 0 });
    }

    const totalCount = await Automations.countDocuments();

    return res.json({
      list: automations,
      totalCount
    });
  })
);

router.get(
  '/find',
  routeErrorHandling(async (req, res) => {
    const { selector } = req.query;

    const automations = await Automations.find(selector);
    return res.json(automations);
  })
);

export default router;