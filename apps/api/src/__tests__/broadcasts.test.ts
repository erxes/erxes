import { describe, expect, it } from 'vite-plus/test';
import { loggedSms } from '~/modules/sms/sms';
import {
  audienceOf,
  emailDoc,
  emailsTo,
  field,
  linkTo,
  paragraph,
  say,
  useBroadcasts,
} from './broadcasts.fixture';
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
    await owner.emails.addReplyTo({ email: 'hello@acme.mn' });

    expect(
      await owner.broadcasts.audience({ channel: 'email', filter: audienceOf('news') }),
    ).toEqual({ matched: 4, reachable: 2, noAddress: 1, suppressed: 1 });

    const draft = await owner.broadcasts.create({
      name: 'November news',
      channel: 'email',
      filter: audienceOf('news'),
      subject: 'Hello {{ firstName | friend }}',
      content: emailDoc(
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'News' }] },
        paragraph(
          'Hi ',
          field('firstName', 'there'),
          ', read ',
          linkTo('the news', 'https://acme.mn/news'),
        ),
        paragraph({ type: 'text', text: 'Big sale', marks: [{ type: 'bold' }] }),
        {
          type: 'button',
          attrs: { url: 'https://acme.mn/sale' },
          content: [{ type: 'text', text: 'Shop' }],
        },
      ),
      fromName: 'Acme',
      replyTo: 'hello@acme.mn',
    });

    expect(draft).toMatchObject({ status: 'draft', total: 0 });

    const preview = await owner.broadcasts.preview({ id: draft.id });

    expect(preview.subject).toMatch(/^Hello /);
    expect(preview.html).toContain('<strong>Big sale</strong>');
    expect(preview.html).toContain('href="https://acme.mn/news"');
    expect(preview.html).toContain('href="https://acme.mn/sale"');
    expect(preview.html).not.toContain('{{');

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
    expect(anon?.text).toContain('Hi there, read the news');
    expect(bat?.text).toContain('Hi Bat, read the news');
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

  it('duplicates the audience and content into a fresh draft, scheduled or sent', async () => {
    const owner = t.owner();

    await t.customersIn('twin', [{ firstName: 'Ikh', primaryEmail: 'ikh@twin.mn' }]);

    const desk = await owner.emails.addReplyTo({ email: 'desk@twin.mn' });

    const content = {
      channel: 'email',
      filter: audienceOf('twin'),
      subject: 'Twins {{ firstName | friend }}',
      preheader: 'Two of a kind',
      content: say('Hi ', field('firstName', 'there')),
      fromName: 'Twin desk',
      replyTo: 'desk@twin.mn',
    } as const;

    const fresh = {
      status: 'draft',
      viewId: null,
      scheduledAt: null,
      startedAt: null,
      finishedAt: null,
      error: null,
      total: 0,
      stats: { queued: 0, sending: 0, sent: 0, failed: 0, skipped: 0, opened: 0 },
    };

    const source = await owner.broadcasts.create({ name: 'Twin', ...content });

    await owner.broadcasts.schedule({
      id: source.id,
      at: new Date(Date.now() + 3_600_000).toISOString(),
    });

    const scheduledCopy = await owner.broadcasts.duplicate({ id: source.id });

    expect(scheduledCopy.id).not.toBe(source.id);
    expect(scheduledCopy).toMatchObject({ name: 'Twin (copy)', ...content, ...fresh });

    await owner.broadcasts.send({ id: source.id });
    await settle();

    expect(await owner.broadcasts.get({ id: source.id })).toMatchObject({
      status: 'sent',
      total: 1,
    });
    expect(await owner.broadcasts.duplicate({ id: source.id })).toMatchObject({
      name: 'Twin (copy)',
      ...content,
      ...fresh,
    });

    // A Reply-To no longer on the list stays behind, so the copy can still be saved.
    await owner.emails.removeReplyTo({ id: desk.id });

    const unlisted = await owner.broadcasts.duplicate({ id: source.id });

    expect(unlisted).toMatchObject({ ...content, replyTo: null });
    expect(
      await owner.broadcasts.update({ id: unlisted.id, subject: 'Twins again', replyTo: null }),
    ).toMatchObject({ subject: 'Twins again', replyTo: null });
  });

  it('sends to a saved view, which stays while a broadcast waits on it', async () => {
    const owner = t.owner();

    await t.customersIn('viewed', [
      { firstName: 'Saran', primaryEmail: 'saran@viewed.mn' },
      { firstName: 'Gerel', primaryEmail: 'gerel@viewed.mn' },
    ]);

    const view = await owner.views.create({
      name: 'Viewed',
      recordType: 'customer',
      filter: audienceOf('viewed'),
    });

    const broadcast = await owner.broadcasts.create({
      name: 'To the view',
      channel: 'email',
      viewId: view.id,
      subject: 'Hi {{ firstName }}',
      content: say('Hi'),
    });

    expect(await owner.broadcasts.audience({ channel: 'email', viewId: view.id })).toMatchObject({
      matched: 2,
      reachable: 2,
    });
    // Deleting it would clear the draft's view and send it to every customer.
    await expect(owner.views.remove({ id: view.id })).rejects.toMatchObject({
      status: 409,
      code: 'VIEW_IN_USE',
      data: { count: 1 },
    });

    await owner.broadcasts.send({ id: broadcast.id });
    await settle();

    expect(emailsTo('saran@viewed.mn')[0]?.subject).toBe('Hi Saran');
    expect(await owner.broadcasts.get({ id: broadcast.id })).toMatchObject({ total: 2 });
    // Once it went, the view can go: the recipients are already fixed.
    expect(await owner.views.remove({ id: view.id })).toEqual({ ok: true });
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
    const draft = await t.emailTo('news', { subject: '', content: null });

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
