import { beforeAll, describe, expect, it } from 'vite-plus/test';
import { hashPassword } from '~/lib/crypto';
import { loggedEmails } from '~/modules/email/email';
import { processJobs } from '~/modules/jobs/jobs';
import { JOBS } from '~/modules/jobs/registry';
import { createOrganization } from '~/modules/organizations/organizations.service';
import { useTestDatabase } from './db';
import { type CoreClient, useTestServer } from './support';

/** Sends what the jobs queued. */
const send = () => processJobs(JOBS);

/** The token in the link of the last email to `to`. */
const linkToken = (to: string, path: string) => {
  const email = loggedEmails.findLast((each) => each.to === to);
  const token = new RegExp(`${path}\\?token=(\\S+)`).exec(email?.text ?? '')?.[1];

  if (token === undefined) throw new Error(`no ${path} link emailed to ${to}`);

  return decodeURIComponent(token);
};

const OWNER = 'owner@acme.mn';

describe('invitations and password resets by email', { timeout: 240_000 }, () => {
  useTestDatabase();

  const server = useTestServer();
  const anonymous = () => server.client();
  let owner: CoreClient;

  beforeAll(async () => {
    const acme = await createOrganization({
      subdomain: 'acme',
      name: 'Acme',
      owner: {
        email: OWNER,
        passwordHash: await hashPassword('Owner-pass-1'),
        fullName: 'Owner Bat',
      },
    });

    owner = server.client({ user: acme.owner.id, org: acme.organization.id });
  });

  it('emails an invitation; the link shows who invited, sets a password once and signs in', async () => {
    expect((await owner.users.invite({ email: 'new@acme.mn' })).status).toBe('invited');
    await send();
    expect(loggedEmails.findLast((email) => email.to === 'new@acme.mn')?.subject).toBe(
      'Owner Bat invited you to Acme on erxes',
    );

    const token = linkToken('new@acme.mn', '/accept-invitation');

    expect(await anonymous().auth.invitation({ token })).toEqual({
      organization: 'Acme',
      email: 'new@acme.mn',
      inviter: 'Owner Bat',
    });

    const browser = server.browser();

    const accepted = await browser.api.auth.acceptInvitation({
      token,
      password: 'New-member-1',
      firstName: 'Saraa',
    });

    expect(accepted.user).toMatchObject({
      email: 'new@acme.mn',
      status: 'active',
      firstName: 'Saraa',
    });
    expect(browser.cookie()).toMatch(/^erxes_session=./);

    // Once only.
    await expect(
      anonymous().auth.acceptInvitation({ token, password: 'New-member-2' }),
    ).rejects.toMatchObject({ code: 'INVALID_LINK' });

    // A resent invitation replaces the earlier link.
    const second = await owner.users.invite({ email: 'second@acme.mn' });

    await send();

    const first = linkToken('second@acme.mn', '/accept-invitation');

    await owner.users.resendInvitation({ id: second.id });
    await send();
    await expect(anonymous().auth.invitation({ token: first })).rejects.toMatchObject({
      code: 'INVALID_LINK',
    });
  });

  it('resets a password by email without telling whether the email exists, and ends old sessions', async () => {
    const before = server.browser();

    await before.api.auth.signIn({ email: OWNER, password: 'Owner-pass-1' });
    expect(await anonymous().auth.requestPasswordReset({ email: 'nobody@acme.mn' })).toEqual({
      ok: true,
    });
    expect(await anonymous().auth.requestPasswordReset({ email: 'OWNER@acme.mn' })).toEqual({
      ok: true,
    });
    await send();
    expect(loggedEmails.some((email) => email.to === 'nobody@acme.mn')).toBe(false);

    const token = linkToken(OWNER, '/reset-password');

    await expect(anonymous().auth.resetPassword({ token, password: 'weak' })).rejects.toMatchObject(
      { status: 400 },
    );

    const reset = server.browser();

    await reset.api.auth.resetPassword({ token, password: 'Owner-pass-2' });
    expect(reset.cookie()).toMatch(/^erxes_session=./);

    // The old session ended; the old password no longer works; the link is used up.
    await expect(before.api.auth.me({})).rejects.toMatchObject({ status: 401 });

    const signIn = (password: string) =>
      server.browser().api.auth.signIn({ email: OWNER, password });

    await expect(signIn('Owner-pass-1')).rejects.toMatchObject({ status: 401 });
    expect(await signIn('Owner-pass-2')).toMatchObject({ user: { email: OWNER } });

    for (const used of [token, 'madeupid12.madeupsecret'])
      await expect(
        anonymous().auth.resetPassword({ token: used, password: 'Owner-pass-3' }),
      ).rejects.toMatchObject({ code: 'INVALID_LINK' });
  });
});
