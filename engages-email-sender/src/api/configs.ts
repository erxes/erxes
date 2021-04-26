import { Router } from 'express';
import { debugEngages, debugRequest } from '../debuggers';
import { Configs } from '../models';
import { awsRequests } from '../trackers/engageTracker';
import { createTransporter, routeErrorHandling, updateConfigs } from '../utils';

const router = Router();

router.post(
  '/save',
  routeErrorHandling(async (req, res) => {
    debugRequest(debugEngages, req);

    const { configsMap } = req.body;

    await updateConfigs(configsMap);

    return res.json({ status: 'ok' });
  })
);

router.get(
  '/detail',
  routeErrorHandling(async (req, res) => {
    debugRequest(debugEngages, req);

    const configs = await Configs.find({});

    return res.json(configs);
  })
);

router.get(
  '/get-verified-emails',
  routeErrorHandling(async (req, res) => {
    debugRequest(debugEngages, req);

    const emails = await awsRequests.getVerifiedEmails();

    return res.json(emails);
  })
);

router.post(
  '/verify-email',
  routeErrorHandling(async (req, res) => {
    debugRequest(debugEngages, req);

    const response = await awsRequests.verifyEmail(req.body.email);

    return res.json(JSON.stringify(response));
  })
);

router.post(
  '/remove-verified-email',
  routeErrorHandling(async (req, res) => {
    debugRequest(debugEngages, req);

    const response = await awsRequests.removeVerifiedEmail(req.body.email);
    return res.json(JSON.stringify(response));
  })
);

router.post(
  '/send-test-email',
  routeErrorHandling(async (req, res) => {
    debugRequest(debugEngages, req);

    const { from, to, content, title } = req.body;

    const transporter = await createTransporter();

    const response = await transporter.sendMail({
      from,
      to,
      subject: title,
      html: content
    });

    return res.json(JSON.stringify(response));
  })
);

export default router;
