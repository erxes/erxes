import { type Db, integrationSubscriptions, withOrg, withSystem } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import express, { type Request, type RequestHandler, Router } from 'express';
import { z } from 'zod';
import { fail } from '~/http/errors';
import { forwardedHeaders, SANDBOXED_ANSWER } from '~/http/forwarded';
import { safeEqual } from '~/lib/crypto';
import { publishCoreEvents } from '~/modules/events/events.service';
import { publishedEvents } from './apps';
import { type Delivery, DeliveryRefused } from './appDefinition';
import { connectionOn, delivered, subscriptionState } from './subscriptionState';
import { hookSignature } from './subscriptionSync';

export const MAX_HOOK_BYTES = '1mb';

const Params = z.object({ id: z.string().min(1).max(64), sig: z.string().min(1).max(128) });

export const noHook = () => fail('NOT_FOUND', 'No such webhook');

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

export const deliveryOf = (req: Request): Delivery => {
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

const deliver = async (tx: Db, id: string, delivery: Delivery) => {
  const state = await subscriptionState(tx, id);
  const hooks = state?.app.hooks;

  if (!state || !hooks || hooks.appWide) throw noHook();

  const { app, subscription } = state;
  const on = await connectionOn(tx, subscription.connectionId);

  try {
    const received = hooks.receive(delivery, state.secret);

    const events = on
      ? received.events.flatMap((event) => publishedEvents(app, subscription, event))
      : [];

    await publishCoreEvents(tx, events);

    if (on && received.events.length) await delivered(tx, id);

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
    express.raw({ type: () => true, limit: MAX_HOOK_BYTES }),
    receive,
  );
