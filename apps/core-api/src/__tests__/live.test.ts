import { EventSourceParserStream, type EventSourceMessage } from 'eventsource-parser/stream';
import { afterAll, beforeAll, expect, it, vi } from 'vite-plus/test';
import { z } from 'zod';
import { startEventProcessor } from '~/modules/events/processor';
import { liveHub } from '~/modules/live/hub';
import { describeWithDb, testDatabaseUrl, useTestDatabase } from './db';
import { useTwoOrgs } from './support';

const Hello = z.object({ mode: z.enum(['live', 'polling']) });

const Timeline = z.object({
  targets: z.array(z.object({ targetType: z.string(), targetId: z.string() })),
});

/** The records a `timeline` event says changed. */
const targetsOf = (message: EventSourceMessage) => Timeline.parse(JSON.parse(message.data)).targets;

const of = (events: EventSourceMessage[], type: string) =>
  events.filter((message) => message.event === type);

/** Collects the Server-Sent Events of `GET url` until closed. */
const openStream = async (url: string, headers: Record<string, string>) => {
  const controller = new AbortController();
  const response = await fetch(url, { headers, signal: controller.signal });
  const events: EventSourceMessage[] = [];

  if (!response.body) throw new Error('the stream has no body');

  const reading = response.body
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new EventSourceParserStream())
    .pipeTo(new WritableStream({ write: (message) => void events.push(message) }))
    .catch((error: unknown) => {
      if (!controller.signal.aborted) throw error;
    });

  return {
    status: response.status,
    events,
    /** The first event of this type, waiting up to 8 s for it. */
    next: (type: string, match: (message: EventSourceMessage) => boolean = () => true) =>
      vi.waitFor(
        () => {
          const found = of(events, type).find(match);

          if (!found) throw new Error(`no ${type} event yet`);

          return found;
        },
        { timeout: 8000, interval: 50 },
      ),
    close: async () => {
      controller.abort();
      await reading;
    },
  };
};

describeWithDb('live updates (/core/v1/stream)', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  const stream = async (user = t.ids.owner, org = t.ids.org) =>
    openStream(t.url('/core/v1/stream'), t.headers(await t.token(user, org)));

  beforeAll(async () => {
    // Listen on the throwaway database (Supabase: the session pooler on 5432).
    const url = new URL(testDatabaseUrl());

    if (url.port === '6543') url.port = '5432';

    liveHub.start(url.toString());
    await vi.waitFor(
      () => {
        if (!liveHub.connected) throw new Error('the live hub has not connected');
      },
      { timeout: 10_000, interval: 100 },
    );
  });

  afterAll(() => liveHub.stop());

  it('pushes inbox signals to that member only, and timeline signals within the organisation', async () => {
    const member = await stream(t.ids.member);
    const owner = await stream();
    const other = await stream(t.ids.otherOwner, t.ids.otherOrg);

    expect(member.status).toBe(200);
    expect(Hello.parse(JSON.parse((await member.next('hello')).data))).toEqual({ mode: 'live' });

    await t.hr().notifications.create({
      userIds: [t.ids.member],
      kind: 'hr.leave.requested',
      title: 'Leave',
    });
    await member.next('inbox');

    const customer = await t
      .owner()
      .customers.create({ firstName: 'Live', primaryEmail: 'live@mail.mn' });

    expect(targetsOf(await owner.next('timeline'))).toEqual([
      { targetType: 'customer', targetId: customer.id },
    ]);
    await member.next('timeline');

    // Nothing crosses organisations, and nobody sees another member's inbox.
    expect(of(owner.events, 'inbox')).toEqual([]);
    expect(other.events.filter((message) => message.event !== 'hello')).toEqual([]);

    await Promise.all([member.close(), owner.close(), other.close()]);
  });

  it('wakes the event processor as soon as an event is published', async () => {
    const stop = startEventProcessor();

    const customer = await t
      .owner()
      .customers.create({ firstName: 'Woken', primaryEmail: 'woken@mail.mn' });

    const owner = await stream();

    // Let the startup run finish, so the next one is triggered by the event.
    await new Promise((resolve) => setTimeout(resolve, 1500));
    owner.events.length = 0;

    await t.hr().events.publish({
      events: [
        {
          type: 'hr.contract.signed',
          subject: { type: 'customer', id: customer.id },
          summary: 'Signed',
        },
      ],
    });

    const started = Date.now();

    await owner.next('timeline', (message) =>
      targetsOf(message).some((target) => target.targetId === customer.id),
    );
    // The slow safety poll is 30 s; the event was handled right away.
    expect(Date.now() - started).toBeLessThan(15_000);

    await stop();
    await owner.close();
  });

  it('limits open streams per member', async () => {
    const streams = await Promise.all(Array.from({ length: 10 }, () => stream(t.ids.member)));
    const extra = await stream(t.ids.member);

    expect(streams.map((each) => each.status)).toEqual(Array.from({ length: 10 }, () => 200));
    expect(extra.status).toBe(429);

    await Promise.all([...streams, extra].map((each) => each.close()));
  });
});
