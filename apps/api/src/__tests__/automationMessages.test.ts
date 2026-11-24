import { newId, suppressions } from '@erxes/core-db';
import { describe, expect, it } from 'vite-plus/test';
import { loggedEmails } from '~/modules/email/email';
import { action, forCustomer, useAutomations } from './automations.fixture';
import { adminDb, useTestDatabase } from './db';
import { makeDue, settle } from './settle';

/** The steps that tell people, as a run uses them. */
describe('automation messages', { timeout: 240_000 }, () => {
  useTestDatabase();

  const t = useAutomations();
  const { onlyRun, outputsOf } = t;

  const inboxOf = async (client = t.owner()) =>
    (await client.notifications.list({ kind: 'core.automation.message', limit: 50 })).data;

  it('notifies the members named and the record’s owner, cut to size, linking only inside erxes', async () => {
    const id = await t.active(
      'Tell the team',
      forCustomer('Told', [
        action('long', 'core.notification.send', {
          userIds: [t.ids.member],
          title: 'T'.repeat(250),
          body: 'B'.repeat(2500),
          link: 'https://evil.example/contacts/',
        }),
        action('mine', 'core.notification.send', {
          owner: true,
          title: '{{subject.lastName}}',
          link: '/contacts/customers',
        }),
        action('one', 'core.notification.send', { userIds: t.ids.member, title: 'Just one' }),
        action('none', 'core.notification.send', { owner: false, title: 'Nobody' }),
      ]),
    );

    const customer = await t.owner().customers.create({ firstName: 'Told', ownerId: t.ids.owner });

    await settle();

    const { run } = await onlyRun(id);

    expect(run.status).toBe('succeeded');
    expect(await outputsOf(id)).toEqual({
      long: { sent: 1 },
      mine: { sent: 1 },
      one: { sent: 1 },
      none: { sent: 0 },
    });

    const toMember = await inboxOf(t.member());

    expect(toMember.map((item) => item.title).toSorted()).toEqual(['Just one', 'T'.repeat(200)]);
    expect(toMember.find((item) => item.title.startsWith('T'))).toMatchObject({
      body: 'B'.repeat(2000),
      link: null,
      entityType: 'customer',
      entityId: customer.id,
      data: { automationId: id, runId: run.id },
    });
    expect(await inboxOf()).toMatchObject([
      { title: 'Tell the team', link: '/contacts/customers' },
    ]);
  });

  it('notifies from a run about no record', async () => {
    const { id } = await t.owner().automations.create({
      name: 'By hand',
      definition: {
        trigger: { kind: 'manual' },
        steps: [
          action('tell', 'core.notification.send', {
            userIds: [t.ids.member],
            owner: true,
            title: 'Started by hand',
          }),
          action('mail', 'core.email.send', { to: 'subject', subject: 'Hi', body: 'Hi' }),
        ],
      },
    });

    await t.owner().automations.activate({ id });
    expect(await t.owner().automations.start({ id })).toMatchObject({ started: 1 });
    await settle();

    expect((await onlyRun(id)).run.status).toBe('succeeded');
    expect(await outputsOf(id)).toEqual({
      tell: { sent: 1 },
      mail: { sent: 0, held: 0, suppressed: 0, reason: 'no email address' },
    });
    expect((await t.owner().automations.outputs({ id })).data).toContainEqual({
      stepId: 'tell',
      fields: [{ key: 'sent', label: 'Sent', type: 'number' }],
    });
    await expect(t.other().automations.outputs({ id })).rejects.toMatchObject({ status: 404 });
    expect(
      (await inboxOf(t.member())).find((item) => item.title === 'Started by hand'),
    ).toMatchObject({
      entityType: null,
      entityId: null,
    });
  });

  it('emails the record or the valid addresses given, and puts the record’s email on its timeline', async () => {
    const id = await t.active(
      'Mail them',
      forCustomer('Mailed', [
        action('own', 'core.email.send', {
          to: '  subject ',
          subject: 'S'.repeat(250),
          body: 'Hello',
          fromName: '  Support  ',
          cc: 'Boss@cc.mn, mailed@mail.mn',
        }),
        action('given', 'core.email.send', {
          to: ' one@list.mn, not-an-address , two@list.mn ',
          subject: '{{subject.lastName}}',
          body: 'Hi',
          cc: 'one@list.mn',
        }),
        action('many', 'core.email.send', {
          to: Array.from({ length: 55 }, (_, n) => `n${n}@many.mn`).join(','),
          subject: 'Many',
          body: 'Hi',
        }),
      ]),
    );

    const customer = await t
      .owner()
      .customers.create({ firstName: 'Mailed', primaryEmail: 'mailed@mail.mn' });

    await settle();

    const outputs = await outputsOf(id);

    expect(outputs.own).toEqual({
      sent: 1,
      held: 0,
      suppressed: 0,
      to: ['mailed@mail.mn'],
      cc: ['boss@cc.mn'],
    });
    expect(outputs.given).toEqual({
      sent: 2,
      held: 0,
      suppressed: 0,
      to: ['one@list.mn', 'two@list.mn'],
    });
    expect(outputs.many).toMatchObject({ sent: 50 });

    const own = loggedEmails.find((email) => email.to === 'mailed@mail.mn');

    expect(own?.subject).toBe('S'.repeat(200));
    expect(own?.fromName).toBe('Support');
    expect(own?.text).toContain('Hello');
    expect(loggedEmails.find((email) => email.to === 'one@list.mn')).toMatchObject({
      subject: '',
      cc: undefined,
    });

    const timeline = await t
      .owner()
      .activities.list({ targetType: 'customer', targetId: customer.id });

    expect(
      timeline.data.filter((entry) => entry.type === 'customer.emailed').map((entry) => entry.data),
    ).toMatchObject([{ subject: 'S'.repeat(200), source: 'automation', sourceId: id }]);
  });

  it('replies go to the verified address given, and a Cc that bounced is left out', async () => {
    await t.owner().emails.addReplyTo({ email: 'desk@acme.mn' });
    await adminDb()
      .insert(suppressions)
      .values([
        {
          id: newId(),
          orgId: t.ids.org,
          channel: 'email',
          address: 'bounced@cc.mn',
          reason: 'bounced',
        },
        {
          id: newId(),
          orgId: t.ids.org,
          channel: 'email',
          address: 'quit@cc.mn',
          reason: 'unsubscribed',
        },
      ]);

    const id = await t.active(
      'Reply to desk',
      forCustomer('Replied', [
        action('mail', 'core.email.send', {
          to: 'subject',
          subject: 'Desk',
          body: 'Hi',
          replyTo: '  Desk@ACME.mn ',
          cc: 'bounced@cc.mn, quit@cc.mn',
        }),
      ]),
    );

    await t.owner().customers.create({ firstName: 'Replied', primaryEmail: 'replied@mail.mn' });
    await settle();

    expect(await outputsOf(id)).toEqual({
      mail: { sent: 1, held: 0, suppressed: 0, to: ['replied@mail.mn'], cc: ['quit@cc.mn'] },
    });
    expect(loggedEmails.find((email) => email.to === 'replied@mail.mn')).toMatchObject({
      replyTo: 'desk@acme.mn',
      cc: ['quit@cc.mn'],
    });
  });

  it('fails the step for a From on a domain no provider of the organisation verified', async () => {
    const id = await t.active(
      'From elsewhere',
      forCustomer('Unverified', [
        action('mail', 'core.email.send', {
          to: 'subject',
          subject: 'Hi',
          body: 'Hi',
          fromEmail: 'news@elsewhere.mn',
        }),
      ]),
    );

    await t.owner().customers.create({ firstName: 'Unverified', primaryEmail: 'u@mail.mn' });
    await settle();

    for (let attempt = 0; attempt < 6; attempt += 1) {
      await makeDue();
      await settle();
    }

    const [run] = await t.runsOf(id);

    expect(run).toMatchObject({ status: 'failed' });
    expect(run?.error).toContain("elsewhere.mn isn't a domain your email provider verified");
    expect(loggedEmails.some((email) => email.to === 'u@mail.mn')).toBe(false);
  });

  it('sends no email when the record has none to send to', async () => {
    const id = await t.active(
      'Mail nobody',
      forCustomer('Unmailed', [
        action('own', 'core.email.send', { to: 'subject', subject: 'Hi', body: 'Hi' }),
      ]),
    );

    await t.owner().customers.create({ firstName: 'Unmailed' });
    await settle();

    expect(await outputsOf(id)).toEqual({
      own: { sent: 0, held: 0, suppressed: 0, reason: 'no email address' },
    });
  });
});
