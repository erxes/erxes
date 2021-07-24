import { Router } from 'express';
import { debugEngages, debugRequest } from '../debuggers';
import Automations from '../models/Automations';
import { routeErrorHandling } from './utils';

const router = Router();

router.post(
  '/createAutomation',
  routeErrorHandling(async (req, res) => {
    debugRequest(debugEngages, req);

    const { doc } = req.body;
    const automation = await Automations.create({ ...doc });

    return res.json({ ...automation });
  })
);

router.post(
  '/updateAutomation',
  routeErrorHandling(async (req, res) => {
    debugRequest(debugEngages, req);

    const { doc } = req.body;
    const { _id } = doc;
    await Automations.updateOne({ _id }, { $set: { ...doc } });
    const updated = await Automations.getAutomation({ _id })

    return res.json({ ...updated });
  })
);

router.post(
  '/removeAutomations',
  routeErrorHandling(async (req, res) => {
    debugRequest(debugEngages, req);

    const { automationIds } = req.body;
    await Automations.deleteMany({ _id: { $in: automationIds } });

    return res.json({ status: 'ok' });
  })
);

export default router;
