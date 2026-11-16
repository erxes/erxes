import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { loggedEmails } from '~/modules/email/email';
import { loggedSms } from '~/modules/sms/sms';
import { aMinuteLater, useCustomers } from './customerAuth.fixture';
import { useTestDatabase } from './db';
import { settle } from './settle';

/** Plugins notify customers; customers read their inbox in the plugin's app (decision 45). */
describe('customer notifications', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useCustomers();

  beforeAll(async () => {
    await t.client(await t.pluginToken()).plugins.registerManifest({
      title: 'Shop',
      version: '2',
      scopes: ['notifications:write'],
      customerApp: { origins: ['https://{subdomain}.shop.example.com'] },
    });
  });

  it('puts it in the customer inbox, emails it with a link into the app, and is retry-safe', async () => {
    const shopper = await t.signedIn('reader@example.com');

    const note = {
      customerIds: [shopper.customer.id],
      kind: 'hr.post.published',
      title: 'A new post',
      body: 'Read what changed this week.',
      link: '/posts/abc',
      dedupeKey: 'post-abc',
      channels: ['email' as const],
    };

    expect(await t.hr().customerNotifications.create(note)).toEqual({ created: 1, skipped: 0 });
    expect(await t.hr().customerNotifications.create(note)).toEqual({ created: 0, skipped: 1 });

    await settle();

    const emails = loggedEmails.filter((email) => email.subject === 'A new post');

    expect(emails).toHaveLength(1);
    expect(emails[0]?.to).toBe('reader@example.com');
    expect(emails[0]?.text).toContain('https://acme.shop.example.com/posts/abc');

    expect(await shopper.me.customerNotifications.unreadCount({})).toEqual({ count: 1 });

    const page = await shopper.me.customerNotifications.list({});

    expect(page.data).toMatchObject([
      {
        source: 'hr',
        kind: 'hr.post.published',
        title: 'A new post',
        link: '/posts/abc',
        readAt: null,
      },
    ]);

    expect(await shopper.me.customerNotifications.markRead({})).toEqual({ updated: 1 });
    expect(await shopper.me.customerNotifications.unreadCount({})).toEqual({ count: 0 });
    expect(
      await shopper.me.customerNotifications.list({ unread: 'true' }).then((list) => list.data),
    ).toEqual([]);
  });

  it('texts customers who signed in with a phone', async () => {
    const { signIn } = t.app();
    const signedIn = await signIn('+97699112233', 'phone');

    await t.hr().customerNotifications.create({
      customerIds: [signedIn.customer.id],
      kind: 'hr.order.ready',
      title: 'Your order is ready',
      channels: ['sms', 'email'],
    });
    await settle();

    expect(loggedSms.at(-1)).toMatchObject({ to: '+97699112233', text: 'Your order is ready' });
  });

  it('sends to everyone who signed up, in their own organisation only', async () => {
    await aMinuteLater();

    const acme = await t.signedIn('everyone-acme@example.com');
    const globex = await t.signedIn('everyone-globex@example.com', 'globex');
    const broadcast = { everyone: true as const, kind: 'hr.news', title: 'News', dedupeKey: 'n1' };

    const sent = await t.hr().customerNotifications.create(broadcast);

    expect(sent.created).toBeGreaterThanOrEqual(1);
    expect(await t.hr().customerNotifications.create(broadcast)).toMatchObject({ created: 0 });

    const titles = async (me: typeof acme.me) =>
      (await me.customerNotifications.list({})).data.map((item) => item.title);

    expect(await titles(acme.me)).toContain('News');
    expect(await titles(globex.me)).not.toContain('News');
  });

  it('checks who sends what to whom', async () => {
    const shopper = await t.signedIn('checks@example.com');
    const note = { customerIds: [shopper.customer.id], kind: 'hr.x', title: 'x' };

    await expect(
      t.hr().customerNotifications.create({ ...note, kind: 'ecom.x' }),
    ).rejects.toMatchObject({ code: 'INVALID_TYPE' });
    await expect(
      t.hr().customerNotifications.create({ ...note, customerIds: ['nobody'] }),
    ).rejects.toMatchObject({ code: 'INVALID_RECIPIENT' });
    // A customer of another organisation is unknown here.
    await expect(t.hr(t.ids.otherOrg).customerNotifications.create(note)).rejects.toMatchObject({
      code: 'INVALID_RECIPIENT',
    });
    await expect(
      t.hr().customerNotifications.create({
        everyone: true,
        kind: 'hr.x',
        title: 'x',
        channels: ['email'],
      }),
    ).rejects.toMatchObject({ status: 400 });

    // Members can't send, and customer tokens work on `/customer/*` only.
    await expect(t.member().customerNotifications.create(note)).rejects.toMatchObject({
      status: 403,
    });
    await expect(shopper.me.customerNotifications.create(note)).rejects.toMatchObject({
      status: 401,
    });
    await expect(t.member().customerNotifications.list({})).rejects.toMatchObject({
      status: 401,
    });
  });

  it('moves the inbox to the kept customer on a merge, without doubles', async () => {
    const kept = await t.signedIn('kept@example.com');

    const other = await t
      .owner()
      .customers.create({ firstName: 'Old', primaryEmail: 'old@mail.mn' });

    const both = [kept.customer.id, other.id];

    await t.hr().customerNotifications.create({
      customerIds: both,
      kind: 'hr.sale',
      title: 'Sale',
      dedupeKey: 'sale',
    });
    await t.hr().customerNotifications.create({
      customerIds: [other.id],
      kind: 'hr.receipt',
      title: 'Receipt',
    });
    await t.owner().customers.merge({ ids: both, keepId: kept.customer.id });

    const titles = (await kept.me.customerNotifications.list({})).data.map((item) => item.title);

    expect(titles.toSorted()).toEqual(['Receipt', 'Sale']);
  });
});
