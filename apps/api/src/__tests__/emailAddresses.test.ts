import { newId, suppressions, withOrg } from '@erxes/core-db';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { config } from '~/config';
import { generateKeyPairSync, sign } from '~/lib/crypto';
import { laneOf } from '~/modules/email/addresses';
import { loggedEmails } from '~/modules/email/email';
import { useAutomations } from './automations.fixture';
import { audienceOf, emailsTo, say } from './broadcasts.fixture';
import { adminDb, useTestDatabase } from './db';
import { settle } from './settle';

/** SendGrid's signing key, as its Signed Event Webhook has one. */
const sendgrid = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });

const DAY = 86_400;

describe('email addresses: standing and suppression', { timeout: 240_000 }, () => {
  useTestDatabase();

  const t = useAutomations();

  beforeAll(() => {
    config.email.events.sendgridKey = sendgrid.publicKey
      .export({ type: 'spki', format: 'der' })
      .toString('base64');
  });

  afterAll(() => {
    config.email.events.sendgridKey = undefined;
  });

  /** A logged settings test email in Acme: its delivery row. */
  const deliveryTo = async (to: string) => {
    await t.owner().emails.sendTest({ to });

    const [row] = (await t.owner().emails.deliveries({ search: to })).data;

    if (!row) throw new Error(`no delivery to ${to}`);

    return row;
  };

  /** Posts SendGrid events about the delivery as its signed webhook does. */
  const report = async (delivery: { id: string; to: string }, events: object[]) => {
    const body = JSON.stringify(
      events.map((event) => ({
        email: delivery.to,
        timestamp: Math.floor(Date.now() / 1000),
        erxes_org: t.ids.org,
        erxes_delivery: delivery.id,
        ...event,
      })),
    );

    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = sign('sha256', Buffer.from(timestamp + body), sendgrid.privateKey);

    const response = await fetch(t.url('/core/v1/email/events/sendgrid'), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-twilio-email-event-webhook-signature': signature.toString('base64'),
        'x-twilio-email-event-webhook-timestamp': timestamp,
      },
      body,
    });

    expect(response.status).toBe(204);
  };

  /** Suppresses an address in Acme as a bounce or an unsubscribe would. */
  const suppress = (address: string, reason: 'bounced' | 'unsubscribed') =>
    adminDb()
      .insert(suppressions)
      .values({ id: newId(), orgId: t.ids.org, channel: 'email', address, reason });

  const standingOf = async (email: string) =>
    (await t.owner().emails.addresses({ search: email })).data.find((row) => row.email === email);

  const deliveryOf = async (to: string) =>
    (await t.owner().emails.deliveries({ search: to })).data.find((row) => row.to === to);

  it('proves an address by a reported delivery, lets an old one lapse, and counts soft bounces', async () => {
    const now = Math.floor(Date.now() / 1000);

    await report(await deliveryTo('proven@mail.mn'), [
      { event: 'deferred', response: '421 try later', timestamp: now - 10 },
      { event: 'delivered', timestamp: now - 5 },
    ]);
    await report(await deliveryTo('stale@mail.mn'), [
      { event: 'delivered', timestamp: now - 200 * DAY },
    ]);
    await report(await deliveryTo('slow@mail.mn'), [
      { event: 'deferred', response: '421 try later' },
      { event: 'bounce', type: 'blocked', reason: '554 blocked for now' },
    ]);
    // An email the server took, with no event from the provider, shows the address but proves nothing.
    await deliveryTo('quiet@mail.mn');

    expect(await standingOf('proven@mail.mn')).toMatchObject({
      lane: 'proven',
      deliveredCount: 1,
      softBounces: 0,
      lastDeliveredAt: new Date((now - 5) * 1000).toISOString(),
      suppressionReason: null,
    });
    expect(await standingOf('stale@mail.mn')).toMatchObject({ lane: 'unknown', deliveredCount: 1 });
    expect(await standingOf('slow@mail.mn')).toMatchObject({
      lane: 'unknown',
      deliveredCount: 0,
      softBounces: 2,
      lastDeliveredAt: null,
    });
    await deliveryTo('Quiet@mail.mn');

    const quiet = await standingOf('quiet@mail.mn');

    expect(quiet).toMatchObject({
      lane: 'unknown',
      sentCount: 2,
      deliveredCount: 0,
      lastDeliveredAt: null,
    });
    expect(quiet?.lastSentAt).not.toBeNull();

    // A suppression outranks a delivery; one without any record still shows.
    await t.owner().suppressions.add({ channel: 'email', addresses: ['proven@mail.mn'] });
    await suppress('left@mail.mn', 'unsubscribed');

    expect(await standingOf('proven@mail.mn')).toMatchObject({
      lane: 'suppressed',
      deliveredCount: 1,
      suppressionReason: 'manual',
    });
    expect(await standingOf('left@mail.mn')).toMatchObject({
      lane: 'suppressed',
      deliveredCount: 0,
      suppressionReason: 'unsubscribed',
    });

    const suppressed = await t.owner().emails.addresses({ lane: 'suppressed', search: '@mail.mn' });

    expect(suppressed.data.map((row) => row.email).toSorted()).toEqual([
      'left@mail.mn',
      'proven@mail.mn',
    ]);
    expect(
      await withOrg(t.ids.org, (tx) =>
        laneOf(tx, ['Proven@mail.mn', 'stale@mail.mn', 'left@mail.mn', 'new@mail.mn']),
      ),
    ).toEqual(
      new Map([
        ['proven@mail.mn', 'suppressed'],
        ['stale@mail.mn', 'unknown'],
        ['left@mail.mn', 'suppressed'],
        ['new@mail.mn', 'unknown'],
      ]),
    );
  });

  it('pages newest first, and shows nothing of another organisation', async () => {
    await suppress('page-1@mail.mn', 'bounced');
    await suppress('page-2@mail.mn', 'bounced');
    await suppress('page-3@mail.mn', 'bounced');

    const first = await t.owner().emails.addresses({ search: 'page-', limit: 2 });

    const next = await t.owner().emails.addresses({
      search: 'page-',
      limit: 2,
      cursor: first.pageInfo.endCursor ?? undefined,
    });

    expect(first.totalCount).toBe(3);
    expect([...first.data, ...next.data].map((row) => row.email).toSorted()).toEqual([
      'page-1@mail.mn',
      'page-2@mail.mn',
      'page-3@mail.mn',
    ]);
    expect(next.pageInfo.hasNextPage).toBe(false);

    expect((await t.other().emails.addresses({})).data).toEqual([]);
    expect(await withOrg(t.ids.otherOrg, (tx) => laneOf(tx, ['page-1@mail.mn']))).toEqual(
      new Map([['page-1@mail.mn', 'unknown']]),
    );
    await expect(t.member().emails.addresses({})).rejects.toMatchObject({ status: 403 });
  });

  it('answers a password reset to a bounced address as usual, and sends nothing', async () => {
    await suppress('member@acme.mn', 'bounced');

    expect(
      await t.client().auth.requestPasswordReset({ email: 'member@acme.mn', subdomain: 'acme' }),
    ).toEqual({ ok: true });
    await settle();

    expect(loggedEmails.some((email) => email.to === 'member@acme.mn')).toBe(false);
    expect(await deliveryOf('member@acme.mn')).toMatchObject({
      source: 'account',
      status: 'suppressed',
      error: 'bounced',
      attempts: 0,
    });
  });

  it('keeps broadcasts from an unsubscribed address, but not other email', async () => {
    const owner = t.owner();

    await suppress('quit@news.mn', 'unsubscribed');
    await Promise.all(
      ['quit@news.mn', 'stay@news.mn'].map((primaryEmail, index) =>
        owner.customers.create({ primaryEmail, code: `unsub-${index}` }),
      ),
    );

    const broadcast = await owner.broadcasts.create({
      name: 'News',
      channel: 'email',
      filter: audienceOf('unsub'),
      subject: 'News',
      content: say('Hi'),
    });

    // A test copy answers as sent; its row says why it wasn't.
    expect(await owner.broadcasts.test({ id: broadcast.id, to: ['quit@news.mn'] })).toEqual({
      queued: 1,
    });
    await owner.broadcasts.send({ id: broadcast.id });
    expect(
      await t.hr().emails.send({ to: ['quit@news.mn'], subject: 'Receipt', body: 'Paid' }),
    ).toEqual({ queued: 1 });
    await settle();

    expect(emailsTo('stay@news.mn').map((email) => email.subject)).toEqual(['News']);
    expect(emailsTo('quit@news.mn').map((email) => email.subject)).toEqual(['Receipt']);
    // Left out at enrolment, so the sending logs nothing for it: the one broadcast row is the test's.
    expect(await owner.broadcasts.get({ id: broadcast.id })).toMatchObject({ total: 1 });

    const rows = (await owner.emails.deliveries({ search: 'quit@news.mn' })).data;

    expect(
      rows
        .map((row) => ({ source: row.source, status: row.status, error: row.error }))
        .toSorted((a, b) => a.source.localeCompare(b.source)),
    ).toEqual([
      { source: 'broadcast', status: 'suppressed', error: 'unsubscribed' },
      { source: 'plugin', status: 'sent', error: null },
    ]);
  });

  it('says in the automation step how many addresses were suppressed', async () => {
    await suppress('blocked@auto.mn', 'bounced');

    const id = await t.active('Mail', {
      trigger: { kind: 'event', event: 'core.company.created' },
      steps: [
        {
          id: 'mail',
          type: 'action',
          action: 'core.email.send',
          input: { to: 'blocked@auto.mn, open@auto.mn', subject: 'Hi', body: 'Hello' },
        },
      ],
    });

    await t.owner().companies.create({ primaryName: 'Mail Co' });
    await settle();

    const [run] = await t.runsOf(id);
    const { steps } = await t.owner().automations.run({ runId: run?.id ?? '' });

    expect(steps.find((step) => step.stepId === 'mail')?.output).toEqual({
      sent: 1,
      held: 0,
      suppressed: 1,
      to: ['blocked@auto.mn', 'open@auto.mn'],
      reason: '1 of 2 addresses are suppressed',
    });
    expect(loggedEmails.some((email) => email.to === 'blocked@auto.mn')).toBe(false);
    expect(loggedEmails.some((email) => email.to === 'open@auto.mn')).toBe(true);
  });

  it('reopens a bounce, never an unsubscribe', async () => {
    await suppress('back@mail.mn', 'bounced');
    await suppress('gone@mail.mn', 'unsubscribed');

    const bounced = await standingOf('back@mail.mn');
    const unsubscribed = await standingOf('gone@mail.mn');

    await expect(
      t.owner().suppressions.remove({ id: unsubscribed?.suppressionId ?? '' }),
    ).rejects.toMatchObject({ status: 403, code: 'NOT_ALLOWED' });
    expect(await t.owner().suppressions.remove({ id: bounced?.suppressionId ?? '' })).toEqual({
      ok: true,
    });
    expect(await standingOf('back@mail.mn')).toBeUndefined();
    expect(await standingOf('gone@mail.mn')).toMatchObject({ lane: 'suppressed' });

    const audit = await t.owner().audit.list({ action: 'suppression.removed' });

    expect(audit.data[0]).toMatchObject({ targetId: bounced?.suppressionId });
  });
});
