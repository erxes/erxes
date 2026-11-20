import { type MetaKind } from '@erxes/core-contract';
import { type Db, metaApps, metaConnections, withOrg, withSystem } from '@erxes/core-db';
import { and, desc, eq, inArray } from 'drizzle-orm';
import express, { type Request, type RequestHandler, Router } from 'express';
import { z } from 'zod';
import { config } from '~/config';
import { fail } from '~/http/errors';
import { hmacSha256, safeEqual } from '~/lib/crypto';
import { unseal } from '~/lib/secrets';
import { inOrder } from '~/lib/sequence';
import { parseBody } from '~/modules/automations/actions/context';
import type { MetaAppSource } from './app.service';
import { connectPages, readState, settingsLink } from './login';
import { inboundJob } from './inbound';
import { eventsOfEntry, kindOfObject, MetaDelivery } from './parse';

const MAX_BYTES = 2 * 1024 * 1024;

type Source = MetaAppSource;

interface Door {
  source: Source;
  orgId: string | null;
  appSecret: string;
  verifyToken: string | undefined;
}

const Params = z.object({ appRowId: z.string().max(40).optional() });

const ownDoor = async (appRowId: string): Promise<Door | null> => {
  const [row] = await withSystem('meta webhook app', (tx) =>
    tx
      .select({
        orgId: metaApps.orgId,
        secretSealed: metaApps.secretSealed,
        verifyToken: metaApps.verifyToken,
      })
      .from(metaApps)
      .where(eq(metaApps.id, appRowId))
      .limit(1),
  );

  return row
    ? {
        source: 'own',
        orgId: row.orgId,
        appSecret: unseal(row.secretSealed),
        verifyToken: row.verifyToken,
      }
    : null;
};

const doorOf = async (req: Request) => {
  const { appRowId } = Params.parse(req.params);

  if (appRowId) return ownDoor(appRowId);

  const app = config.meta.app;

  return app
    ? {
        source: 'install' as const,
        orgId: null,
        appSecret: app.appSecret,
        verifyToken: config.meta.verifyToken,
      }
    : null;
};

const Verify = z.object({
  'hub.mode': z.literal('subscribe'),
  'hub.verify_token': z.string(),
  'hub.challenge': z.string().max(200),
});

const verify: RequestHandler = async (req, res) => {
  const door = await doorOf(req);
  const query = Verify.safeParse(req.query);

  if (
    !door?.verifyToken ||
    !query.success ||
    !safeEqual(query.data['hub.verify_token'], door.verifyToken)
  )
    throw fail('INVALID_SIGNATURE', 'Unknown verify token');

  res.type('text/plain').send(query.data['hub.challenge']);
};

const signedBy = (secret: string, raw: string, signature: string | undefined) =>
  typeof signature === 'string' && safeEqual(`sha256=${hmacSha256(secret, raw, 'hex')}`, signature);

interface Route {
  orgId: string;
  connectionId: string;
  externalId: string;
}

const routesOf = async (door: Door, kind: MetaKind, ids: string[]) => {
  const query = (tx: Db) =>
    tx
      .select({
        orgId: metaConnections.orgId,
        connectionId: metaConnections.id,
        externalId: metaConnections.externalId,
      })
      .from(metaConnections)
      .where(
        and(
          eq(metaConnections.kind, kind),
          inArray(metaConnections.externalId, ids),
          eq(metaConnections.app, door.source),
        ),
      )
      .orderBy(desc(metaConnections.connectedAt));

  const rows = await (door.orgId
    ? withOrg(door.orgId, query)
    : withSystem('meta webhook routing', query));

  const latest = new Map<string, Route>();

  for (const row of rows) if (!latest.has(row.externalId)) latest.set(row.externalId, row);

  return latest;
};

const receive: RequestHandler = async (req, res) => {
  const door = await doorOf(req);
  const raw = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : '';

  if (!door || !signedBy(door.appSecret, raw, req.get('x-hub-signature-256')))
    throw fail('INVALID_SIGNATURE', 'The delivery is not signed by the Meta app');

  const delivery = MetaDelivery.safeParse(parseBody(raw));

  if (!delivery.success) {
    req.log.warn({ issues: delivery.error.issues }, 'Meta delivery left out');
    res.sendStatus(200);

    return;
  }

  const kind = kindOfObject(delivery.data.object);
  const entries = delivery.data.entry;
  const routes = await routesOf(door, kind, [...new Set(entries.map((entry) => entry.id))]);
  const receivedAt = new Date().toISOString();

  await inOrder(entries, async (entry) => {
    const route = routes.get(entry.id);
    const events = eventsOfEntry(entry);

    if (!route || !events.length) return;

    await withOrg(route.orgId, (tx) =>
      inboundJob.enqueue(tx, {
        orgId: route.orgId,
        payload: { connectionId: route.connectionId, receivedAt, events },
      }),
    );
  });

  res.sendStatus(200);
};

const Callback = z.object({ code: z.string().max(2000), state: z.string().max(4000) });

const Refused = z.object({ state: z.string().max(4000), error_description: z.string().optional() });

const callback: RequestHandler = async (req, res) => {
  const params = Callback.safeParse(req.query);

  if (!params.success) {
    const refused = Refused.safeParse(req.query);

    if (!refused.success) throw fail('INVALID_SIGNATURE', 'Meta did not finish the login');

    const state = await readState(refused.data.state);

    res.redirect(
      await settingsLink(state.org, {
        error: refused.data.error_description ?? 'Meta did not finish the login',
      }),
    );

    return;
  }

  const state = await readState(params.data.state);

  const outcome = await connectPages(params.data.code, state).then(
    (connected) => ({ connected: String(connected) }),
    (error: unknown) => {
      req.log.warn({ err: error }, 'Meta login failed');

      return { error: error instanceof Error ? error.message : 'The login failed' };
    },
  );

  res.redirect(await settingsLink(state.org, outcome));
};

export const metaHttpRouter = (limits: RequestHandler[]) =>
  Router()
    .get('/meta/callback', ...limits, callback)
    .get(['/meta/webhook', '/meta/webhook/:appRowId'], ...limits, verify)
    .post(
      ['/meta/webhook', '/meta/webhook/:appRowId'],
      ...limits,
      express.raw({ type: () => true, limit: MAX_BYTES }),
      receive,
    );
