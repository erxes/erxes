import type { Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, expect, it } from 'vitest';
import { createApp } from '~/app';
import { signAccessToken } from '~/http/auth';
import { liveHub } from '~/modules/live/hub';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { adminDb, describeWithDb, testDatabaseUrl, useTestDatabase } from './db';
import { pluginToken } from './plugin';


/** Reads Server-Sent Events from a stream until `until` matches or time runs out. */
const openStream = async (url: string, token: string) => {
  const controller = new AbortController();
  const response = await fetch(url, { headers: { authorization: `Bearer ${token}` }, signal: controller.signal });
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  const events: { event: string; data: unknown }[] = [];
  let buffer = '';

  const pump = (async () => {
    try {
      for (;;) {
        const { value, done } = await reader.read();

        if (done) return;

        buffer += decoder.decode(value, { stream: true });

        let end: number;

        while ((end = buffer.indexOf('\n\n')) >= 0) {
          const block = buffer.slice(0, end);

          buffer = buffer.slice(end + 2);

          const event = /^event: (.+)$/m.exec(block)?.[1];
          const data = /^data: (.+)$/m.exec(block)?.[1];

          if (event) events.push({ event, data: data ? JSON.parse(data) : null });
        }
      }
    } catch {
      // aborted
    }
  })();

  const waitFor = async (match: (entry: { event: string; data: unknown }) => boolean, ms = 8000) => {
    const started = Date.now();

    while (Date.now() - started < ms) {
      const found = events.find(match);

      if (found) return found;

      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    return null;
  };

  return {
    status: response.status,
    events,
    waitFor,
    close: async () => {
      controller.abort();
      await pump;
    },
  };
};

describeWithDb('live updates (/core/v1/stream)', () => {
  useTestDatabase();

  let server: Server;
  let base = '';
  let orgId = '';
  let ownerToken = '';
  let memberToken = '';
  let memberId = '';
  let otherToken = '';

  beforeAll(async () => {
    const { db, users, newId } = await import('@erxes/core-db');
    const acme = await createOrganization({ subdomain: 'acme', name: 'Acme', owner: { email: 'owner@acme.mn' } });
    const globex = await createOrganization({ subdomain: 'globex', name: 'Globex', owner: { email: 'owner@globex.mn' } });

    orgId = acme.organization.id;
    memberId = newId();
    await adminDb().insert(users).values({ id: memberId, orgId, email: 'member@acme.mn', role: 'member', status: 'active' });
    ownerToken = signAccessToken(acme.owner.id, orgId);
    memberToken = signAccessToken(memberId, orgId);
    otherToken = signAccessToken(globex.owner.id, globex.organization.id);

    // Listen on the throwaway database (Supabase: the session pooler on 5432).
    const url = new URL(testDatabaseUrl());

    if (url.port === '6543') url.port = '5432';

    liveHub.start(url.toString());

    for (let wait = 0; wait < 100 && !liveHub.connected; wait += 1) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    server = createApp().listen(0);
    base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    await liveHub.stop();
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('pushes inbox signals to that member only, and timeline signals within the organisation', async () => {
    expect(liveHub.connected).toBe(true);

    const member = await openStream(`${base}/core/v1/stream`, memberToken);
    const owner = await openStream(`${base}/core/v1/stream`, ownerToken);
    const other = await openStream(`${base}/core/v1/stream`, otherToken);

    expect(member.status).toBe(200);
    expect(await member.waitFor((entry) => entry.event === 'hello')).toMatchObject({ data: { mode: 'live' } });

    const sent = await fetch(`${base}/core/v1/notifications`, {
      method: 'POST',
      headers: { authorization: `Bearer ${await pluginToken(base, orgId)}`, 'content-type': 'application/json' },
      body: JSON.stringify({ userIds: [memberId], kind: 'hr.leave.requested', title: 'Leave' }),
    });

    expect(sent.status).toBe(201);
    expect(await member.waitFor((entry) => entry.event === 'inbox')).not.toBeNull();

    const customer = await fetch(`${base}/core/v1/customers`, {
      method: 'POST',
      headers: { authorization: `Bearer ${ownerToken}`, 'content-type': 'application/json' },
      body: JSON.stringify({ firstName: 'Live', primaryEmail: 'live@mail.mn' }),
    }).then((response) => response.json() as Promise<{ id: string }>);

    const timeline = await owner.waitFor((entry) => entry.event === 'timeline');

    expect(timeline?.data).toEqual({ targets: [{ targetType: 'customer', targetId: customer.id }] });
    expect(await member.waitFor((entry) => entry.event === 'timeline')).not.toBeNull();

    // Nothing crosses organisations, and nobody sees another member's inbox.
    expect(owner.events.some((entry) => entry.event === 'inbox')).toBe(false);
    expect(other.events.filter((entry) => entry.event !== 'hello')).toEqual([]);

    await Promise.all([member.close(), owner.close(), other.close()]);
  });

  it('wakes the event processor as soon as an event is published', async () => {
    const { startEventProcessor } = await import('~/modules/events/processor');
    const stop = startEventProcessor();
    const customer = await fetch(`${base}/core/v1/customers`, {
      method: 'POST',
      headers: { authorization: `Bearer ${ownerToken}`, 'content-type': 'application/json' },
      body: JSON.stringify({ firstName: 'Woken', primaryEmail: 'woken@mail.mn' }),
    }).then((response) => response.json() as Promise<{ id: string }>);
    const owner = await openStream(`${base}/core/v1/stream`, ownerToken);

    // Let the startup run finish, so the next one is triggered by the event.
    await new Promise((resolve) => setTimeout(resolve, 1500));
    owner.events.length = 0;

    await fetch(`${base}/core/v1/events`, {
      method: 'POST',
      headers: { authorization: `Bearer ${await pluginToken(base, orgId)}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        events: [{ type: 'hr.contract.signed', subject: { type: 'customer', id: customer.id }, summary: 'Signed' }],
      }),
    });

    const started = Date.now();
    const signal = await owner.waitFor(
      (entry) =>
        entry.event === 'timeline' &&
        (entry.data as { targets: { targetId: string }[] }).targets.some((target) => target.targetId === customer.id),
    );

    expect(signal).not.toBeNull();
    // The slow safety poll is 30 s; the event was handled right away.
    expect(Date.now() - started).toBeLessThan(15_000);

    await stop();
    await owner.close();
  });

  it('limits open streams per member', async () => {
    const streams = await Promise.all(Array.from({ length: 10 }, () => openStream(`${base}/core/v1/stream`, memberToken)));
    const extra = await openStream(`${base}/core/v1/stream`, memberToken);

    expect(streams.every((stream) => stream.status === 200)).toBe(true);
    expect(extra.status).toBe(429);

    await Promise.all([...streams, extra].map((stream) => stream.close()));
  });
});
