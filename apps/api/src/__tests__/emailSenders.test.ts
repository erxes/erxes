import { describe, expect, it } from 'vite-plus/test';
import { audienceOf, emailsTo, linkIn } from './broadcasts.fixture';
import { useAutomations } from './automations.fixture';
import { useTestDatabase } from './db';
import { settle } from './settle';
import { useSmtp } from './smtp.fixture';

/** Settings › Email sending › Senders, and the emails that go out as them. */
describe('email senders', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useAutomations();
  const smtp = useSmtp();

  /** The confirmation link emailed to the address, as a path on the test server. */
  const confirmLink = async (email: string) => {
    await settle();

    const [mail] = emailsTo(email).slice(-1);

    return t.url(linkIn(mail?.text ?? '', 'Confirm the address').pathname);
  };

  /** Adds a sender and opens its link. */
  const confirmed = async (name: string, email: string) => {
    const sender = await t.owner().emails.addSender({ name, email });

    await fetch(await confirmLink(email), { method: 'POST' });

    return sender;
  };

  it('emails a new sender a link, and confirms it only when the link is posted', async () => {
    const owner = t.owner();
    const sender = await owner.emails.addSender({ name: 'Sales', email: ' Sales@Acme.mn ' });

    expect(sender).toMatchObject({ name: 'Sales', email: 'sales@acme.mn', confirmedAt: null });

    const link = await confirmLink('sales@acme.mn');
    const [mail] = emailsTo('sales@acme.mn');

    expect(mail?.subject).toBe('Confirm sales@acme.mn as a sender for Acme');

    const asked = await fetch(link);

    expect(asked.status).toBe(200);
    expect(await asked.text()).toContain('<form method="post">');
    expect((await owner.emails.senders()).data[0]?.confirmedAt).toBeNull();

    const forged = await fetch(link.replace(/\/[^/]+\/confirm$/, '/forged/confirm'), {
      method: 'POST',
    });

    expect(forged.status).toBe(404);

    const posted = await fetch(link, { method: 'POST' });

    expect(posted.status).toBe(200);
    expect(await posted.text()).toContain('can now send emails as <b>sales@acme.mn</b>');
    expect((await owner.emails.senders()).data[0]?.confirmedAt).not.toBeNull();

    await expect(owner.emails.resendConfirmation({ id: sender.id })).rejects.toMatchObject({
      status: 409,
      code: 'NOT_PENDING',
    });
    await expect(
      owner.emails.addSender({ name: 'Again', email: 'sales@acme.mn' }),
    ).rejects.toMatchObject({ status: 409, code: 'TAKEN', data: { field: 'email' } });
    await expect(
      owner.emails.addSender({ name: 'Bad <x>', email: 'x@acme.mn' }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });
  });

  it('lets any member pick senders, but only managers change them, and keeps them to the organisation', async () => {
    const [sales] = (await t.owner().emails.senders()).data;

    expect((await t.member().emails.senders()).data).toEqual([sales]);
    await expect(
      t.member().emails.addSender({ name: 'Me', email: 'me@acme.mn' }),
    ).rejects.toMatchObject({ status: 403, code: 'NOT_ALLOWED' });

    expect((await t.other().emails.senders()).data).toEqual([]);
    await expect(t.other().emails.removeSender({ id: sales?.id ?? '' })).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
    });
    await expect(
      t.other().broadcasts.create({ name: 'Theirs', channel: 'email', fromEmail: sales?.email }),
    ).rejects.toMatchObject({ status: 400, code: 'SENDER_NOT_CONFIRMED' });
  });

  it('sends a broadcast as its sender; through erxes’s server the sender gets the replies', async () => {
    const owner = t.owner();
    const news = await confirmed('Acme News', 'news@acme.mn');
    await owner.emails.addSender({ name: 'Late', email: 'late@acme.mn' });

    await expect(
      owner.broadcasts.create({ name: 'Early', channel: 'email', fromEmail: 'late@acme.mn' }),
    ).rejects.toMatchObject({ status: 400, code: 'SENDER_NOT_CONFIRMED' });

    await owner.customers.create({
      firstName: 'Bold',
      primaryEmail: 'bold@reader.mn',
      code: 'sent-0',
    });

    const broadcast = await owner.broadcasts.create({
      name: 'Weekly',
      channel: 'email',
      filter: audienceOf('sent'),
      subject: 'This week',
      body: 'News',
      fromEmail: 'News@Acme.mn',
    });

    await owner.broadcasts.send({ id: broadcast.id });
    await settle();

    const [copy] = emailsTo('bold@reader.mn');

    expect(copy?.from).toMatch(/^Acme News <(?!news@acme\.mn)[^>]+>$/);
    expect(copy?.replyTo).toBe('news@acme.mn');

    // Its own name and Reply-To win over the sender's.
    const draft = await owner.broadcasts.create({
      name: 'Monthly',
      channel: 'email',
      subject: 'This month',
      body: 'News',
      fromName: 'Acme Monthly',
      fromEmail: 'news@acme.mn',
      replyTo: 'editor@acme.mn',
    });

    await owner.broadcasts.test({ id: draft.id, to: ['own@reader.mn'] });
    await settle();

    const [own] = emailsTo('own@reader.mn');

    expect(own?.from).toMatch(/^Acme Monthly </);
    expect(own?.replyTo).toBe('editor@acme.mn');

    // A removed sender stays on the draft, which still saves and sends from the sending address.
    await owner.emails.removeSender({ id: news.id });

    await owner.broadcasts.update({ id: draft.id, fromEmail: 'news@acme.mn', replyTo: null });
    await owner.broadcasts.test({ id: draft.id, to: ['after@reader.mn'] });
    await settle();

    expect((await owner.broadcasts.get({ id: draft.id })).fromEmail).toBe('news@acme.mn');
    expect(emailsTo('after@reader.mn')[0]?.replyTo).toBeUndefined();
    await expect(owner.emails.resendConfirmation({ id: news.id })).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
    });
  });

  it('with its own server, a sender on the sending domain is the From and any other gets the replies', async () => {
    const owner = t.owner();

    const [sales] = (await owner.emails.senders()).data.filter(
      (sender) => sender.email === 'sales@acme.mn',
    );

    const help = await confirmed('Help desk', 'help@outside.test');
    const waiting = (await owner.emails.senders()).data.find((sender) => !sender.confirmedAt);

    const unconfirmed = await owner.automations.create({
      name: 'Unconfirmed sender',
      definition: {
        trigger: { kind: 'event', event: 'core.customer.created' },
        steps: [
          {
            id: 'mail',
            type: 'action',
            action: 'core.email.send',
            input: { to: 'subject', subject: 'Hi', body: 'Hi', fromEmail: waiting?.email },
          },
        ],
      },
    });

    await expect(owner.automations.activate({ id: unconfirmed.id })).rejects.toMatchObject({
      status: 400,
      code: 'INVALID_AUTOMATION',
      data: {
        problems: [`Step mail (Send an email): ${waiting?.email} is not a confirmed sender`],
      },
    });

    await owner.emails.saveSettings({
      provider: 'smtp',
      fromName: 'Acme',
      fromEmail: 'hello@acme.mn',
      smtpHost: '127.0.0.1',
      smtpPort: smtp.port,
      smtpSecure: false,
      username: '',
    });

    await t.active('Welcome', {
      trigger: {
        kind: 'event',
        event: 'core.customer.created',
        conditions: {
          match: 'all',
          rules: [{ path: 'subject.firstName', op: 'eq', value: 'Welcomed' }],
        },
      },
      steps: [
        {
          id: 'mail',
          type: 'action',
          action: 'core.email.send',
          input: { to: 'subject', subject: 'Welcome', body: 'Hello', fromEmail: sales?.email },
        },
      ],
    });
    await owner.customers.create({ firstName: 'Welcomed', primaryEmail: 'new@reader.mn' });
    await settle();

    const welcome = smtp.received.find((mail) => mail.to.includes('<new@reader.mn>'));

    expect(welcome?.data).toMatch(/^From: Sales <sales@acme\.mn>$/m);
    expect(welcome?.data).not.toMatch(/^Reply-To:/m);

    const draft = await owner.broadcasts.create({
      name: 'Help',
      channel: 'email',
      subject: 'Need help?',
      body: 'Write back',
      fromEmail: help.email,
    });

    await owner.broadcasts.test({ id: draft.id, to: ['tester@reader.mn'] });
    await settle();

    const test = smtp.received.find((mail) => mail.to.includes('<tester@reader.mn>'));

    expect(test?.data).toMatch(/^From: Help desk <hello@acme\.mn>$/m);
    expect(test?.data).toMatch(/^Reply-To: help@outside\.test$/m);

    await owner.emails.removeSettings();
  });
});
