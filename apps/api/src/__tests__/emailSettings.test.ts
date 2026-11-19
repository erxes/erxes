import { describe, expect, it } from 'vite-plus/test';
import { sesSmtpPassword } from '~/modules/email/transport';
import { useTestDatabase } from './db';
import { useSmtp } from './smtp.fixture';
import { useTwoOrgs } from './support';

describe('email sending settings', () => {
  useTestDatabase();

  const t = useTwoOrgs();
  const smtp = useSmtp();

  const ownServer = (secret?: string) => ({
    provider: 'smtp' as const,
    fromName: 'Acme',
    fromEmail: 'hello@acme.mn',
    smtpHost: '127.0.0.1',
    smtpPort: smtp.port,
    smtpSecure: false,
    username: 'acme',
    secret,
  });

  it('derives SES’s SMTP password from the secret access key as AWS does', () => {
    expect(sesSmtpPassword('wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY', 'us-east-1')).toBe(
      'BLBM/9hSUELfq8Gw+rU1YcBjkOxGbhT2XG763xVLGWL9',
    );
  });

  it('keeps the secret to itself, needs it the first time and keeps it on a change', async () => {
    expect(await t.owner().emails.settings({})).toBeNull();
    await expect(t.owner().emails.saveSettings(ownServer())).rejects.toMatchObject({
      code: 'INVALID_INPUT',
    });

    const saved = await t.owner().emails.saveSettings(ownServer('pa55word'));

    expect(saved).toMatchObject({ provider: 'smtp', fromEmail: 'hello@acme.mn', username: 'acme' });
    expect(JSON.stringify(saved)).not.toContain('pa55word');
    expect(saved).not.toHaveProperty('secretSealed');

    // The same server and user: the saved password stays.
    await t.owner().emails.saveSettings({ ...ownServer(), fromName: 'Acme Team' });
    // Another provider needs its own key.
    await expect(
      t.owner().emails.saveSettings({ provider: 'sendgrid', fromEmail: 'hello@acme.mn' }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' });

    // Only members who manage integrations, and only their organisation's.
    await expect(t.member().emails.settings({})).rejects.toMatchObject({ code: 'NOT_ALLOWED' });
    expect(await t.other().emails.settings({})).toBeNull();
  });

  it('sends the organisation’s emails from its address through its server', async () => {
    await t.owner().emails.saveSettings({ ...ownServer('pa55word'), username: '' });

    const answer = await t.owner().emails.sendTest({ to: 'someone@example.com' });

    expect(answer).toEqual({ ok: true, error: null });

    const [mail] = smtp.received.slice(-1);

    expect(mail?.from).toContain('hello@acme.mn');
    expect(mail?.to.join()).toContain('someone@example.com');
    expect(mail?.data).toContain('Test email from erxes');

    // Removed: back to the server's (the log driver here), still answering.
    await t.owner().emails.removeSettings({});
    expect(await t.owner().emails.settings({})).toBeNull();
    expect(await t.owner().emails.sendTest({})).toEqual({ ok: true, error: null });
  });

  it('sends through a server that takes mail without signing in', async () => {
    await t.owner().emails.removeSettings({});
    await t.owner().emails.saveSettings({ ...ownServer(), username: '' });

    expect(await t.owner().emails.sendTest({ to: 'open@example.com' })).toEqual({
      ok: true,
      error: null,
    });
    expect(smtp.received.slice(-1)[0]?.to.join()).toContain('open@example.com');
  });

  it('says why a test failed, and refuses a server core may not reach in production', async () => {
    await t.owner().emails.saveSettings({ ...ownServer('pa55word'), smtpPort: 1 });

    const answer = await t.owner().emails.sendTest({ to: 'someone@example.com' });

    expect(answer.ok).toBe(false);
    expect(answer.error).toBeTruthy();
    await expect(
      t.owner().emails.saveSettings({ ...ownServer('x'), smtpHost: 'no-such-host.invalid' }),
    ).rejects.toMatchObject({ code: 'INVALID_URL' });
  });
});
