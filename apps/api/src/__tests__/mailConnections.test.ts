import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { say } from './broadcasts.fixture';
import { useTestDatabase } from './db';
import { settle } from './settle';
import { type FakeSmtp, startSmtp } from './smtp.fixture';
import { useTwoOrgs } from './support';

describe('mail service connections', () => {
  useTestDatabase();

  const t = useTwoOrgs();
  let smtp: FakeSmtp;

  beforeAll(async () => {
    smtp = await startSmtp();
  });

  afterAll(() => {
    smtp.server.close();
  });

  const connectSmtp = (name: string, fromEmail: string) =>
    t.owner().integrations.connect({
      key: 'smtp',
      name,
      keys: {
        host: '127.0.0.1',
        port: String(smtp.port),
        secure: false,
        fromEmail,
        fromName: 'Acme Shop',
      },
    });

  const mailTo = (address: string) =>
    smtp.received.filter((mail) => mail.to.join().includes(address));

  it('lists the connections that are on to members and plugins, never their server', async () => {
    const shop = await connectSmtp('Shop mail', 'Shop@Acme.mn');

    const listed = await t.member().emails.mailConnections({});

    expect(listed.data).toEqual([
      {
        id: shop.id,
        key: 'smtp',
        name: 'Shop mail',
        fromEmail: 'shop@acme.mn',
        fromName: 'Acme Shop',
      },
    ]);
    expect(await t.hr().emails.mailConnections({})).toEqual(listed);
    expect((await t.other().emails.mailConnections({})).data).toEqual([]);
    expect(JSON.stringify(listed)).not.toContain('127.0.0.1');
  });

  it('sends a plugin’s email through the connection it picks, from that address', async () => {
    const shop = await connectSmtp('Plugin mail', 'orders@acme.mn');

    expect(
      await t.hr().emails.send({
        to: ['buyer@mail.mn'],
        subject: 'Your order',
        body: 'It ships today.',
        connectionId: shop.id,
      }),
    ).toEqual({ queued: 1 });
    await settle();

    const [mail] = mailTo('buyer@mail.mn');

    expect(mail?.from).toContain('orders@acme.mn');
    expect(mail?.data).toContain('From: Acme Shop <orders@acme.mn>');
    expect((await t.owner().emails.deliveries({ search: 'buyer@mail.mn' })).data[0]).toMatchObject({
      provider: 'smtp',
      status: 'sent',
    });
  });

  it('sends a broadcast through its connection, and refuses one that is off', async () => {
    const news = await connectSmtp('Newsletter', 'news@acme.mn');

    const draft = await t.owner().broadcasts.create({
      name: 'Through a connection',
      channel: 'email',
      subject: 'News',
      content: say('Hi'),
      fromName: 'Newsroom',
      mailConnectionId: news.id,
    });

    expect(draft.mailConnectionId).toBe(news.id);
    await t.owner().broadcasts.test({ id: draft.id, to: ['reader@mail.mn'] });
    await settle();
    expect(mailTo('reader@mail.mn')[0]?.data).toContain('From: Newsroom <news@acme.mn>');

    await t.owner().integrations.update({ key: 'smtp', id: news.id, status: 'disabled' });

    expect((await t.owner().emails.mailConnections({})).data.map((row) => row.id)).not.toContain(
      news.id,
    );
    await expect(
      t.owner().broadcasts.test({ id: draft.id, to: ['reader@mail.mn'] }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });
    await expect(
      t.hr().emails.send({ to: ['x@mail.mn'], subject: 'Hi', body: 'Hi', connectionId: news.id }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });
    await expect(
      t.owner().broadcasts.create({
        name: 'Another org’s',
        channel: 'email',
        mailConnectionId: 'not-a-connection',
      }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });
  });

  it('lets a portal pick a mail connection, and only a mail one', async () => {
    const support = await connectSmtp('Support mail', 'support@acme.mn');
    const portal = await t.owner().portals.create({ name: 'Acme Shop' });

    const saved = await t.owner().portals.update({ id: portal.id, mailConnectionId: support.id });

    expect(saved.mailConnectionId).toBe(support.id);

    const payments = await t.owner().integrations.connect({ key: 'test', name: 'Test', keys: {} });

    await expect(
      t.owner().portals.update({ id: portal.id, mailConnectionId: payments.id }),
    ).rejects.toMatchObject({ code: 'UNKNOWN_CONNECTION' });
  });

  it('sends a plugin’s email as its portal’s go, and through Organization email once the connection is off', async () => {
    const shop = await connectSmtp('Portal mail', 'hello@shop.mn');
    const portal = await t.owner().portals.create({ name: 'Nomad Shop' });
    const message = { to: ['guest@mail.mn'], subject: 'Your booking', body: 'See you soon.' };

    // Only a portal the plugin is on.
    await expect(t.hr().emails.send({ ...message, portalId: portal.id })).rejects.toMatchObject({
      code: 'UNKNOWN_PORTAL',
    });

    await t.hr().portals.attach({ id: portal.id, recordId: 'shop-1' });
    await t.owner().portals.update({ id: portal.id, mailConnectionId: shop.id });

    await expect(
      t.hr().emails.send({ ...message, portalId: portal.id, connectionId: shop.id }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });

    await t.hr().emails.send({ ...message, portalId: portal.id });
    await settle();
    expect(mailTo('guest@mail.mn').at(-1)?.data).toContain('From: Nomad Shop <hello@shop.mn>');

    await t.owner().integrations.update({ key: 'smtp', id: shop.id, status: 'disabled' });
    await t.hr().emails.send({ ...message, to: ['later@mail.mn'], portalId: portal.id });
    await settle();

    expect(mailTo('later@mail.mn')).toEqual([]);
    expect((await t.owner().emails.deliveries({ search: 'later@mail.mn' })).data[0]).toMatchObject({
      provider: 'log',
      status: 'sent',
    });
  });
});
