import { getEnv, getSubdomain, graphqlPubsub } from 'erxes-api-shared/utils';
import { generateModels } from '~/connectionResolvers';
import { receiveCdr } from '@/integrations/call/services/cdrServices';
import {
  handleCallEvent,
  handleReceiveCall,
} from '@/integrations/call/services/callEventService';

import express from 'express';
import redis from '@/integrations/call/redlock';

const authenticateApi = async (req, res, next) => {
  const erxesApiId = req.headers['x-integration-id'];

  if (!erxesApiId) {
    return res.status(401).json({ error: 'Integration ID required' });
  }
  const data = req.body;

  const subdomain = getSubdomain(req);
  if (data.history) {
    next();
    return;
  }
  if (data.type && data.uniqueid) {
    next();
    return;
  }
  const isAuthorized = await validateCompanyAccess(subdomain, data);
  if (!isAuthorized) {
    console.warn(
      `Unauthorized CDR access attempt: ${subdomain}, integration: ${erxesApiId}`,
    );
    return res.status(403).json({ error: 'Unauthorized access to CDR data' });
  }
  next();
};

async function validateCompanyAccess(subdomain, cdrData) {
  try {
    const models = await generateModels(subdomain);

    const { src_trunk_name, dst_trunk_name } = cdrData;

    // Authorize by trunk ownership — consistent with how receiveCdr and the
    // live call path actually resolve the integration. The x-integration-id
    // sent by call-helper can drift from the integration that currently owns
    // the trunk (trunk reassigned in erxes, endpoint not re-registered), so
    // keying authorization on it rejects otherwise-valid CDRs.
    const orClauses = [
      { srcTrunk: src_trunk_name },
      { dstTrunk: dst_trunk_name },
    ].filter((c) => Object.values(c).some(Boolean));

    if (orClauses.length === 0) {
      return false;
    }

    const integration = await models.CallIntegrations.findOne({
      $or: orClauses,
    });

    return !!integration;
  } catch (error) {
    console.error('Error validating company access:', error);
    return false;
  }
}

const initCallApp = async (app) => {
  console.log('********* INIT CALL ********');
  await redis.del('callCookie');

  app.use(
    express.json({
      limit: '15mb',
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
      const VERSION = getEnv({ name: 'VERSION' });
      if (!VERSION || (VERSION && VERSION === 'saas')) {
        const data = req.body;
        const history = data.history;

        graphqlPubsub.publish(`queueRealtimeUpdate`, {
          queueRealtimeUpdate: history,
        });
        res
          .status(200)
          .json({ message: 'Call dashboard data received successfully' });
      }
    } catch (error) {
      console.error('Error receiving agent call:', error);
      res.status(500).json({ error: 'Internal Server Error' });
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

      await receiveCdr(models, subdomain, data);

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
      const result = await handleCallEvent(models, subdomain, req.body);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error handling call event:', error);
      return res
        .status(500)
        .json({ error: 'Internal Server Error', message: error.message });
    }
  });

  // Live (CTI) call notifications forwarded by call-helper's UCM listener.
  app.post('/call/receiveCall', authenticateApi, async (req, res) => {
    try {
      const subdomain = getSubdomain(req);
      const models = await generateModels(subdomain);
      const result = await handleReceiveCall(models, subdomain, req.body);
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
