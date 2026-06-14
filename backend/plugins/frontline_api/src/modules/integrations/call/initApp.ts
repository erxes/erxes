import { getSubdomain, graphqlPubsub } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import { receiveCdr } from '@/integrations/call/services/cdrServices';
import {
  handleCallEvent,
  handleReceiveCall,
} from '@/integrations/call/services/callEventService';
import {
  isSignatureEnforced,
  verifyWebhookSignature,
} from '@/integrations/call/webhookAuth';
import { upsertQueueStatistics } from '@/integrations/call/utils';

import express from 'express';
import redis from '@/integrations/call/redlock';

const authenticateApi = async (req, res, next) => {
  const integrationId = req.headers['x-integration-id'];
  const subdomain = getSubdomain(req);
  const enforce = isSignatureEnforced();

  if (!integrationId) {
    if (enforce) {
      return res.status(401).json({ error: 'Integration ID required' });
    }
    console.warn(
      `[call-webhook] missing x-integration-id (grace mode) subdomain=${subdomain}`,
    );
    return next();
  }

  let integration: any = null;
  try {
    const models = await generateModels(subdomain);
    integration = await models.CallIntegrations.findOne({ _id: integrationId });
  } catch (error) {
    console.error('[call-webhook] integration lookup failed:', error);
  }

  if (!integration) {
    if (enforce) {
      console.warn(
        `[call-webhook] unknown integration ${integrationId} in ${subdomain}`,
      );
      return res.status(403).json({ error: 'Unauthorized access to CDR data' });
    }
    console.warn(
      `[call-webhook] unknown integration ${integrationId} (grace mode) in ${subdomain}`,
    );
    return next();
  }

  const verification = verifyWebhookSignature(integration, req);
  if (!verification.ok) {
    if (enforce) {
      console.warn(
        `[call-webhook] signature rejected (${verification.reason}) integration=${integrationId} subdomain=${subdomain}`,
      );
      return res.status(403).json({ error: 'Invalid webhook signature' });
    }
    console.warn(
      `[call-webhook] signature ${verification.reason} (grace mode) integration=${integrationId} subdomain=${subdomain}`,
    );
  }

  req.callIntegration = integration;
  return next();
};

const initCallApp = async (app) => {
  console.log('********* INIT CALL ********');
  await redis.del('callCookie');

  app.use(
    express.json({
      limit: '15mb',
      verify: (req: any, _res, buf: Buffer) => {
        req.rawBody = buf;
      },
    }),
  );

  app.use((_req, _res, next) => {
    next();
  });

  app.get('/resetCallCookie', async (req, res) => {
    await redis.del('callCookie');
    return res.send('Reseted call cookie');
  });

  app.post('/call/queueRealtimeUpdate', authenticateApi, async (req, res) => {
    try {
      const subdomain = getSubdomain(req);
      const { queue, state } = req.body || {};

      if (!queue || !state) {
        return res.status(400).json({ error: 'queue and state are required' });
      }

      const snapshot = JSON.stringify(state);

      await redis.set(
        `callRealtimeHistory:${subdomain}:${queue}:aggregate`,
        snapshot,
      );

      await graphqlPubsub.publish(`queueRealtimeUpdate:${subdomain}`, {
        queueRealtimeUpdate: snapshot,
      });

      return res
        .status(200)
        .json({ message: 'Call dashboard data received successfully' });
    } catch (error) {
      console.error('Error receiving queue realtime update:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/call/queueStatistics', authenticateApi, async (req, res) => {
    try {
      const subdomain = getSubdomain(req);
      const models = await generateModels(subdomain);

      const integration =
        (req as any).callIntegration ||
        (req.body?.integrationId
          ? await models.CallIntegrations.findOne({
              inboxId: req.body.integrationId,
            })
          : null);

      if (!integration) {
        return res.status(400).json({ error: 'Integration not resolved' });
      }

      const result = await upsertQueueStatistics(models, integration, req.body);

      return res
        .status(200)
        .json({ message: 'Queue statistics received successfully', ...result });
    } catch (error) {
      console.error('Error receiving queue statistics:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.use((error, _req, res, _next) => {
    console.error('Error in middleware:', error);
    res.status(500).send(error.message);
  });

  app.post('/call/cdrReceive', authenticateApi, async (req, res) => {
    try {
      const data = req.body;

      const subdomain = getSubdomain(req);

      const models = await generateModels(subdomain);

      await receiveCdr(models, subdomain, data, (req as any).callIntegration);

      return res
        .status(200)
        .json({ message: 'Call cdr received successfully' });
    } catch (error) {
      console.error('Error receiving cdr:', error);
      res.status(500).json({ error: 'Internal Server Error sda' });
    }
  });

  app.post('/call/event', authenticateApi, async (req, res) => {
    try {
      const subdomain = getSubdomain(req);
      const models = await generateModels(subdomain);
      const result = await handleCallEvent(
        models,
        subdomain,
        req.body,
        (req as any).callIntegration,
      );
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error handling call event:', error);
      return res
        .status(500)
        .json({ error: 'Internal Server Error', message: error.message });
    }
  });

  app.post('/call/receiveCall', authenticateApi, async (req, res) => {
    try {
      const subdomain = getSubdomain(req);
      const models = await generateModels(subdomain);
      const result = await handleReceiveCall(
        models,
        subdomain,
        req.body,
        (req as any).callIntegration,
      );
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error handling receiveCall:', error);
      return res
        .status(500)
        .json({ error: 'Internal Server Error', message: error.message });
    }
  });
};

export default initCallApp;
