import { type Db, integrationSubscriptions, withOrg, withSystem } from '@erxes/core-db';
import { eq, sql } from 'drizzle-orm';
import express, { type Request, type RequestHandler, Router } from 'express';
import { z } from 'zod';
import { fail } from '~/http/errors';
import { forwardedHeaders, SANDBOXED_ANSWER } from '~/http/forwarded';
import { safeEqual } from '~/lib/crypto';
import { publishCoreEvents } from '~/modules/events/events.service';
import { appEventType } from '@erxes/core-contract';
import type { App } from './apps';
import { type AppEvent, type Delivery, DeliveryRefused } from './define';
import { hookSignature, subscriptionState } from './subscriptions';

const MAX_BYTES = '1mb';

const Params = z.object({ id: z.string().min(1).max(64), sig: z.string().min(1).max(128) });

const noHook = () => fail('NOT_FOUND', 'No such webhook');

const ownerOf = async (req: Request) => {
  const params = Params.safeParse(req.params);

  if (!params.success || !safeEqual(params.data.sig, hookSignature(params.data.id))) throw noHook();

  const { id } = params.data;

  const [owner] = await withSystem('integration webhook lookup', (tx) =>
    tx
      .select({ orgId: integrationSubscriptions.orgId })
      .from(integrationSubscriptions)
      .where(eq(integrationSubscriptions.id, id))
      .limit(1),
  );

  if (!owner) throw noHook();

  return { id, orgId: owner.orgId };
};

const parsedBody = (raw: string, type: string): unknown => {
  if (!raw) return null;

  if (type.includes('json')) return z.json().parse(JSON.parse(raw));

  if (type.includes('x-www-form-urlencoded')) return Object.fromEntries(new URLSearchParams(raw));

  return raw;
};

const deliveryOf = (req: Request): Delivery => {
  const raw = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : '';

  const headers = Object.fromEntries(
    Object.entries(forwardedHeaders(req)).map(([name, value]) => [name.toLowerCase(), value]),
  );

  let body: unknown = raw;

  try {
    body = parsedBody(raw, headers['content-type'] ?? '');
  } catch {
    body = raw;
  }

  return { method: req.method, headers, query: req.query, raw, body };
};

const published = (app: App, subscription: { id: string; triggers: string[] }, event: AppEvent) =>
  app.triggers.flatMap((trigger) =>
    trigger.via === 'hook' &&
    trigger.on === event.type &&
    subscription.triggers.includes(trigger.key) &&
    (trigger.when?.(event.payload) ?? true)
      ? [
          {
            type: appEventType(app.key, trigger.key),
            entityType: 'integration_subscription',
            entityId: subscription.id,
            payload: event.payload,
            dedupeKey: `${subscription.id}:${trigger.key}:${event.id}`,
          },
        ]
      : [],
  );

const deliver = async (tx: Db, id: string, delivery: Delivery) => {
  const state = await subscriptionState(tx, id);

  if (!state?.app.hooks) throw noHook();

  const { app, subscription } = state;

  try {
    const received = state.app.hooks.receive(delivery, state.secret);
    const events = received.events.flatMap((event) => published(app, subscription, event));

    await publishCoreEvents(tx, events);

    if (received.events.length)
      await tx
        .update(integrationSubscriptions)
        .set({ lastDeliveryAt: sql`now()` })
        .where(eq(integrationSubscriptions.id, id));

    return { reply: received.reply ?? null, refused: null, published: events.length };
  } catch (error) {
    if (error instanceof DeliveryRefused)
      return { reply: null, refused: error.message, published: 0 };

    throw error;
  }
};

const receive: RequestHandler = async (req, res) => {
  const owner = await ownerOf(req);
  const outcome = await withOrg(owner.orgId, (tx) => deliver(tx, owner.id, deliveryOf(req)));

  res.set(SANDBOXED_ANSWER);

  if (outcome.refused) {
    req.log.warn({ subscription: owner.id, reason: outcome.refused }, 'app webhook refused');
    res.status(401).json({ ok: false });

    return;
  }

  if (outcome.reply) {
    const { status, body } = outcome.reply;

    if (typeof body === 'string') res.status(status).type('text/plain').send(body);
    else res.status(status).json(body ?? { ok: true });

    return;
  }

  res.json({ ok: true, published: outcome.published });
};

export const appHooksRouter = (limits: RequestHandler[]) =>
  Router().all(
    '/integrations/hooks/:id/:sig',
    ...limits,
    express.raw({ type: () => true, limit: MAX_BYTES }),
    receive,
  );
