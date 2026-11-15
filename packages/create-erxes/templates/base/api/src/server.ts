import { bearerOf, verifyCoreJob, verifyPluginSession } from '@erxes/plugin-sdk';
import { onError, ORPCError } from '@orpc/server';
import { RPCHandler } from '@orpc/server/node';
import cors from 'cors';
import express from 'express';
import { pinoHttp } from 'pino-http';
import { config, PLUGIN } from '#/config.ts';
import { runJob } from '#/jobs.ts';
import { logger } from '#/logger.ts';
import { router } from '#/router.ts';

const rpc = new RPCHandler(router, {
  interceptors: [
    onError((error) => {
      if (!(error instanceof ORPCError) || error.status >= 500) logger.error(error);
    }),
  ],
});

/** The member behind a request from the plugin UI, or null without a valid session token. */
const memberOf = async (authorization: string | undefined) => {
  const token = bearerOf(authorization);

  if (!token) return null;

  return verifyPluginSession(token, { coreUrl: config.coreUrl, plugin: PLUGIN }).catch(() => null);
};

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');
  app.use(pinoHttp({ logger }));
  // The plugin UI runs inside web and calls this API from web's origin.
  app.use(cors({ origin: config.coreUiOrigin, maxAge: 600 }));

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  // erxes-ui's pluginFetch adds a 5-minute session token core issued for this member and plugin.
  app.use('/api/rpc', async (req, res, next) => {
    const member = await memberOf(req.headers.authorization);

    if (!member) {
      res.status(401).json({ message: 'Open this plugin inside erxes to sign in' });

      return;
    }

    const { matched } = await rpc.handle(req, res, { prefix: '/api/rpc', context: { member } });

    if (!matched) next();
  });

  // Core's jobs (`api/src/jobs.ts`). The token signs the raw body, so it stays text.
  app.post('/api/jobs/:name', express.text({ type: '*/*' }), async (req, res) => {
    const body = typeof req.body === 'string' ? req.body : '';

    const job = await verifyCoreJob(req.headers.authorization, body, {
      coreUrl: config.coreUrl,
      plugin: PLUGIN,
    }).catch(() => null);

    if (!job) {
      res.sendStatus(401);

      return;
    }

    // A throw answers 500 and core retries it.
    await runJob(job);
    res.sendStatus(204);
  });

  if (config.uiDir) app.use('/ui', express.static(config.uiDir));

  return app;
};
