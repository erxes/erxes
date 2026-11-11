import { LiveTimeline } from '@erxes/core-contract';
import { db, newId, users } from '@erxes/core-db';
import { afterAll, beforeAll, expect, it } from 'vite-plus/test';
import { signAccessToken } from '~/http/auth';
import { startEventProcessor } from '~/modules/events/processor';
import { liveHub } from '~/modules/live/hub';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { describeWithDb, HR_SECRET, useTestDatabase, useTestServer } from './support';

interface StreamEvent {
  event: string;
  data: unknown;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const timelineOf = (entry: StreamEvent) =>
  entry.event === 'timeline' ? LiveTimeline.safeParse(entry.data).data : undefined;

describeWithDb('live updates (/core/v1/stream)', () => {
  const database = useTestDatabase();
  const server = useTestServer();

  /** Reads Server-Sent Events from the stream; `waitFor` polls what arrived. */
  const openStream = async (token: string) => {
    const controller = new AbortController();

    const response = await fetch(server.url('/core/v1/stream'), {
      headers: server.headers(token),
      signal: controller.signal,
    });

    const events: StreamEvent[] = [];

    const pump = async (body: ReadableStream<Uint8Array>) => {
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        for await (const chunk of body) {
          buffer += decoder.decode(chunk, { stream: true });

          let end = buffer.indexOf('\n\n');

          while (end >= 0) {
            const block = buffer.slice(0, end);
            const event = /^event: (.+)$/m.exec(block)?.[1];
            const data = /^data: (.+)$/m.exec(block)?.[1];
            const parsed: unknown = data ? JSON.parse(data) : null;

            if (event) events.push({ event, data: parsed });

            buffer = buffer.slice(end + 2);
            end = buffer.indexOf('\n\n');
          }
        }
      } catch {
        // Aborted by close().
      }
    };

    const pumping = response.body ? pump(response.body) : Promise.resolve();

    const waitFor = async (match: (entry: StreamEvent) => boolean, ms = 8000) => {
      const started = Date.now();

      while (Date.now() - started < ms) {
        const found = events.find(match);

        if (found) return found;

        await sleep(50);
      }

      return null;
    };

    return {
      status: response.status,
      events,
      waitFor,
      close: async () => {
        controller.abort();
        await pumping;
      },
    };
  };

  let orgId = '';
  let memberId = '';
  let ownerToken = '';
  let memberToken = '';
  let otherToken = '';

  beforeAll(async () => {
    const acme = await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: { email: 'owner@acme.mn' },
    });

    const globex = await createOrganization({
      subdomain: 'globex',
      name: 'Globex',
      owner: { email: 'owner@globex.mn' },
    });

    orgId = acme.organization.id;
    memberId = newId();
    await db()
      .insert(users)
      .values({ id: memberId, orgId, email: 'member@acme.mn', role: 'member', status: 'active' });
    ownerToken = signAccessToken(acme.owner.id, orgId);
    memberToken = signAccessToken(memberId, orgId);
    otherToken = signAccessToken(globex.owner.id, globex.organization.id);

    // Listen on the throwaway database (Supabase: the session pooler on 5432).
    const url = new URL(database.url());

    if (url.port === '6543') url.port = '5432';

    liveHub.start(url.toString());

    for (let wait = 0; wait < 100 && !liveHub.connected; wait += 1) await sleep(100);
  });

  afterAll(() => liveHub.stop());

  it('pushes inbox signals to that member only, and timeline signals within the organisation', async () => {
    expect(liveHub.connected).toBe(true);

    const member = await openStream(memberToken);
    const owner = await openStream(ownerToken);
    const other = await openStream(otherToken);

    expect(member.status).toBe(200);
    expect(await member.waitFor((entry) => entry.event === 'hello')).toMatchObject({
      data: { mode: 'live' },
    });

    await server
      .client({ plugin: HR_SECRET, org: orgId })
      .notifications.create({ userIds: [memberId], kind: 'hr.leave.requested', title: 'Leave' });

    expect(await member.waitFor((entry) => entry.event === 'inbox')).not.toBeNull();

    const customer = await server
      .client(ownerToken)
      .customers.create({ firstName: 'Live', primaryEmail: 'live@mail.mn' });

    const timeline = await owner.waitFor((entry) => entry.event === 'timeline');

    expect(timeline?.data).toEqual({
      targets: [{ targetType: 'customer', targetId: customer.id }],
    });
    expect(await member.waitFor((entry) => entry.event === 'timeline')).not.toBeNull();

    // Nothing crosses organisations, and nobody sees another member's inbox.
    expect(owner.events.some((entry) => entry.event === 'inbox')).toBe(false);
    expect(other.events.filter((entry) => entry.event !== 'hello')).toEqual([]);

    await Promise.all([member.close(), owner.close(), other.close()]);
  });

  it('wakes the event processor as soon as an event is published', async () => {
    const stop = startEventProcessor();

    const customer = await server
      .client(ownerToken)
      .customers.create({ firstName: 'Woken', primaryEmail: 'woken@mail.mn' });

    const owner = await openStream(ownerToken);

    // Let the startup run finish, so the next one is triggered by the event.
    await sleep(1500);
    owner.events.length = 0;

    await server.client({ plugin: HR_SECRET, org: orgId }).events.publish({
      events: [
        {
          type: 'hr.contract.signed',
          subject: { type: 'customer', id: customer.id },
          summary: 'Signed',
        },
      ],
    });

    const started = Date.now();

    const signal = await owner.waitFor(
      (entry) =>
        timelineOf(entry)?.targets.some((target) => target.targetId === customer.id) ?? false,
    );

    expect(signal).not.toBeNull();
    // The slow safety poll is 30 s; the event was handled right away.
    expect(Date.now() - started).toBeLessThan(15_000);

    await stop();
    await owner.close();
  });

  it('limits open streams per member', async () => {
    const streams = await Promise.all(Array.from({ length: 10 }, () => openStream(memberToken)));
    const extra = await openStream(memberToken);

    expect(streams.every((stream) => stream.status === 200)).toBe(true);
    expect(extra.status).toBe(429);

    await Promise.all([...streams, extra].map((stream) => stream.close()));
  });
});
