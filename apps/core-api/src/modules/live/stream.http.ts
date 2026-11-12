import { users, withOrg } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import { Router, type Request, type Response } from 'express';
import { config } from '~/config';
import { actorOf, sessionClaims } from '~/http/auth';
import { type LiveSignal, liveHub } from './hub';

const HEARTBEAT_MS = 25_000;
const REVALIDATE_MS = 60_000;

/** Signals arriving close together go out as one message. */
const FLUSH_MS = 200;

/** More distinct timelines than this in one flush: tell the browser to refetch everything. */
const MAX_TIMELINES_PER_FLUSH = 50;

const openStreams = new Map<string, number>();

/**
 * `GET /core/v1/stream`: Server-Sent Events for the signed-in member. It
 * carries only "this changed" signals — `inbox` (their notifications),
 * `timeline` (a customer's or company's) and `plugin { plugin, topics }`
 * (from `core_live_signal` / `POST /plugins/live`) — never data: the browser refetches
 * through the normal API, so every permission check stays where it is.
 *
 * - `hello { mode }`: `live`, or `polling` while the server can't listen;
 * - `resync`: something may have been missed (reconnects, big bursts): refetch;
 * - `bye`: the session ended (expired, member disabled); don't reconnect.
 */
export const streamRouter = Router();

streamRouter.get('/stream', (req: Request, res: Response) => {
  const actor = actorOf(req);
  const key = `${actor.orgId}:${actor.userId}`;
  const open = openStreams.get(key) ?? 0;

  if (open >= config.live.maxStreamsPerUser) {
    res.status(429).json({
      defined: false,
      code: 'TOO_MANY_STREAMS',
      status: 429,
      message: 'Too many open streams',
    });

    return;
  }

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

  const send = (event: string, data: unknown = {}) =>
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

  let inbox = false;
  let resync = false;
  const pluginTopics = new Map<string, Set<string>>();
  const timelines = new Map<string, { targetType: string; targetId: string }>();
  let flushTimer: NodeJS.Timeout | null = null;

  const flush = () => {
    flushTimer = null;

    if (resync || timelines.size > MAX_TIMELINES_PER_FLUSH) {
      send('resync');
    } else {
      if (inbox) send('inbox');

      if (timelines.size) send('timeline', { targets: [...timelines.values()] });
    }

    // Plugin UIs keep their own caches: their topics go out even on resync.
    for (const [plugin, topics] of pluginTopics) send('plugin', { plugin, topics: [...topics] });

    inbox = false;
    resync = false;
    pluginTopics.clear();
    timelines.clear();
  };

  const onSignal = (signal: LiveSignal) => {
    if (signal.o !== actor.orgId) return;

    if (signal.k === 'resync') {
      resync = true;
    } else if (signal.k === 'plugin') {
      if (signal.u && !signal.u.includes(actor.userId)) return;

      const topics = pluginTopics.get(signal.p) ?? new Set<string>();

      topics.add(signal.t);
      pluginTopics.set(signal.p, topics);
    } else if (signal.k === 'inbox') {
      if (signal.u !== actor.userId) return;

      inbox = true;
    } else {
      timelines.set(`${signal.t}:${signal.i}`, { targetType: signal.t, targetId: signal.i });
    }

    flushTimer ??= setTimeout(flush, FLUSH_MS);
  };

  const onState = (connected: boolean) => send('hello', { mode: connected ? 'live' : 'polling' });
  const onResync = () => send('resync');

  // Reconnect after 3 s if the stream drops.
  res.write('retry: 3000\n\n');
  send('hello', { mode: liveHub.connected ? 'live' : 'polling' });

  // The server is shutting down: end the stream; the browser reconnects (to another server).
  const onClosing = () => res.end();

  liveHub.on('closing', onClosing);
  liveHub.on('signal', onSignal);
  liveHub.on('state', onState);
  liveHub.on('resync', onResync);

  // Comments keep proxies and load balancers from closing an idle stream.
  const heartbeat = setInterval(() => res.write(': ping\n\n'), HEARTBEAT_MS);

  // A stream outlives requests: re-check the session and the member.
  const revalidate = setInterval(() => {
    // A cookie session can expire while the stream is open.
    if (!req.headers.authorization && !sessionClaims(req)) {
      send('bye', { reason: 'session-expired' });
      res.end();

      return;
    }

    withOrg(actor.orgId, (tx) =>
      tx
        .select({ status: users.status, sessionVersion: users.sessionVersion })
        .from(users)
        .where(and(eq(users.id, actor.userId), eq(users.orgId, actor.orgId)))
        .limit(1),
    )
      .then(([user]) => {
        if (user?.status !== 'active') {
          send('bye', { reason: 'member-inactive' });
          res.end();
        } else if (user.sessionVersion !== req.sessionVersion) {
          // Password changed, reset, or signed out everywhere.
          send('bye', { reason: 'session-ended' });
          res.end();
        }
      })
      .catch(() => undefined);
  }, REVALIDATE_MS);

  req.on('close', () => {
    clearInterval(heartbeat);
    clearInterval(revalidate);

    if (flushTimer) clearTimeout(flushTimer);
    liveHub.off('closing', onClosing);
    liveHub.off('signal', onSignal);
    liveHub.off('state', onState);
    liveHub.off('resync', onResync);

    const left = (openStreams.get(key) ?? 1) - 1;

    if (left > 0) openStreams.set(key, left);
    else openStreams.delete(key);
  });
});
