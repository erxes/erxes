import { broadcastRecipients } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vite-plus/test';
import { emailsTo, linkIn, linkTo, say, useBroadcasts } from './broadcasts.fixture';
import { adminDb, useTestDatabase } from './db';
import { settle } from './settle';

/** A broadcast copy's links (unsubscribe, opens, clicks) and what the mail server says back. */
describe('broadcast links and bounces', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useBroadcasts();

  it('unsubscribes through the signed link (a GET only asks), and nobody but the person undoes it', async () => {
    const owner = t.owner();

    await t.customersIn('unsub', [{ firstName: 'Saraa', primaryEmail: 'saraa@unsub.mn' }]);

    const broadcast = await t.emailTo('unsub', { subject: 'Promo', content: say('Sale') });

    await owner.broadcasts.send({ id: broadcast.id });
    await settle();

    const link = linkIn(emailsTo('saraa@unsub.mn')[0]?.text ?? '', 'Unsubscribe');
    const asked = await fetch(t.url(link.pathname));

    expect(asked.status).toBe(200);
    expect(await asked.text()).toContain('<form method="post">');
    expect((await owner.broadcasts.get({ id: broadcast.id })).stats.unsubscribed).toBe(0);

    const forged = await fetch(
      t.url(link.pathname.replace(/\/[^/]+\/unsubscribe$/, '/forged/unsubscribe')),
      { method: 'POST' },
    );

    expect(forged.status).toBe(403);
    expect((await fetch(t.url(link.pathname), { method: 'POST' })).status).toBe(200);
    expect((await owner.broadcasts.get({ id: broadcast.id })).stats.unsubscribed).toBe(1);

    const suppressed = await owner.suppressions.list({ search: 'saraa@unsub.mn' });

    expect(suppressed.data).toMatchObject([
      {
        channel: 'email',
        address: 'saraa@unsub.mn',
        reason: 'unsubscribed',
        broadcastId: broadcast.id,
      },
    ]);
    await expect(
      owner.suppressions.remove({ id: suppressed.data[0]?.id ?? '' }),
    ).rejects.toMatchObject({ status: 403, code: 'NOT_ALLOWED' });

    const again = await owner.broadcasts.duplicate({ id: broadcast.id });

    await expect(owner.broadcasts.send({ id: again.id })).rejects.toMatchObject({
      status: 409,
      code: 'NO_RECIPIENTS',
    });
  });

  it('counts opens, and redirects only to links the copy signed', async () => {
    const owner = t.owner();

    await t.customersIn('track', [{ firstName: 'Oyun', primaryEmail: 'oyun@track.mn' }]);

    const broadcast = await t.emailTo('track', {
      content: say('See ', linkTo('the shop', 'https://shop.acme.mn/new')),
    });

    await owner.broadcasts.send({ id: broadcast.id });
    await settle();

    const [recipient] = await adminDb()
      .select({ id: broadcastRecipients.id })
      .from(broadcastRecipients)
      .where(eq(broadcastRecipients.broadcastId, broadcast.id));

    const unsubscribe = linkIn(emailsTo('oyun@track.mn')[0]?.text ?? '', 'Unsubscribe');
    const base = unsubscribe.pathname.replace(/\/unsubscribe$/, '');

    expect(base).toContain(recipient?.id ?? 'missing');
    expect((await fetch(t.url(`${base}/open.gif`))).headers.get('content-type')).toContain(
      'image/gif',
    );

    // Previews link straight to the target; only the copy goes through the tracker.
    expect((await owner.broadcasts.preview({ id: broadcast.id })).html).toContain(
      'href="https://shop.acme.mn/new"',
    );

    const forged = await fetch(
      t.url(`${base}/click?u=${encodeURIComponent('https://evil.example')}&s=nope`),
      { redirect: 'manual' },
    );

    expect(forged.status).toBe(403);
    expect((await owner.broadcasts.get({ id: broadcast.id })).stats).toMatchObject({
      opened: 1,
      clicked: 0,
    });
  });

  it('suppresses an address the server says doesn’t exist, and requeues when asked to slow down', async () => {
    const owner = t.owner();

    await t.customersIn('bounce', [{ firstName: 'Gone', primaryEmail: 'gone@bounce.invalid' }]);
    await t.customersIn('busy', [{ firstName: 'Wait', primaryEmail: 'wait@busy.invalid' }]);

    const bounced = await t.emailTo('bounce');

    await owner.broadcasts.send({ id: bounced.id });
    await settle();

    expect(await owner.broadcasts.get({ id: bounced.id })).toMatchObject({
      status: 'sent',
      stats: { sent: 0, failed: 1 },
    });
    expect((await owner.suppressions.list({ reason: 'bounced' })).data).toMatchObject([
      { address: 'gone@bounce.invalid', reason: 'bounced', broadcastId: bounced.id },
    ]);

    const busy = await t.emailTo('busy');

    await owner.broadcasts.send({ id: busy.id });
    await settle();

    expect(await owner.broadcasts.get({ id: busy.id })).toMatchObject({
      status: 'sending',
      stats: { queued: 1, failed: 0, sent: 0 },
    });
    expect((await owner.broadcasts.recipients({ id: busy.id })).data).toMatchObject([
      { status: 'queued', attempts: 0 },
    ]);

    // A bounce can be lifted by a member; the queued copy can still be stopped.
    const [bounce] = (await owner.suppressions.list({ reason: 'bounced' })).data;

    expect(await owner.suppressions.remove({ id: bounce?.id ?? '' })).toEqual({ ok: true });
    expect(await owner.broadcasts.cancel({ id: busy.id })).toMatchObject({
      status: 'cancelled',
      stats: { queued: 0, skipped: 1 },
    });
  });
});
