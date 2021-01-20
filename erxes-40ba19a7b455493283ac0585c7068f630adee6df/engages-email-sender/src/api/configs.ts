import { Router } from 'express';
import { debugEngages, debugRequest } from '../debuggers';
import { Configs } from '../models';
import { awsRequests } from '../trackers/engageTracker';
import { createTransporter, updateConfigs } from '../utils';

const router = Router();

router.post('/save', async (req, res, next) => {
  debugRequest(debugEngages, req);

  const { configsMap } = req.body;

  try {
    await updateConfigs(configsMap);
  } catch (e) {
    return next(new Error(e));
  }

  return res.json({ status: 'ok' });
});

router.get('/detail', async (req, res) => {
  debugRequest(debugEngages, req);

  const configs = await Configs.find({});

  return res.json(configs);
});

router.get('/get-verified-emails', async (req, res, next) => {
  debugRequest(debugEngages, req);

  try {
    const emails = await awsRequests.getVerifiedEmails();
    return res.json(emails);
  } catch (e) {
    return next(new Error(e));
  }
});

router.post('/verify-email', async (req, res, next) => {
  debugRequest(debugEngages, req);

  try {
    const response = await awsRequests.verifyEmail(req.body.email);
    return res.json(JSON.stringify(response));
  } catch (e) {
    return next(new Error(e));
  }
});

router.post('/remove-verified-email', async (req, res, next) => {
  debugRequest(debugEngages, req);

  try {
    const response = await awsRequests.removeVerifiedEmail(req.body.email);
    return res.json(JSON.stringify(response));
  } catch (e) {
    return next(new Error(e));
  }
});

router.post('/send-test-email', async (req, res, next) => {
  debugRequest(debugEngages, req);

  const { from, to, content } = req.body;

  const transporter = await createTransporter();

  try {
    const response = await transporter.sendMail({
      from,
      to,
      subject: content,
      html: content
    });

    return res.json(JSON.stringify(response));
  } catch (e) {
    return next(new Error(e));
  }
});

export default router;
