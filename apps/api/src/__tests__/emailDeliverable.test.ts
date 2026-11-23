import { afterEach, describe, expect, it } from 'vite-plus/test';
import { config } from '~/config';
import { loggedEmails } from '~/modules/email/email';
import { audienceOf, useBroadcasts } from './broadcasts.fixture';
import { useTestDatabase } from './db';
import { settle } from './settle';

/** Production with nothing set up: email would only reach the log, so members can't send it. */
describe('email that can’t be delivered', () => {
  useTestDatabase();

  const t = useBroadcasts();

  afterEach(() => {
    config.isProduction = false;
  });

  it('says how email goes out, and in production refuses broadcasts that would reach only the log', async () => {
    const owner = t.owner();

    await t.customersIn('undelivered', [{ primaryEmail: 'bat@undelivered.mn' }]);

    const draft = await t.emailTo('undelivered');
    const paused = await t.emailTo('undelivered');

    await owner.broadcasts.send({ id: paused.id });
    await owner.broadcasts.pause({ id: paused.id });

    expect(await owner.emails.sender({})).toMatchObject({ provider: 'log', canDeliver: true });

    config.isProduction = true;

    expect(await owner.emails.sender({})).toMatchObject({ provider: 'log', canDeliver: false });

    const refused = { status: 409, code: 'EMAIL_NOT_CONFIGURED' };

    await expect(owner.broadcasts.send({ id: draft.id })).rejects.toMatchObject(refused);
    await expect(
      owner.broadcasts.schedule({
        id: draft.id,
        at: new Date(Date.now() + 3_600_000).toISOString(),
      }),
    ).rejects.toMatchObject(refused);
    await expect(owner.broadcasts.test({ id: draft.id, to: ['me@acme.mn'] })).rejects.toMatchObject(
      refused,
    );
    expect(await owner.broadcasts.get({ id: draft.id })).toMatchObject({ status: 'draft' });
    await expect(owner.broadcasts.resume({ id: paused.id })).rejects.toMatchObject(refused);
    expect(await owner.broadcasts.get({ id: paused.id })).toMatchObject({ status: 'paused' });
    await expect(owner.emails.sendTest({})).rejects.toMatchObject(refused);
    await expect(
      t.hr().emails.send({ to: ['bat@undelivered.mn'], subject: 'Hi', body: 'Hi' }),
    ).rejects.toMatchObject(refused);

    // An automation's email step fails at once, saying why: no retry sets email up.
    const { id: automationId } = await owner.automations.create({
      name: 'Mail',
      definition: {
        trigger: { kind: 'event', event: 'core.company.created' },
        steps: [
          {
            id: 'mail',
            type: 'action',
            action: 'core.email.send',
            input: { to: 'step@undelivered.mn', subject: 'Hi', body: 'Hello' },
          },
        ],
      },
    });

    await owner.automations.activate({ id: automationId });
    await owner.companies.create({ primaryName: 'Mail Co' });
    await settle();

    const [run] = (await owner.automations.runs({ id: automationId, limit: 1 })).data;

    expect(run?.status).toBe('failed');
    expect(run?.error).toContain('Email sending isn’t set up');
    expect((await owner.automations.run({ runId: run?.id ?? '' })).steps).toMatchObject([
      { stepId: 'mail', status: 'failed', attempt: 1 },
    ]);
    expect(loggedEmails.some((email) => email.to === 'step@undelivered.mn')).toBe(false);

    // SMS doesn't go through email: it needs the organisation's SMS connection, which it lacks.
    const sms = await owner.broadcasts.create({
      name: 'Text',
      channel: 'sms',
      filter: audienceOf('undelivered'),
      body: 'Hi',
    });

    await expect(owner.broadcasts.test({ id: sms.id, to: ['+97699112233'] })).rejects.toMatchObject(
      { status: 409, code: 'SMS_NOT_CONFIGURED' },
    );
  });
});
