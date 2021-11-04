import { Router } from 'express';
import { debugError, debugAutomations, debugRequest } from './debuggers';
import Automations from './models/Automations';
import { Executions } from './models/Executions';
import { Notes } from './models/Notes';

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
    debugRequest(debugAutomations, req);

    const { doc } = req.body;

    const automation = await Automations.create({
      ...doc,
      createdAt: new Date()
    });

    return res.json({
      ...(await Automations.getAutomation({ _id: automation._id }))
    });
  })
);

router.post(
  '/update',
  routeErrorHandling(async (req, res) => {
    debugRequest(debugAutomations, req);
    const { doc } = req.body;
    const { _id } = doc;

    await Automations.updateOne(
      { _id },
      { $set: { ...doc, updatedAt: new Date() } }
    );
    const updated = await Automations.getAutomation({ _id });

    return res.json({ ...updated });
  })
);

router.post(
  '/remove',
  routeErrorHandling(async (req, res) => {
    debugRequest(debugAutomations, req);

    const { automationIds } = req.body;

    const automations = await Automations.find({ _id: { $in: automationIds } });

    let segmentIds: string[] = [];

    for (const automation of automations) {
      const { triggers, actions } = automation;

      const triggerIds = triggers.map(trigger => {
        return trigger.config.contentId;
      });

      const actionIds = actions.map(action => {
        return action.config.contentId;
      });

      segmentIds = [...triggerIds, ...actionIds];
    }

    await Automations.deleteMany({ _id: { $in: automationIds } });
    await Executions.removeExecutions(automationIds);

    return res.json({ status: 'ok', segmentIds });
  })
);

router.get(
  '/detail/:id',
  routeErrorHandling(async (req, res) => {
    debugRequest(debugAutomations, req);

    const { id } = req.params;

    const automation = await Automations.getAutomation({ _id: id });

    return res.json(JSON.parse(JSON.stringify(automation)));
  })
);

router.get(
  '/list',
  routeErrorHandling(async (req, res) => {
    debugRequest(debugAutomations, req);
    const { page, perPage, status, searchValue } = req.query;

    const _limit = Number(perPage || '20');
    const _skip = (Number(page || '1') - 1) * _limit;

    const filter: any = {};

    if (status) {
      filter.status = status;
    } else {
      filter.status = { $ne: 'template' };
    }

    if (searchValue) {
      filter.name = new RegExp(`.*${searchValue}.*`, 'i');
    }

    const automations = await Automations.find(filter)
      .sort({ createdAt: -1 })
      .skip(_skip)
      .limit(_limit);

    if (!automations) {
      return res.json({ list: [], totalCount: 0 });
    }

    const totalCount = await Automations.find(filter).countDocuments();

    return res.json({
      list: automations,
      totalCount
    });
  })
);

router.get(
  '/getTotalCount',
  routeErrorHandling(async (req, res) => {
    const { status } = req.query;

    const filter: any = {};
    if (status) {
      filter.status = status;
    }
    const total = await Automations.find(filter).countDocuments();

    return res.json({
      total
    });
  })
);

router.get(
  '/find',
  routeErrorHandling(async (req, res) => {
    const selector = req.query;

    const automations = await Automations.find(selector);

    return res.json(automations);
  })
);

router.post(
  '/createNote',
  routeErrorHandling(async (req, res) => {
    debugRequest(debugAutomations, req);

    const { doc } = req.body;
    const note = await Notes.createNote(doc);

    return res.json(note);
  })
);

router.post(
  '/updateNote',
  routeErrorHandling(async (req, res) => {
    debugRequest(debugAutomations, req);

    const { _id, doc } = req.body;
    const note = await Notes.updateNote(_id, doc);

    return res.json(note);
  })
);

router.post(
  '/deleteNote',
  routeErrorHandling(async (req, res) => {
    debugRequest(debugAutomations, req);

    const { _id } = req.body;

    const response = await Notes.deleteOne({ _id });

    return res.json(response);
  })
);

router.get(
  '/notes',
  routeErrorHandling(async (req, res) => {
    debugRequest(debugAutomations, req);

    const selector = req.query;

    const notes = await Notes.find(selector).sort({ createdAt: -1 });

    return res.json(notes);
  })
);

router.get(
  '/note',
  routeErrorHandling(async (req, res) => {
    debugRequest(debugAutomations, req);

    const selector = req.query;

    const note = await Notes.findOne(selector).lean();

    return res.json(note);
  })
);

router.get(
  '/histories',
  routeErrorHandling(async (req, res) => {
    debugRequest(debugAutomations, req);
    const {
      page,
      perPage,
      automationId,
      triggerType,
      triggerId,
      status,
      beginDate,
      endDate
    } = req.query;

    const _limit = Number(perPage || '20');
    const _skip = (Number(page || '1') - 1) * _limit;

    const filter: any = { automationId };

    if (status) {
      filter.status = status;
    }

    if (triggerId) {
      filter.triggerId = triggerId;
    }

    if (triggerType) {
      filter.triggerType = triggerType;
    }

    if (beginDate) {
      filter.createdAt = { $gte: beginDate };
    }

    if (endDate) {
      filter.createdAt = { $lte: endDate };
    }

    const histories = await Executions.find(filter)
      .sort({ createdAt: -1 })
      .skip(_skip || 0)
      .limit(_limit);

    return res.json(histories);
  })
);

export default router;
