import { describe, expect, it } from 'vite-plus/test';
import { loggedEmails } from '~/modules/email/email';
import { useTestDatabase } from './db';
import { settle } from './settle';
import { useTwoOrgs } from './support';

describe('emails for plugins', () => {
  useTestDatabase();

  const t = useTwoOrgs();

  it('queues a plain message to each address once, with a reply-to, and audits it', async () => {
    const answer = await t.hr().emails.send({
      to: ['Bold@Mail.mn', 'bold@mail.mn', 'saraa@mail.mn'],
      subject: 'Your ticket #42',
      body: 'We fixed it.\n\nReply to this email if it happens again.',
      replyTo: 'support@acme.mn',
      button: { label: 'Open the ticket', link: 'https://acme.mn/tickets/42' },
    });

    expect(answer).toEqual({ queued: 2 });
    await settle();

    const sent = loggedEmails.filter((email) => email.subject === 'Your ticket #42');

    expect(sent.map((email) => email.to).toSorted((a, b) => a.localeCompare(b))).toEqual([
      'bold@mail.mn',
      'saraa@mail.mn',
    ]);
    expect(sent[0]).toMatchObject({ replyTo: 'support@acme.mn' });
    expect(sent[0]?.text).toContain('Open the ticket: https://acme.mn/tickets/42');

    const audit = await t.owner().audit.list({ action: 'email.sent' });

    expect(audit.data[0]).toMatchObject({
      actorType: 'plugin',
      actorId: 'hr',
      targetLabel: 'Your ticket #42',
    });
  });

  it('is for plugins with emails:write only', async () => {
    const message = { to: ['x@mail.mn'], subject: 'Hi', body: 'Hello' };

    await expect(t.owner().emails.send(message)).rejects.toMatchObject({ code: 'PLUGIN_ONLY' });
    // Buttons link to https only.
    await expect(
      t.hr().emails.send({ ...message, button: { label: 'Go', link: 'http://acme.mn' } }),
    ).rejects.toMatchObject({ status: 400 });

    const service = t.client(await t.pluginToken());

    await service.plugins.registerManifest({
      title: 'HR',
      version: '1',
      scopes: ['customers:read'],
    });
    await expect(t.hr().emails.send(message)).rejects.toMatchObject({ code: 'SCOPE_REQUIRED' });
  });
});
