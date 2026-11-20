import { emailRamps, emailSettings, newId, suppressions } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { config } from '~/config';
import { seal } from '~/lib/secrets';
import { loggedEmails } from '~/modules/email/email';
import { adminDb, useTestDatabase } from './db';
import { useEmailRamp } from './emailRamp.fixture';
import { makeDue, settle } from './settle';

/** The sending ramp: every email counts, the limit grows with a clean rate, a bad one halts. */
describe('email sending ramp', { timeout: 240_000 }, () => {
  useTestDatabase();

  const t = useEmailRamp();
  const { resetAcme, logged, measured, deliveryTo, nextDay } = t;

  afterEach(() => {
    config.saas.enabled = false;
  });

  it('holds the email past the day’s limit and sends it in the next window', async () => {
    await resetAcme({ sentToday: 499 });

    await t.hr().emails.send({ to: ['limit-1@mail.mn'], subject: 'One', body: 'Hi' });
    await t.hr().emails.send({ to: ['limit-2@mail.mn'], subject: 'Two', body: 'Hi' });

    expect(await deliveryTo('limit-1@mail.mn')).toMatchObject({ status: 'queued' });
    expect(await deliveryTo('limit-2@mail.mn')).toMatchObject({
      status: 'held',
      error: 'daily_limit',
    });

    await settle();
    expect(await deliveryTo('limit-2@mail.mn')).toMatchObject({ status: 'held' });
    expect(await t.owner().emails.limits()).toMatchObject({ sentToday: 500, limit: 500, held: 1 });

    await nextDay();
    await makeDue();
    await settle();

    expect(await deliveryTo('limit-2@mail.mn')).toMatchObject({ status: 'sent' });
    expect(loggedEmails.some((email) => email.to === 'limit-2@mail.mn')).toBe(true);
  });

  it('keeps a broadcast sending while its copies wait for the limit, and says so', async () => {
    await t.customersIn('paced', [{ primaryEmail: 'paced-0@mail.mn' }]);
    const draft = await t.emailTo('paced');

    await resetAcme({ sentToday: 500 });
    await t.owner().broadcasts.send({ id: draft.id });
    await settle();

    expect(await t.owner().broadcasts.get({ id: draft.id })).toMatchObject({
      status: 'sending',
      stats: { queued: 1, sent: 0 },
    });
    expect(await t.member().emails.pacing()).toMatchObject({ halted: false, limitReached: true });

    await nextDay();
    await makeDue();
    await settle();

    expect(await t.owner().broadcasts.get({ id: draft.id })).toMatchObject({
      status: 'sent',
      stats: { sent: 1 },
    });
  });

  it('never holds a sign-in or account email, and caps those to unproven addresses an hour', async () => {
    await resetAcme({ sentToday: 500, haltedAt: new Date(), haltReason: 'Test halt' });

    expect(await t.owner().emails.sendTest({ to: 'auth-test@mail.mn' })).toEqual({
      ok: true,
      error: null,
    });

    const cap = config.email.authHourlyCap;

    config.email.authHourlyCap = (await t.owner().emails.limits()).authUnprovenLastHour + 1;

    try {
      const first = await t.client().auth.requestPasswordReset({ email: 'owner@acme.mn' });
      const second = await t.client().auth.requestPasswordReset({ email: 'owner@acme.mn' });

      expect(second).toEqual(first);
    } finally {
      config.email.authHourlyCap = cap;
    }

    const page = await t.owner().emails.deliveries({ source: 'account' });

    expect(page.data.map((row) => row.status).toSorted()).toEqual(['capped', 'queued']);
    expect(page.data.find((row) => row.status === 'capped')?.error).toBe('unproven_hourly');

    // Admins hear as it happens, without waiting for the evaluation.
    await settle();

    const alerts = await t.owner().notifications.list({ kind: 'core.email.capped' });

    expect(alerts.data).toMatchObject([
      { title: 'Sign-in emails are being stopped', priority: 'high' },
    ]);
    expect((await t.member().notifications.list({ kind: 'core.email.capped' })).data).toEqual([]);
  });

  it('goes up a step on a clean window, down on 5%, and once a day at most', async () => {
    await logged(500, 'delivered');
    expect(await measured()).toMatchObject({ tier: 1, limit: 2000 });
    // Moved today: not again until tomorrow.
    await logged(2000, 'delivered');
    expect(await measured()).toMatchObject({ tier: 1 });

    await resetAcme({ tier: 2 });
    await logged(94, 'delivered');
    await logged(6, 'bounced');
    expect(await measured()).toMatchObject({ tier: 1, rate: 0.06, haltedAt: null });
  });

  it('halts at 10%, tells admins once, and leaves other organisations alone', async () => {
    await logged(88, 'delivered');
    await logged(8, 'bounced');
    await logged(4, 'complained');

    const halted = await measured();

    expect(halted.haltedAt).toBeTruthy();
    expect(halted.haltReason).toContain('12.0%');
    await measured();

    const alerts = await t.owner().notifications.list({ kind: 'core.email.halted' });

    expect(alerts.data).toMatchObject([
      {
        title: 'Email sending is halted',
        priority: 'high',
        link: '/settings/integrations/email?tab=limits',
        data: { percent: '12.0', sent: 100, days: 7 },
      },
    ]);
    expect((await t.member().notifications.list({ kind: 'core.email.halted' })).data).toEqual([]);
    expect((await t.other().notifications.list({ kind: 'core.email.halted' })).data).toEqual([]);

    await t.hr().emails.send({ to: ['halted@mail.mn'], subject: 'Halted', body: 'Hi' });
    expect(await deliveryTo('halted@mail.mn')).toMatchObject({ status: 'held', error: 'halted' });
    expect(await t.member().emails.pacing()).toMatchObject({ halted: true });
    // The notice is in the inbox, not an email the halt it reports could hold.
    expect(
      (await t.owner().emails.deliveries({})).data
        .filter((row) => row.status === 'held')
        .map((row) => row.to),
    ).toEqual(['halted@mail.mn']);

    expect(await t.other().emails.limits()).toMatchObject({
      haltedAt: null,
      sentToday: 0,
      held: 0,
    });
    expect(await t.other().emails.pacing()).toMatchObject({ halted: false, limitReached: false });
  });

  it('resumes with a reason, audited: a step down, and the held emails go out', async () => {
    await resetAcme({ tier: 2, haltedAt: new Date(), haltReason: 'Test halt' });
    await t.hr().emails.send({ to: ['resume@mail.mn'], subject: 'Resume', body: 'Hi' });
    expect(await deliveryTo('resume@mail.mn')).toMatchObject({ status: 'held' });

    await expect(t.owner().emails.resumeSending({ reason: ' ' })).rejects.toMatchObject({
      code: 'INVALID_INPUT',
    });
    await expect(t.member().emails.resumeSending({ reason: 'Cleaned' })).rejects.toMatchObject({
      code: 'NOT_ALLOWED',
    });

    expect(await t.owner().emails.resumeSending({ reason: 'Cleaned the list' })).toMatchObject({
      haltedAt: null,
      tier: 1,
      resumeReason: 'Cleaned the list',
      resumedBy: t.ids.owner,
    });

    const audit = await t.owner().audit.list({ action: 'email.sending_resumed' });

    expect(audit.data).toMatchObject([{ metadata: { reason: 'Cleaned the list', toTier: 1 } }]);

    await settle();
    expect(await deliveryTo('resume@mail.mn')).toMatchObject({ status: 'sent' });
  });

  it('counts an email halted after it was queued once, when it goes out', async () => {
    await t.hr().emails.send({ to: ['halted-late@mail.mn'], subject: 'Late', body: 'Hi' });
    expect(await t.owner().emails.limits()).toMatchObject({ sentToday: 1 });

    await adminDb()
      .update(emailRamps)
      .set({ haltedAt: new Date(), haltReason: 'Test halt' })
      .where(eq(emailRamps.orgId, t.ids.org));
    await settle();

    expect(await deliveryTo('halted-late@mail.mn')).toMatchObject({
      status: 'held',
      error: 'halted',
    });
    expect(await t.owner().emails.limits()).toMatchObject({ sentToday: 0, held: 1 });

    await t.owner().emails.resumeSending({ reason: 'Cleaned the list' });
    await settle();

    expect(await deliveryTo('halted-late@mail.mn')).toMatchObject({ status: 'sent' });
    expect(await t.owner().emails.limits()).toMatchObject({ sentToday: 1, held: 0 });
  });

  it('may be turned off only self-hosted with its own SendGrid or SES', async () => {
    config.saas.enabled = true;
    await expect(t.owner().emails.setRamp({ enabled: false })).rejects.toMatchObject({
      status: 402,
      code: 'NOT_IN_PLAN',
    });
    config.saas.enabled = false;

    // Through the server's sending (the log driver here), the ramp can't be turned off.
    await expect(t.owner().emails.setRamp({ enabled: false })).rejects.toMatchObject({
      code: 'INVALID_INPUT',
    });

    const own = (provider: 'smtp' | 'sendgrid') =>
      adminDb()
        .insert(emailSettings)
        .values({
          orgId: t.ids.org,
          provider,
          fromEmail: 'news@acme.mn',
          smtpHost: 'smtp.acme.mn',
          secretSealed: seal('secret'),
        });

    await own('sendgrid');
    expect(await t.owner().emails.setRamp({ enabled: false })).toMatchObject({
      enabled: false,
      active: false,
      canTurnOff: true,
    });
    expect((await t.owner().audit.list({ action: 'email.ramp_turned_off' })).data).toHaveLength(1);

    await adminDb().delete(emailSettings).where(eq(emailSettings.orgId, t.ids.org));
    await own('smtp');
    // An SMTP server reports no bounces: nothing to measure, no ramp.
    expect(await t.owner().emails.limits()).toMatchObject({
      measured: false,
      active: false,
      canTurnOff: false,
    });
    await expect(t.owner().emails.setRamp({ enabled: true })).rejects.toMatchObject({
      code: 'INVALID_INPUT',
    });
  });

  it('checks the suppression list again when it sends', async () => {
    await t.hr().emails.send({ to: ['late@mail.mn'], subject: 'Late', body: 'Hi' });
    await adminDb().insert(suppressions).values({
      id: newId(),
      orgId: t.ids.org,
      channel: 'email',
      address: 'late@mail.mn',
      reason: 'bounced',
    });
    await settle();

    expect(await deliveryTo('late@mail.mn')).toMatchObject({
      status: 'suppressed',
      error: 'bounced',
    });
    expect(loggedEmails.some((email) => email.to === 'late@mail.mn')).toBe(false);
  });
});
