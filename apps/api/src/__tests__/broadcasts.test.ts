import { describe, expect, it } from 'vite-plus/test';
import { loggedSms } from '~/modules/sms/sms';
import { audienceOf, emailsTo, useBroadcasts } from './broadcasts.fixture';
import { useTestDatabase } from './db';
import { makeDue, settle } from './settle';

/** Email and SMS to many customers at once (decision 47). */
describe('broadcasts', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useBroadcasts();

  it('sends personal copies to the audience, skipping suppressed addresses, and counts them', async () => {
    const owner = t.owner();

    await t.customersIn('news', [
      { firstName: 'Bat', primaryEmail: 'bat@news.mn' },
      { primaryEmail: 'anon@news.mn' },
      { firstName: 'Dorj', primaryEmail: 'dorj@news.mn' },
      { firstName: 'Nomail' },
    ]);
    await owner.suppressions.add({ channel: 'email', addresses: ['dorj@news.mn'] });

    expect(
      await owner.broadcasts.audience({ channel: 'email', filter: audienceOf('news') }),
    ).toEqual({ matched: 4, reachable: 2, noAddress: 1, suppressed: 1 });

    const draft = await owner.broadcasts.create({
      name: 'November news',
      channel: 'email',
      filter: audienceOf('news'),
      subject: 'Hello {{ firstName | friend }}',
      body: 'Hi **{{ firstName | there }}**,\n\nRead [the news](https://acme.mn/news).',
      fromName: 'Acme',
      replyTo: 'hello@acme.mn',
    });

    expect(draft).toMatchObject({ status: 'draft', total: 0 });

    const preview = await owner.broadcasts.preview({ id: draft.id });

    expect(preview.subject).toMatch(/^Hello /);
    expect(preview.html).toContain('<strong>');
    expect(preview.html).toContain('href="https://acme.mn/news"');

    expect(await owner.broadcasts.send({ id: draft.id })).toMatchObject({ status: 'sending' });
    await expect(owner.broadcasts.update({ id: draft.id, name: 'Late' })).rejects.toMatchObject({
      status: 409,
      code: 'BROADCAST_STATUS',
    });

    await settle();

    const [bat] = emailsTo('bat@news.mn');
    const [anon] = emailsTo('anon@news.mn');

    expect(bat).toMatchObject({ subject: 'Hello Bat', fromName: 'Acme', replyTo: 'hello@acme.mn' });
    expect(anon?.subject).toBe('Hello friend');
    expect(anon?.text).toContain('Hi **there**');
    expect(emailsTo('dorj@news.mn')).toEqual([]);
    expect(bat?.headers?.['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click');
    expect(bat?.headers?.['List-Unsubscribe']).toContain('/core/v1/b/');

    const sent = await owner.broadcasts.get({ id: draft.id });

    expect(sent).toMatchObject({
      status: 'sent',
      total: 2,
      stats: { sent: 2, queued: 0, failed: 0, opened: 0, clicked: 0, unsubscribed: 0 },
    });
    expect(sent.finishedAt).not.toBeNull();

    const recipients = await owner.broadcasts.recipients({ id: draft.id });

    expect(recipients.data.map((row) => row.address).toSorted()).toEqual([
      'anon@news.mn',
      'bat@news.mn',
    ]);
    expect(recipients.data.find((row) => row.address === 'bat@news.mn')).toMatchObject({
      status: 'sent',
      customerName: 'Bat',
    });
  });

  it('sends at the scheduled moment, and a moved or cancelled schedule never fires', async () => {
    const owner = t.owner();

    await t.customersIn('later', [{ firstName: 'Tuya', primaryEmail: 'tuya@later.mn' }]);

    const broadcast = await t.emailTo('later', { subject: 'Later' });

    await expect(
      owner.broadcasts.schedule({ id: broadcast.id, at: new Date().toISOString() }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });

    const soon = new Date(Date.now() + 3_600_000).toISOString();
    const later = new Date(Date.now() + 7_200_000).toISOString();

    expect(await owner.broadcasts.schedule({ id: broadcast.id, at: soon })).toMatchObject({
      status: 'scheduled',
      scheduledAt: soon,
    });
    await owner.broadcasts.unschedule({ id: broadcast.id });
    await owner.broadcasts.schedule({ id: broadcast.id, at: later });
    // Still editable while it waits.
    await owner.broadcasts.update({ id: broadcast.id, subject: 'Later, edited' });

    await makeDue();
    await settle();

    expect(emailsTo('tuya@later.mn')).toHaveLength(1);
    expect(emailsTo('tuya@later.mn')[0]?.subject).toBe('Later, edited');
    expect(await owner.broadcasts.get({ id: broadcast.id })).toMatchObject({
      status: 'sent',
      scheduledAt: later,
    });
  });

  it('pauses, resumes and texts by SMS', async () => {
    const owner = t.owner();

    await t.customersIn('sms', [
      { firstName: 'Bold', primaryPhone: '+97688112233' },
      { firstName: 'Mend', primaryPhone: '+97688112244' },
    ]);

    const broadcast = await owner.broadcasts.create({
      name: 'Texts',
      channel: 'sms',
      filter: audienceOf('sms'),
      body: 'Hi {{ firstName }}, 20% off today',
    });

    await owner.broadcasts.send({ id: broadcast.id });
    expect(await owner.broadcasts.pause({ id: broadcast.id })).toMatchObject({ status: 'paused' });

    await settle();

    expect(loggedSms.filter((sms) => sms.to.startsWith('+9768811'))).toEqual([]);
    expect((await owner.broadcasts.get({ id: broadcast.id })).total).toBe(0);

    await owner.broadcasts.resume({ id: broadcast.id });
    await settle();

    const texts = loggedSms.filter((sms) => sms.to === '+97688112233');

    expect(texts).toHaveLength(1);
    expect(texts[0]?.text).toMatch(/^Hi Bold, 20% off today\nStop: \S+\/unsubscribe$/);
    expect(await owner.broadcasts.get({ id: broadcast.id })).toMatchObject({
      status: 'sent',
      total: 2,
      stats: { sent: 2 },
    });
  });

  it('checks what it is given and who asks', async () => {
    const owner = t.owner();

    await expect(
      owner.broadcasts.create({ name: 'Typo', channel: 'email', body: 'Hi {{ fristName }}' }),
    ).rejects.toMatchObject({
      status: 400,
      code: 'UNKNOWN_PLACEHOLDER',
      data: { placeholders: ['fristName'] },
    });

    const draft = await t.emailTo('news', { subject: '', body: '' });

    await expect(owner.broadcasts.send({ id: draft.id })).rejects.toMatchObject({
      status: 400,
      code: 'BROADCAST_INCOMPLETE',
      data: { missing: ['subject', 'body'] },
    });

    expect(await owner.broadcasts.test({ id: draft.id, to: ['me@acme.mn'] })).toEqual({
      queued: 1,
    });
    await expect(owner.broadcasts.test({ id: draft.id, to: ['+97699'] })).rejects.toMatchObject({
      status: 400,
      code: 'INVALID_INPUT',
    });

    await expect(t.member().broadcasts.list({})).rejects.toMatchObject({
      status: 403,
      code: 'NOT_ALLOWED',
    });
    await expect(t.other().broadcasts.get({ id: draft.id })).rejects.toMatchObject({
      status: 404,
    });

    expect(await owner.broadcasts.remove({ id: draft.id })).toEqual({ ok: true });
  });
});
