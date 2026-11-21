import { describe, expect, it } from 'vite-plus/test';
import { inOrder } from '~/lib/sequence';
import { audienceOf, say } from './broadcasts.fixture';
import { useTestDatabase } from './db';
import { makeDue, settle } from './settle';
import { useTwoOrgs } from './support';

/** Every email the organisation sends shows in its delivery log, and what became of it. */
describe('email delivery log', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  const deliveriesTo = async (to: string) =>
    (await t.owner().emails.deliveries({ search: to })).data;

  it('logs a queued email, then that the server took it', async () => {
    await t.hr().emails.send({ to: ['Log@Mail.mn'], subject: 'Logged', body: 'Hello' });

    const [queued] = await deliveriesTo('log@mail.mn');

    expect(queued).toMatchObject({
      source: 'plugin',
      sourceId: 'hr',
      to: 'log@mail.mn',
      subject: 'Logged',
      status: 'queued',
      attempts: 0,
      sentAt: null,
    });

    await settle();

    const [sent] = await deliveriesTo('log@mail.mn');

    // Tests send with EMAIL_DRIVER=log: nothing leaves, and the log says so.
    expect(sent).toMatchObject({ status: 'sent', provider: 'log', attempts: 1, error: null });
    expect(sent?.sentAt).toBeTruthy();
  });

  it('keeps a refused email queued with the server’s words, then failed after the last try', async () => {
    await t.hr().emails.send({ to: ['nobody@bounce.invalid'], subject: 'Bounced', body: 'Hi' });
    await settle();

    const [retrying] = await deliveriesTo('nobody@bounce.invalid');

    expect(retrying).toMatchObject({ status: 'queued', attempts: 1 });
    expect(retrying?.error).toContain('550');

    // Five more tries (the job's six), each due now instead of after its backoff.
    await inOrder([2, 3, 4, 5, 6], async () => {
      await makeDue();
      await settle();
    });

    const [failed] = await deliveriesTo('nobody@bounce.invalid');

    expect(failed).toMatchObject({ status: 'failed', attempts: 6, sentAt: null });
  });

  it('logs a settings test and a broadcast’s test copy with where they came from', async () => {
    await t.owner().emails.sendTest({ to: 'test@mail.mn' });

    expect(await deliveriesTo('test@mail.mn')).toMatchObject([
      { source: 'settings', status: 'sent', provider: 'log', attempts: 1 },
    ]);

    const draft = await t.owner().broadcasts.create({
      name: 'Logged copy',
      channel: 'email',
      subject: 'Copy',
      content: say('Hi'),
    });

    await t.owner().broadcasts.test({ id: draft.id, to: ['copy@mail.mn'] });
    await settle();

    const page = await t.owner().emails.deliveries({ source: 'broadcast', sourceId: draft.id });

    expect(page.data).toMatchObject([{ to: 'copy@mail.mn', status: 'sent' }]);
  });

  it('puts a broadcast’s email on the customer’s timeline, linked to the broadcast', async () => {
    const customer = await t.owner().customers.create({
      firstName: 'Timeline',
      primaryEmail: 'timeline@mail.mn',
      code: 'timeline-1',
    });

    const draft = await t.owner().broadcasts.create({
      name: 'On the timeline',
      channel: 'email',
      subject: 'Hello {{ firstName | there }}',
      content: say('Hi'),
      filter: audienceOf('timeline'),
    });

    await t.owner().broadcasts.send({ id: draft.id });
    await settle();

    const timeline = await t.owner().activities.list({
      targetType: 'customer',
      targetId: customer.id,
    });

    const emailed = timeline.data.find((entry) => entry.type === 'customer.emailed');

    expect(emailed).toMatchObject({
      actorType: 'system',
      data: { subject: 'Hello Timeline', source: 'broadcast', sourceId: draft.id, status: 'sent' },
    });
  });

  it('is for members who manage integrations, and the organisation’s own', async () => {
    await expect(t.member().emails.deliveries({})).rejects.toMatchObject({
      code: 'NOT_ALLOWED',
    });
    expect((await t.other().emails.deliveries({})).data).toEqual([]);
  });
});
