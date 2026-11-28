import express, { type Request, type RequestHandler, Router } from 'express';
import { z } from 'zod';
import { SANDBOXED_ANSWER } from '~/http/forwarded';
import { safeEqual } from '~/lib/crypto';
import { inOrder } from '~/lib/sequence';
import { deliveryOf, MAX_HOOK_BYTES, noHook } from './appHooks.http';
import { appOf } from './apps';
import { appHookSignature, appVerifyToken, routedSubscriptions } from './appWide';
import { deliverToOrg } from './appWideEvents';
import { type AppEvent, DeliveryRefused } from '@erxes/plugin-sdk/integrations';
import { clientByRef } from './oauth';

const Params = z.object({
  app: z.string().min(1).max(64),
  client: z.string().min(1).max(64),
  sig: z.string().min(1).max(128),
});

const hookOf = async (req: Request) => {
  const params = Params.safeParse(req.params);

  if (
    !params.success ||
    !safeEqual(params.data.sig, appHookSignature(params.data.app, params.data.client))
  )
    throw noHook();

  const app = appOf(params.data.app);
  const hooks = app?.hooks;
  const client = app && (await clientByRef(app.key, params.data.client));

  if (!app || !hooks?.appWide || !client) throw noHook();

  return { app, hooks, client };
};

const fanOut = async (
  hook: Awaited<ReturnType<typeof hookOf>>,
  routes: { route: string; events: AppEvent[] }[],
) => {
  const targets = await routedSubscriptions(
    hook.app,
    hook.client,
    routes.map((item) => item.route),
  );

  const orgs = new Set(targets.map((target) => target.orgId));
  let published = 0;

  await inOrder(orgs, async (orgId) => {
    published += await deliverToOrg(
      orgId,
      targets
        .filter((row) => row.orgId === orgId)
        .map((row) => ({
          id: row.id,
          events: routes.flatMap((item) => (item.route === row.routeKey ? item.events : [])),
        })),
    );
  });

  return published;
};

const receive: RequestHandler = async (req, res) => {
  const hook = await hookOf(req);

  res.set(SANDBOXED_ANSWER);

  let received: ReturnType<typeof hook.hooks.receive>;

  try {
    received = hook.hooks.receive(deliveryOf(req), {
      secret: hook.client.clientSecret,
      verifyToken: appVerifyToken(hook.app.key, hook.client.ref),
    });
  } catch (error) {
    if (!(error instanceof DeliveryRefused)) throw error;

    req.log.warn({ app: hook.app.key, reason: error.message }, 'app webhook refused');
    res.status(403).json({ ok: false });

    return;
  }

  if (received.reply) {
    const { status, body } = received.reply;

    if (typeof body === 'string') res.status(status).type('text/plain').send(body);
    else res.status(status).json(body ?? { ok: true });

    return;
  }

  res.json({ ok: true, published: await fanOut(hook, received.routes) });
};

export const appWideHooksRouter = (limits: RequestHandler[]) =>
  Router().all(
    '/integrations/apps/:app/hook/:client/:sig',
    ...limits,
    express.raw({ type: () => true, limit: MAX_HOOK_BYTES }),
    receive,
  );
