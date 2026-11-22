import {
  automationRuns,
  automationRunSteps,
  automations,
  newId,
  withOrg,
  withSystem,
} from '@erxes/core-db';
import { FINISHED_RUN_STATUSES } from '@erxes/core-db/enums';
import { and, asc, eq, inArray } from 'drizzle-orm';
import express, { type Request, type RequestHandler, type Response, Router } from 'express';
import { z } from 'zod';
import { fail, invalidInput } from '~/http/errors';
import { forwardedHeaders, SANDBOXED_ANSWER } from '~/http/forwarded';
import { safeEqual } from '~/lib/crypto';
import { repeatWhile } from '~/lib/sequence';
import { type LiveSignal, liveHub } from '~/modules/live/hub';
import { Reply } from './actions/reply';
import { HookRequest, hookSignature, noHookSubject, replySteps, startHookRun } from './hooks';
import { definitionOf } from './runs';

const MAX_BYTES = '1mb';

const WAIT_MS = 30_000;

const MAX_CHECKS = 300;

const LEFT = 'the caller left';

const CLOSING = 'the server is shutting down';

const Params = z.object({ id: z.string().min(1).max(64), sig: z.string().min(1).max(128) });

const IdempotencyKey = z.string().trim().min(1).max(200);

const CREDENTIAL = /auth|cookie|token|secret|password|session|api-?key/i;

type Hook = { id: string; orgId: string };

type Progress = { status: string | null; reply: z.infer<typeof Reply> | null };

const noHook = () => fail('NOT_FOUND', 'No such webhook');

const hookOf = async (req: Request): Promise<Hook> => {
  const params = Params.safeParse(req.params);

  if (!params.success || !safeEqual(params.data.sig, hookSignature(params.data.id))) throw noHook();

  const { id } = params.data;

  const [owner] = await withSystem('automation webhook lookup', (tx) =>
    tx
      .select({ orgId: automations.orgId })
      .from(automations)
      .where(eq(automations.id, id))
      .limit(1),
  );

  if (!owner) throw noHook();

  return { id, orgId: owner.orgId };
};

const requestOf = (req: Request) => {
  const headers = Object.entries(forwardedHeaders(req)).filter(([name]) => !CREDENTIAL.test(name));
  const body: unknown = req.body;

  const parsed = HookRequest.safeParse({
    method: req.method,
    query: req.query,
    headers: Object.fromEntries(headers),
    body: body ?? null,
  });

  if (!parsed.success) throw invalidInput(parsed.error);

  return parsed.data;
};

const start = (hook: Hook, request: HookRequest, eventId: string) =>
  withOrg(hook.orgId, async (tx) => {
    const [automation] = await tx
      .select()
      .from(automations)
      .where(eq(automations.id, hook.id))
      .limit(1);

    const definition =
      automation?.status === 'active' && automation.activeVersion
        ? await definitionOf(tx, automation.id, automation.activeVersion)
        : null;

    const trigger = definition?.trigger;

    if (!automation || !definition || trigger?.kind !== 'webhook') throw noHook();

    const outcome = await startHookRun(tx, automation, definition, trigger, { eventId, request });

    return { outcome, replies: replySteps(definition) };
  });

const progressOf = (hook: Hook, runId: string, replies: string[]): Promise<Progress> =>
  withOrg(hook.orgId, async (tx) => {
    const [run] = await tx
      .select({ status: automationRuns.status })
      .from(automationRuns)
      .where(eq(automationRuns.id, runId))
      .limit(1);

    const [step] = await tx
      .select({ output: automationRunSteps.output })
      .from(automationRunSteps)
      .where(
        and(
          eq(automationRunSteps.runId, runId),
          inArray(automationRunSteps.stepId, replies),
          eq(automationRunSteps.status, 'succeeded'),
        ),
      )
      .orderBy(asc(automationRunSteps.finishedAt))
      .limit(1);

    return { status: run?.status ?? null, reply: Reply.safeParse(step?.output).data ?? null };
  });

const isSettled = (progress: Progress) =>
  progress.reply !== null || FINISHED_RUN_STATUSES.some((status) => status === progress.status);

const wake = async (hook: Hook, stop: AbortSignal, ms: number) => {
  const topic = `automations.runs:${hook.id}`;
  const woken = new AbortController();

  const onSignal = (signal: LiveSignal) => {
    if (signal.o !== hook.orgId) return;

    if (signal.k === 'resync' || (signal.k === 'topic' && signal.t === topic)) woken.abort();
  };

  const onResync = () => woken.abort();
  const until = AbortSignal.any([stop, woken.signal, AbortSignal.timeout(ms)]);

  liveHub.on('signal', onSignal);
  liveHub.on('resync', onResync);

  await new Promise<void>((resolve) => {
    if (until.aborted) resolve();
    else until.addEventListener('abort', () => resolve(), { once: true });
  });

  liveHub.off('signal', onSignal);
  liveHub.off('resync', onResync);
};

const awaitReply = async (hook: Hook, runId: string, replies: string[], stop: AbortSignal) => {
  const deadline = Date.now() + WAIT_MS;
  let progress = await progressOf(hook, runId, replies);

  await repeatWhile(MAX_CHECKS, async () => {
    const left = deadline - Date.now();

    if (isSettled(progress) || stop.aborted || left <= 0) return false;

    await wake(hook, stop, Math.min(left, liveHub.connected ? 5000 : 1000));
    progress = await progressOf(hook, runId, replies);

    return true;
  });

  return progress;
};

const sendReply = (res: Response, reply: z.infer<typeof Reply>) => {
  res.status(reply.status);

  if (reply.body === null) res.end();
  else if (typeof reply.body === 'string') res.type('text/plain').send(reply.body);
  else res.json(reply.body);
};

const answerWhenReplied = async (
  req: Request,
  res: Response,
  hook: Hook,
  started: { runId: string; replies: string[] },
) => {
  const { runId } = started;
  const stop = new AbortController();
  const onClose = () => stop.abort(LEFT);
  const onClosing = () => stop.abort(CLOSING);

  res.once('close', onClose);
  liveHub.once('closing', onClosing);

  const progress = await awaitReply(hook, runId, started.replies, stop.signal).finally(() => {
    res.off('close', onClose);
    liveHub.off('closing', onClosing);
  });

  if (stop.signal.reason === LEFT) {
    req.log.info({ automation: hook.id, run: runId }, 'webhook caller left before the reply');

    return;
  }

  if (progress.reply) sendReply(res, progress.reply);
  else if (progress.status === 'failed') res.status(500).json({ ok: false, runId });
  else if (isSettled(progress)) res.json({ ok: true, runId, status: progress.status });
  else res.status(202).json({ ok: true, runId, pending: true });
};

const receive: RequestHandler = async (req, res) => {
  const hook = await hookOf(req);
  const key = IdempotencyKey.safeParse(req.header('idempotency-key'));
  const eventId = `webhook:${key.success ? key.data : newId()}`;
  const { outcome, replies } = await start(hook, requestOf(req), eventId);

  if (outcome.kind === 'no-subject') throw noHookSubject();

  res.set(SANDBOXED_ANSWER);

  if (outcome.kind === 'skipped') {
    res.json({ ok: true, started: false });

    return;
  }

  const runId = outcome.run.id;

  req.log.info({ automation: hook.id, run: runId }, 'webhook started an automation run');

  if (replies.length) await answerWhenReplied(req, res, hook, { runId, replies });
  else res.status(202).json({ ok: true, runId });
};

export const automationHooksRouter = (limits: RequestHandler[]) =>
  Router().all(
    '/automations/hooks/:id/:sig',
    ...limits,
    express.json({ limit: MAX_BYTES, type: ['application/json', 'application/*+json'] }),
    express.urlencoded({ limit: MAX_BYTES, extended: false }),
    express.text({ limit: MAX_BYTES, type: 'text/*' }),
    receive,
  );
