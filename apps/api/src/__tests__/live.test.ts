import { assistantThreads, newId } from '@erxes/core-db';
import { LIVE_MODES } from '@erxes/core-db/enums';
import { EventSourceParserStream, type EventSourceMessage } from 'eventsource-parser/stream';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vite-plus/test';
import { z } from 'zod';
import { signAccessToken } from '~/http/session';
import { startWorkers, stopWorkers } from '~/modules/jobs/jobs';
import { liveHub } from '~/modules/live/hub';
import { audienceOf } from './broadcasts.fixture';
import { adminDb, testDatabaseUrl, useTestDatabase } from './db';
import { settle } from './settle';
import { useTwoOrgs } from './support';

const Hello = z.object({ mode: z.enum(LIVE_MODES) });

const Changed = z.object({ topics: z.array(z.string()) });

const topicsOf = (message: EventSourceMessage) => Changed.parse(JSON.parse(message.data)).topics;

const heard = (events: EventSourceMessage[]) =>
  events.filter((message) => message.event === 'changed').flatMap(topicsOf);

/** Two minutes on the clock, and the stream's once-a-minute check runs. */
const aMinuteLater = () => {
  vi.setSystemTime(Date.now() + 2 * 60_000);

  return vi.advanceTimersByTimeAsync(60_000);
};

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
    /** Settles when the server ends the stream. */
    ended: reading,
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
    hears: (topic: string) =>
      vi.waitFor(
        () => {
          if (!heard(events).includes(topic)) throw new Error(`${topic} has not changed yet`);
        },
        { timeout: 8000, interval: 50 },
      ),
    close: async () => {
      controller.abort();
      await reading;
    },
  };
};

describe('live updates (/core/v1/stream)', () => {
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
    await member.hears('inbox');

    const customer = await t
      .owner()
      .customers.create({ firstName: 'Live', primaryEmail: 'live@mail.mn' });

    await owner.hears(`timeline:customer:${customer.id}`);
    await member.hears(`timeline:customer:${customer.id}`);

    // Nothing crosses organisations, and nobody sees another member's inbox.
    expect(heard(owner.events)).not.toContain('inbox');
    expect(other.events.filter((message) => message.event !== 'hello')).toEqual([]);

    await Promise.all([member.close(), owner.close(), other.close()]);
  });

  it('tells only the owner when one of their assistant conversations changes', async () => {
    const owner = await stream();
    const member = await stream(t.ids.member);

    await Promise.all([owner.next('hello'), member.next('hello')]);

    const id = newId();

    await adminDb().insert(assistantThreads).values({ id, orgId: t.ids.org, userId: t.ids.owner });
    await t.owner().assistant.updateThread({ id, title: 'Renamed' });

    await owner.hears('assistant');

    expect(heard(member.events)).not.toContain('assistant');

    await Promise.all([owner.close(), member.close()]);
  });

  it(
    'tells the organisation, and only it, when what its automations, webhooks, broadcasts and plugins show changes',
    { timeout: 120_000 },
    async () => {
      const owner = await stream();
      const other = await stream(t.ids.otherOwner, t.ids.otherOrg);

      await Promise.all([owner.next('hello'), other.next('hello')]);

      await t.client(await t.pluginToken()).plugins.registerManifest({
        title: 'HR',
        version: '3.0.0',
        scopes: ['notifications:write', 'events:write', 'live:write', 'audit:write'],
        events: [{ type: 'hr.chat.received', label: 'Chat received' }],
      });
      await t
        .hr()
        .events.publish({ events: [{ type: 'hr.chat.received', payload: { text: 'Hi' } }] });
      await settle();
      await owner.hears('automations.catalog');

      await t.hr().plugins.signal({ topics: ['leave.requests'] });
      await owner.hears('plugin:hr:leave.requests');

      // A topic names a record by its id, and ids are mixed case.
      await t.hr().plugins.signal({ topics: ['leave:wKbpQmWs3Aj7WXjc2'] });
      await owner.hears('plugin:hr:leave:wKbpQmWs3Aj7WXjc2');

      const { id: automationId } = await t.owner().automations.create({
        name: 'Note',
        definition: {
          trigger: { kind: 'event', event: 'core.customer.created' },
          steps: [{ id: 'note', type: 'action', action: 'core.note.add', input: { body: 'hi' } }],
        },
      });

      await t.owner().automations.activate({ id: automationId });

      const { webhook } = await t
        .owner()
        .webhooks.create({ url: 'http://127.0.0.1:9/hook', eventTypes: ['core.customer.*'] });

      await t
        .owner()
        .customers.create({ firstName: 'Topic', primaryEmail: 'topic@mail.mn', code: 'tp-1' });
      await settle();
      await owner.hears(`automations.runs:${automationId}`);
      await owner.hears(`webhooks.deliveries:${webhook.id}`);

      const broadcast = await t.owner().broadcasts.create({
        name: 'tp',
        channel: 'email',
        filter: audienceOf('tp'),
        subject: 'Hi',
        body: 'Hi',
      });

      await t.owner().broadcasts.send({ id: broadcast.id });
      await settle();
      await owner.hears(`broadcasts:${broadcast.id}`);

      expect(heard(other.events)).toEqual([]);

      await Promise.all([owner.close(), other.close()]);
    },
  );

  it('wakes the event consumers as soon as an event is published', async () => {
    const customer = await t
      .owner()
      .customers.create({ firstName: 'Woken', primaryEmail: 'woken@mail.mn' });

    await settle();
    await startWorkers();

    const owner = await stream();

    // Let the workers' first fetch go by, so the next one is woken by the event.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    owner.events.length = 0;

    await t.hr().events.publish({
      events: [
        {
          type: 'hr.contract.signed',
          subjectType: 'customer',
          subjectId: customer.id,
          summary: 'Signed',
        },
      ],
    });

    const started = Date.now();

    await owner.hears(`timeline:customer:${customer.id}`);
    // The workers' safety poll is 5 s away; NOTIFY woke them right away.
    expect(Date.now() - started).toBeLessThan(2500);

    await stopWorkers();
    await owner.close();
  });

  describe('when the session changes under an open stream', () => {
    // The stream re-checks its member every minute: these tests move that minute along.
    beforeEach(() => vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] }));
    afterEach(() => vi.useRealTimers());

    it('closes without a goodbye when the cookie it opened with expires, so the browser reconnects', async () => {
      const token = await signAccessToken(t.ids.member, t.ids.org, { ttlSeconds: 60 });

      const open = await openStream(t.url('/core/v1/stream'), {
        cookie: `erxes_session=${token}`,
      });

      await open.next('hello');
      await aMinuteLater();
      await open.ended;

      expect(of(open.events, 'bye')).toEqual([]);
    });

    it('says goodbye when the member signs out everywhere', async () => {
      const open = await stream(t.ids.member);

      await open.next('hello');
      await t.member().auth.signOutEverywhere();
      await aMinuteLater();

      expect(JSON.parse((await open.next('bye')).data)).toEqual({ reason: 'session-ended' });
      await open.close();
    });
  });

  it('limits open streams per member', async () => {
    const streams = await Promise.all(Array.from({ length: 10 }, () => stream(t.ids.member)));
    const extra = await stream(t.ids.member);

    expect(streams.map((each) => each.status)).toEqual(Array.from({ length: 10 }, () => 200));
    expect(extra.status).toBe(429);

    await Promise.all([...streams, extra].map((each) => each.close()));
  });
});
