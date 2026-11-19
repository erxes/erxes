import { integrationPrograms, withOrg, withSystem } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import express, { type RequestHandler, Router } from 'express';
import { z } from 'zod';
import { fail, notFound } from '~/http/errors';
import { safeEqual } from '~/lib/crypto';
import { incomingJob } from './incoming';
import { incomingSignature } from './programs.service';

const MAX_BYTES = 256 * 1024;

const Params = z.object({ id: z.string(), sig: z.string() });

const firstValues = (values: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(values).flatMap(([key, value]) => {
      const first: unknown = Array.isArray(value) ? value[0] : value;

      return typeof first === 'string' ? [[key, first]] : [];
    }),
  );

const receive: RequestHandler = async (req, res) => {
  const { id, sig } = Params.parse(req.params);

  if (!safeEqual(sig, incomingSignature(id))) throw fail('INVALID_SIGNATURE', 'Invalid signature');

  const [owner] = await withSystem('integration incoming lookup', (tx) =>
    tx
      .select({ orgId: integrationPrograms.orgId })
      .from(integrationPrograms)
      .where(and(eq(integrationPrograms.id, id), eq(integrationPrograms.kind, 'incoming')))
      .limit(1),
  );

  if (!owner) throw notFound('Program');

  const { cookie: _cookie, ...headers } = firstValues(req.headers);

  await withOrg(owner.orgId, (tx) =>
    incomingJob.enqueue(tx, {
      orgId: owner.orgId,
      payload: {
        programId: id,
        method: req.method,
        headers,
        query: firstValues(req.query),
        rawBody: Buffer.isBuffer(req.body) ? req.body.toString('utf8') : '',
      },
    }),
  );

  res.status(200).json({ ok: true });
};

export const integrationIncomingRouter = (limits: RequestHandler[]) =>
  Router().all(
    '/integrations/in/:id/:sig',
    ...limits,
    express.raw({ type: () => true, limit: MAX_BYTES }),
    receive,
  );
