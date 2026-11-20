import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { config } from '~/config';
import { generateKeyPairSync, randomUUID, sign } from '~/lib/crypto';
import { snsCertificates } from '~/modules/email/events/ses';
import { audienceOf, say } from './broadcasts.fixture';
import { useTestDatabase } from './db';
import { settle } from './settle';
import { useTwoOrgs } from './support';

/** SendGrid's signing key, as its Signed Event Webhook has one. */
const sendgrid = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });

const sendgridPublicKey = sendgrid.publicKey
  .export({ type: 'spki', format: 'der' })
  .toString('base64');

/** SNS's signing key, served as the certificate at `CERT_URL` (no network in tests). */
const sns = generateKeyPairSync('rsa', { modulusLength: 2048 });

const CERT_URL = 'https://sns.us-east-1.amazonaws.com/SimpleNotificationService-test.pem';

const TOPIC = 'arn:aws:sns:us-east-1:123456789012:erxes-email-events';

const seconds = (iso: string) => Math.floor(new Date(iso).getTime() / 1000);

describe('email provider events', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  beforeAll(() => {
    config.email.events.sendgridKey = sendgridPublicKey;
    config.email.events.sesTopicArns = [TOPIC];
    snsCertificates.set(CERT_URL, Promise.resolve(sns.publicKey));
  });

  afterAll(() => {
    config.email.events.sendgridKey = undefined;
    config.email.events.sesTopicArns = [];
    snsCertificates.clear();
  });

  /** Posts SendGrid events as its webhook does: signed over the timestamp and the raw body. */
  const postSendgrid = (events: object[], options: { path?: string; forged?: boolean } = {}) => {
    const body = JSON.stringify(events);
    const timestamp = String(Math.floor(Date.now() / 1000));

    const signature = sign(
      'sha256',
      Buffer.from(timestamp + (options.forged ? `${body} ` : body)),
      sendgrid.privateKey,
    ).toString('base64');

    return fetch(t.url(options.path ?? '/core/v1/email/events/sendgrid'), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-twilio-email-event-webhook-signature': signature,
        'x-twilio-email-event-webhook-timestamp': timestamp,
      },
      body,
    });
  };

  /** A logged settings test email in the caller's organisation: its delivery row. */
  const deliveryTo = async (to: string, client = t.owner()) => {
    await client.emails.sendTest({ to });

    const [row] = (await client.emails.deliveries({ search: to })).data;

    if (!row) throw new Error(`no delivery to ${to}`);

    return row;
  };

  const deliveryOf = async (to: string, client = t.owner()) =>
    (await client.emails.deliveries({ search: to })).data[0];

  const event = (
    delivery: { id: string; to: string },
    fields: Record<string, unknown>,
    orgId = t.ids.org,
  ) => ({
    email: delivery.to,
    timestamp: Math.floor(Date.now() / 1000),
    erxes_org: orgId,
    erxes_delivery: delivery.id,
    ...fields,
  });

  const suppressed = async (address: string) =>
    (await t.owner().suppressions.list({ search: address })).data;

  it('marks an email delivered, counts deferrals, and never moves a bounce back', async () => {
    const delivery = await deliveryTo('later@mail.mn');
    const sentAt = seconds(delivery.createdAt);

    expect(
      (
        await postSendgrid([
          event(delivery, { event: 'deferred', response: '421 try later', timestamp: sentAt }),
          event(delivery, { event: 'delivered', timestamp: sentAt + 5 }),
        ])
      ).status,
    ).toBe(204);
    expect(await deliveryOf('later@mail.mn')).toMatchObject({
      status: 'delivered',
      deferrals: 1,
      reportedAt: new Date((sentAt + 5) * 1000).toISOString(),
    });

    const bounced = await deliveryTo('gone@mail.mn');

    await postSendgrid([
      event(bounced, { event: 'delivered', timestamp: seconds(bounced.createdAt) + 9 }),
      event(bounced, {
        event: 'bounce',
        type: 'bounce',
        reason: '550 5.1.1 No such user',
        timestamp: seconds(bounced.createdAt) + 3,
      }),
    ]);
    // A delivered event that comes later still doesn't undo the bounce.
    await postSendgrid([event(bounced, { event: 'delivered' })]);

    expect(await deliveryOf('gone@mail.mn')).toMatchObject({
      status: 'bounced',
      error: '550 5.1.1 No such user',
    });
    expect(await suppressed('gone@mail.mn')).toMatchObject([
      { channel: 'email', reason: 'bounced', detail: '550 5.1.1 No such user' },
    ]);
  });

  it('suppresses drops and complaints, but not a blocked bounce', async () => {
    const blocked = await deliveryTo('blocked@mail.mn');
    const dropped = await deliveryTo('dropped@mail.mn');
    const spam = await deliveryTo('spam@mail.mn');

    await postSendgrid([
      event(blocked, { event: 'bounce', type: 'blocked', reason: '554 blocked for now' }),
      event(dropped, { event: 'dropped', reason: 'Bounced Address' }),
      event(spam, { event: 'bounce', type: 'bounce', reason: '550 gone' }),
      event(spam, { event: 'spamreport', timestamp: Math.floor(Date.now() / 1000) + 1 }),
    ]);

    expect(await deliveryOf('blocked@mail.mn')).toMatchObject({ status: 'bounced' });
    expect(await suppressed('blocked@mail.mn')).toEqual([]);
    expect(await deliveryOf('dropped@mail.mn')).toMatchObject({ status: 'bounced' });
    expect(await suppressed('dropped@mail.mn')).toMatchObject([
      { reason: 'bounced', detail: 'Bounced Address' },
    ]);
    expect(await deliveryOf('spam@mail.mn')).toMatchObject({ status: 'complained' });
    // The complaint replaces the bounce: members can't lift it.
    expect(await suppressed('spam@mail.mn')).toMatchObject([{ reason: 'complained' }]);
  });

  it('puts a bounced broadcast copy on the customer’s timeline and suppresses it for the broadcast', async () => {
    const customer = await t.owner().customers.create({
      firstName: 'Bounce',
      primaryEmail: 'bounce-me@mail.mn',
      code: 'events-1',
    });

    const draft = await t.owner().broadcasts.create({
      name: 'Bounces',
      channel: 'email',
      subject: 'Hello',
      content: say('Hi'),
      filter: audienceOf('events'),
    });

    await t.owner().broadcasts.send({ id: draft.id });
    await settle();

    const copy = await deliveryOf('bounce-me@mail.mn');

    if (!copy) throw new Error('no copy logged');

    await postSendgrid([event(copy, { event: 'bounce', type: 'bounce', reason: '550 unknown' })]);

    const timeline = await t.owner().activities.list({
      targetType: 'customer',
      targetId: customer.id,
    });

    expect(
      timeline.data.filter((entry) => entry.type === 'customer.emailed').map((entry) => entry.data),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ status: 'sent', sourceId: draft.id }),
        expect.objectContaining({ status: 'bounced', error: '550 unknown' }),
      ]),
    );
    expect(await suppressed('bounce-me@mail.mn')).toMatchObject([
      { reason: 'bounced', broadcastId: draft.id },
    ]);
  });

  it('refuses a bad signature and skips untagged events and other organisations’ rows', async () => {
    const mine = await deliveryTo('mine@mail.mn');
    const theirs = await deliveryTo('theirs@mail.mn', t.other());

    const forged = await postSendgrid([event(mine, { event: 'delivered' })], { forged: true });

    expect(forged.status).toBe(403);
    expect(await deliveryOf('mine@mail.mn')).toMatchObject({ status: 'sent' });

    const posted = await postSendgrid([
      { event: 'bounce', email: 'mine@mail.mn', timestamp: 1, type: 'bounce' },
      // Acme's tag on Globex's row: Acme's scope can't see it.
      event(theirs, { event: 'spamreport' }),
      event(mine, { event: 'delivered' }),
    ]);

    expect(posted.status).toBe(204);
    expect(await deliveryOf('mine@mail.mn')).toMatchObject({ status: 'delivered' });
    expect(await deliveryOf('theirs@mail.mn', t.other())).toMatchObject({ status: 'sent' });
    expect((await t.other().suppressions.list({ search: 'theirs@mail.mn' })).data).toEqual([]);
  });

  /** Posts an SES event as SNS does: signed (version 2) with the certificate at `CERT_URL`. */
  const postSns = (fields: {
    Message: string;
    TopicArn?: string;
    forged?: boolean;
    certUrl?: string;
  }) => {
    const message = {
      Type: 'Notification',
      MessageId: randomUUID(),
      TopicArn: fields.TopicArn ?? TOPIC,
      Message: fields.Message,
      Timestamp: new Date().toISOString(),
      SignatureVersion: '2',
      SigningCertURL: fields.certUrl ?? CERT_URL,
    };

    const signed = (['Message', 'MessageId', 'Timestamp', 'TopicArn', 'Type'] as const)
      .map((name) => `${name}\n${message[name]}\n`)
      .join('');

    const signature = sign(
      'sha256',
      Buffer.from(fields.forged ? `${signed} ` : signed),
      sns.privateKey,
    ).toString('base64');

    return fetch(t.url('/core/v1/email/events/ses'), {
      method: 'POST',
      headers: { 'content-type': 'text/plain; charset=UTF-8' },
      body: JSON.stringify({ ...message, Signature: signature }),
    });
  };

  const sesEvent = (delivery: { id: string }, fields: Record<string, unknown>) =>
    JSON.stringify({
      mail: { tags: { erxes_org: [t.ids.org], erxes_delivery: [delivery.id] } },
      ...fields,
    });

  it('takes SES events through SNS: a permanent bounce suppresses, a delay is counted', async () => {
    const bounced = await deliveryTo('sesbounce@mail.mn');
    const delayed = await deliveryTo('sesdelay@mail.mn');
    const now = new Date().toISOString();

    const posted = await postSns({
      Message: sesEvent(bounced, {
        eventType: 'Bounce',
        bounce: {
          bounceType: 'Permanent',
          bounceSubType: 'General',
          timestamp: now,
          bouncedRecipients: [{ diagnosticCode: 'smtp; 550 5.1.1 user unknown' }],
        },
      }),
    });

    expect(posted.status).toBe(204);
    await postSns({
      Message: sesEvent(delayed, {
        eventType: 'DeliveryDelay',
        deliveryDelay: { timestamp: now, delayType: 'MailboxFull' },
      }),
    });

    expect(await deliveryOf('sesbounce@mail.mn')).toMatchObject({
      status: 'bounced',
      error: 'smtp; 550 5.1.1 user unknown',
    });
    expect(await suppressed('sesbounce@mail.mn')).toMatchObject([{ reason: 'bounced' }]);
    expect(await deliveryOf('sesdelay@mail.mn')).toMatchObject({ status: 'sent', deferrals: 1 });

    const forged = await postSns({
      Message: sesEvent(delayed, { eventType: 'Delivery', delivery: { timestamp: now } }),
      forged: true,
    });

    expect(forged.status).toBe(403);

    // Anyone can publish to a topic of their own: only the configured one is taken.
    const elsewhere = await postSns({
      Message: sesEvent(delayed, { eventType: 'Delivery', delivery: { timestamp: now } }),
      TopicArn: 'arn:aws:sns:us-east-1:999999999999:someone-else',
    });

    expect(elsewhere.status).toBe(403);

    // A certificate from an S3 bucket named `sns` is anyone's: only SNS's regional hosts serve them.
    const bucket = await postSns({
      Message: sesEvent(delayed, { eventType: 'Delivery', delivery: { timestamp: now } }),
      certUrl: 'https://sns.s3.amazonaws.com/SimpleNotificationService-test.pem',
    });

    expect(bucket.status).toBe(400);
    expect(await deliveryOf('sesdelay@mail.mn')).toMatchObject({ status: 'sent' });
  });

  it('takes a self-hosted organisation’s own SendGrid events at its own address, with its key', async () => {
    const delivery = await deliveryTo('own@mail.mn');
    const theirs = await deliveryTo('own-theirs@mail.mn', t.other());

    await expect(
      t.owner().emails.saveSettings({
        provider: 'sendgrid',
        fromEmail: 'hello@acme.mn',
        secret: 'SG.key',
        eventsKey: 'not-a-key',
      }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });

    const saved = await t.owner().emails.saveSettings({
      provider: 'sendgrid',
      fromEmail: 'hello@acme.mn',
      secret: 'SG.key',
      eventsKey: sendgridPublicKey,
    });

    const path = `/core/v1/email/events/sendgrid/${t.ids.org}`;

    expect(saved.eventsUrl).toMatch(new RegExp(`${path}$`));
    expect(
      (await postSendgrid([], { path: `/core/v1/email/events/sendgrid/${t.ids.otherOrg}` })).status,
    ).toBe(404);

    await postSendgrid(
      [
        event(delivery, { event: 'delivered' }),
        // Globex's event at Acme's address: Acme's key can't speak for Globex.
        event(theirs, { event: 'delivered' }, t.ids.otherOrg),
      ],
      { path },
    );

    expect(await deliveryOf('own@mail.mn')).toMatchObject({ status: 'delivered' });
    expect(await deliveryOf('own-theirs@mail.mn', t.other())).toMatchObject({ status: 'sent' });

    await t.owner().emails.removeSettings({});
  });
});
