import type { StreamChanged, StreamTopic } from '@erxes/core-contract';
import type { LIVE_MODES } from '@erxes/core-db/enums';
import { caller, requestOrgId, users, withOrg } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { Router, type Request } from 'express';
import { config } from '~/config';
import { sessionClaims } from '~/http/auth';
import { fail } from '~/http/errors';
import { type LiveSignal, liveHub } from './hub';

const HEARTBEAT_MS = 25_000;
const REVALIDATE_MS = 60_000;

/** Signals arriving close together go out as one message. */
const FLUSH_MS = 200;

/** More distinct topics than this in one flush: tell the browser to refetch everything. */
const MAX_TOPICS_PER_FLUSH = 100;

const openStreams = new Map<string, number>();

/** The data of one stream message (`{}` for `resync`). */
type StreamData = Record<string, never> | { mode: (typeof LIVE_MODES)[number] } | StreamChanged;

type Send = (event: string, data?: StreamData) => void;

/** The member the stream is for (an Express route: `ACCESS` doesn't check it). */
const listenerOf = () => {
  const who = caller();

  if (who.type === 'plugin') throw fail('MEMBERS_ONLY', 'Plugins cannot do this');

  if (who.type !== 'user') throw fail('UNAUTHORIZED', 'Sign in to continue');

  return { orgId: requestOrgId(), userId: who.userId };
};

type Listener = ReturnType<typeof listenerOf>;

/** Collects the member's signals and sends them as one message every `FLUSH_MS`. */
const signalBatcher = (actor: Listener, send: Send) => {
  let resync = false;
  const topics = new Set<StreamTopic>();
  let flushTimer: NodeJS.Timeout | null = null;

  const flush = () => {
    flushTimer = null;

    if (resync || topics.size > MAX_TOPICS_PER_FLUSH) send('resync');
    else send('changed', { topics: [...topics] });

    resync = false;
    topics.clear();
  };

  const onSignal = (signal: LiveSignal) => {
    if (signal.o !== actor.orgId || signal.k === 'agent-stop') return;

    if (signal.k === 'resync') resync = true;
    else if (!signal.u || signal.u.includes(actor.userId)) topics.add(signal.t);
    else return;

    flushTimer ??= setTimeout(flush, FLUSH_MS);
  };

  const stop = () => {
    if (flushTimer) clearTimeout(flushTimer);
  };

  return { onSignal, stop };
};

/**
 * Why a stream must end now (a stream outlives requests), or null while it may
 * stay open. `reconnect`: the cookie it opened with has expired, but requests
 * since may have renewed it, so the browser reconnects with the cookie it has
 * now and core checks that one.
 */
const endReason = async (req: Request, actor: Listener) => {
  if (!req.headers.authorization && !(await sessionClaims(req))) return 'reconnect';

  const [user] = await withOrg(actor.orgId, (tx) =>
    tx
      .select({ status: users.status, sessionVersion: users.sessionVersion })
      .from(users)
      .where(eq(users.id, actor.userId))
      .limit(1),
  );

  if (user?.status !== 'active') return 'member-inactive';

  // Password changed, reset, or signed out everywhere.
  if (user.sessionVersion !== req.sessionVersion) return 'session-ended';

  return null;
};

/**
 * `GET /core/v1/stream`: Server-Sent Events for the signed-in member. It
 * carries only "this changed" signals, never data: the browser refetches
 * through the normal API, so every permission check stays where it is.
 *
 * - `hello { mode }`: `live`, or `polling` while the server can't listen;
 * - `changed { topics }`: the `StreamTopic`s that changed (plugins' come from
 *   `core_live_signal` / `POST /plugins/live` as `plugin:<name>:<topic>`);
 * - `resync`: something may have been missed (reconnects, big bursts): refetch;
 * - `bye`: the session ended (signed out everywhere, member disabled); don't reconnect.
 *
 * When the cookie the stream opened with expires, the stream just closes: the
 * browser reconnects with the cookie it has now, renewed if the member is active.
 */
export const streamRouter = Router();

streamRouter.get('/stream', (req, res) => {
  const actor = listenerOf();
  const key = `${actor.orgId}:${actor.userId}`;
  const open = openStreams.get(key) ?? 0;

  if (open >= config.live.maxStreamsPerUser)
    throw fail('TOO_MANY_STREAMS', 'Too many open streams');

  openStreams.set(key, open + 1);
  req.socket.setTimeout(0);
  req.socket.setNoDelay(true);
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    // nginx and similar proxies must not buffer the stream.
    'X-Accel-Buffering': 'no',
  });

  const send: Send = (event, data = {}) =>
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  const batcher = signalBatcher(actor, send);
  const onState = (connected: boolean) => send('hello', { mode: connected ? 'live' : 'polling' });
  const onResync = () => send('resync');

  // Reconnect after 3 s if the stream drops.
  res.write('retry: 3000\n\n');
  send('hello', { mode: liveHub.connected ? 'live' : 'polling' });

  // The server is shutting down: end the stream; the browser reconnects (to another server).
  const onClosing = () => res.end();

  liveHub.on('closing', onClosing);
  liveHub.on('signal', batcher.onSignal);
  liveHub.on('state', onState);
  liveHub.on('resync', onResync);

  // Comments keep proxies and load balancers from closing an idle stream.
  const heartbeat = setInterval(() => res.write(': ping\n\n'), HEARTBEAT_MS);

  const revalidate = setInterval(() => {
    endReason(req, actor).then(
      (reason) =>
        reason === 'reconnect'
          ? res.end()
          : reason && res.end(`event: bye\ndata: ${JSON.stringify({ reason })}\n\n`),
      (error: unknown) =>
        req.log.warn({ err: error }, 'live stream: could not re-check the member'),
    );
  }, REVALIDATE_MS);

  req.on('close', () => {
    clearInterval(heartbeat);
    clearInterval(revalidate);
    batcher.stop();
    liveHub.off('closing', onClosing);
    liveHub.off('signal', batcher.onSignal);
    liveHub.off('state', onState);
    liveHub.off('resync', onResync);

    const left = (openStreams.get(key) ?? 1) - 1;

    if (left > 0) openStreams.set(key, left);
    else openStreams.delete(key);
  });
});
