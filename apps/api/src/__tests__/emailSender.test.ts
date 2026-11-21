import { afterEach, describe, expect, it } from 'vite-plus/test';
import { config } from '~/config';
import { loggedEmails } from '~/modules/email/email';
import { say } from './broadcasts.fixture';
import { useTestDatabase } from './db';
import { replyToToken } from './replyTo';
import { settle } from './settle';
import { useTwoOrgs } from './support';

/** Who emails come from, and where replies may go (SaaS: erxes' address, the organisation's name). */
describe('email sender and Reply-To', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  const serverAddress = /<([^>]+)>/.exec(config.email.from)?.[1] ?? config.email.from;

  afterEach(() => {
    config.saas.enabled = false;
  });

  /** A test copy of a fresh draft broadcast, as the inbox gets it. */
  const testCopy = async (fields: { fromName?: string; replyTo?: string }) => {
    const draft = await t.owner().broadcasts.create({
      name: `Copy ${Math.random()}`,
      channel: 'email',
      subject: 'Sender check',
      content: say('Hello'),
      ...fields,
    });

    await t.owner().broadcasts.test({ id: draft.id, to: ['inbox@example.mn'] });
    await settle();

    return loggedEmails.findLast((email) => email.to === 'inbox@example.mn');
  };

  it('self-hosted: verifies an address at once, sending no link', async () => {
    const sent = loggedEmails.length;
    const row = await t.owner().emails.addReplyTo({ email: 'Desk@Acme.mn' });

    expect(row).toMatchObject({ email: 'desk@acme.mn', status: 'verified' });
    await settle();
    expect(loggedEmails.length).toBe(sent);
    await t.owner().emails.removeReplyTo({ id: row.id });
  });

  it('SaaS: verifies a member’s own address at once and any other by the link sent to it', async () => {
    config.saas.enabled = true;

    const own = await t.owner().emails.addReplyTo({ email: 'owner@acme.mn' });

    expect(own).toMatchObject({ email: 'owner@acme.mn', status: 'verified' });

    const pending = await t.owner().emails.addReplyTo({ email: 'Sales@Acme.mn' });

    expect(pending).toMatchObject({ email: 'sales@acme.mn', status: 'pending', verifiedAt: null });
    await settle();

    const token = replyToToken('sales@acme.mn');

    expect(token).toBeTruthy();
    await expect(t.owner().emails.confirmReplyTo({ token: 'nope.nope' })).rejects.toMatchObject({
      status: 400,
      code: 'INVALID_LINK',
    });
    expect(await t.owner().emails.confirmReplyTo({ token: token ?? '' })).toEqual({
      email: 'sales@acme.mn',
      organization: 'Acme',
    });
    // Once only.
    await expect(t.owner().emails.confirmReplyTo({ token: token ?? '' })).rejects.toMatchObject({
      code: 'INVALID_LINK',
    });

    const list = await t.owner().emails.replyTos({});

    expect(list.map(({ email, status }) => ({ email, status }))).toEqual([
      { email: 'owner@acme.mn', status: 'verified' },
      { email: 'sales@acme.mn', status: 'verified' },
    ]);
    // Every member reads them (the editors' picker); managing them needs integrations.manage.
    expect(await t.member().emails.replyTos({})).toHaveLength(2);
    await expect(t.member().emails.addReplyTo({ email: 'x@acme.mn' })).rejects.toMatchObject({
      code: 'NOT_ALLOWED',
    });
    // Another organisation's are its own.
    expect(await t.other().emails.replyTos({})).toEqual([]);
  });

  it('lets an email ask replies only to a verified address of the organisation’s', async () => {
    await t.owner().emails.addReplyTo({ email: 'help@acme.mn' });

    const draft = await t.owner().broadcasts.create({
      name: 'Replies',
      channel: 'email',
      subject: 'Hi',
      content: say('Hi'),
      replyTo: 'help@acme.mn',
    });

    expect(draft.replyTo).toBe('help@acme.mn');
    await expect(
      t.owner().broadcasts.update({ id: draft.id, replyTo: 'stranger@mail.mn' }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });
    // Acme's verified address isn't Globex's to use.
    await expect(
      t.other().broadcasts.create({
        name: 'Borrowed',
        channel: 'email',
        subject: 'Hi',
        content: say('Hi'),
        replyTo: 'help@acme.mn',
      }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });

    // Removed: sending asks again.
    const [help] = (await t.owner().emails.replyTos({})).filter(
      (row) => row.email === 'help@acme.mn',
    );

    await t.owner().emails.removeReplyTo({ id: help?.id ?? '' });
    await expect(t.owner().broadcasts.send({ id: draft.id })).rejects.toMatchObject({
      code: 'INVALID_INPUT',
    });
    // A test copy too: it goes out with the same Reply-To.
    await expect(
      t.owner().broadcasts.test({ id: draft.id, to: ['inbox@example.mn'] }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });
  });

  it('self-hosted: sends from the server’s address under the label, else the organisation’s name', async () => {
    expect(await t.owner().emails.sender({})).toEqual({
      address: serverAddress,
      name: 'Acme',
      nameLocked: false,
      ownSending: true,
      provider: 'log',
      canDeliver: true,
    });
    expect(await testCopy({})).toMatchObject({ fromName: 'Acme' });
    expect(await testCopy({ fromName: 'Acme Support' })).toMatchObject({
      fromName: 'Acme Support',
    });
  });

  it('SaaS: erxes’ address, the organisation’s name first, and no sending of its own', async () => {
    // Saved while self-hosted; a server that can't be reached, so mail through it would fail.
    await t.owner().emails.saveSettings({
      provider: 'smtp',
      fromName: 'Own',
      fromEmail: 'hello@acme.mn',
      smtpHost: '127.0.0.1',
      smtpPort: 1,
      smtpSecure: false,
      username: '',
    });
    config.saas.enabled = true;

    expect(await t.owner().emails.sender({})).toMatchObject({
      address: serverAddress,
      name: 'Acme',
      nameLocked: true,
      ownSending: false,
    });
    expect(await testCopy({ fromName: 'Marketing' })).toMatchObject({
      fromName: 'Acme · Marketing',
    });
    // No name of another organisation's on its own, and no address in the name.
    expect(await testCopy({ fromName: 'acme' })).toMatchObject({ fromName: 'Acme' });
    expect(await testCopy({ fromName: 'support@bank.mn' })).toMatchObject({
      fromName: 'Acme · supportbank.mn',
    });

    await expect(
      t.owner().emails.saveSettings({
        provider: 'sendgrid',
        fromEmail: 'hello@acme.mn',
        secret: 'SG.key',
      }),
    ).rejects.toMatchObject({ status: 402, code: 'NOT_IN_PLAN' });
    await expect(t.owner().emails.sendTest({})).rejects.toMatchObject({ code: 'NOT_IN_PLAN' });
    await t.owner().emails.removeSettings({});
  });
});
