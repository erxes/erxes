import { afterAll, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { loggedSms } from '~/modules/sms/sms';
import { useTestDatabase } from './db';
import { urlOf } from './fakeGateway';
import { settle } from './settle';
import { useTwoOrgs } from './support';

describe('texts for plugins', { timeout: 120_000 }, () => {
  useTestDatabase();

  const t = useTwoOrgs();

  /** What Twilio was asked to send. */
  const twilio: URLSearchParams[] = [];

  beforeAll(async () => {
    await t.client(await t.pluginToken()).plugins.registerManifest({
      title: 'HR',
      version: '1',
      scopes: ['sms:write'],
    });

    const realFetch = globalThis.fetch;

    vi.stubGlobal('fetch', (input: string | URL | Request, init?: RequestInit) => {
      const url = urlOf(input);

      if (!url.startsWith('https://api.twilio.com/')) return realFetch(input, init);

      if (url.endsWith('/Messages.json')) {
        twilio.push(new URLSearchParams(typeof init?.body === 'string' ? init.body : ''));

        return Promise.resolve(new Response('{"sid":"SM1"}', { status: 201 }));
      }

      return Promise.resolve(new Response('{"status":"active"}', { status: 200 }));
    });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it('texts each phone once; without an SMS connection outside production they go to the log', async () => {
    const answer = await t.hr().sms.send({
      to: ['+976 9911 2233', '+97699112233', '+97688112233'],
      text: 'Your order is ready',
    });

    expect(answer).toEqual({ queued: 2 });
    await settle();

    expect(
      loggedSms.filter((sms) => sms.text === 'Your order is ready').map((sms) => sms.to),
    ).toEqual(expect.arrayContaining(['+97699112233', '+97688112233']));

    const audit = await t.owner().audit.list({ action: 'sms.sent' });

    expect(audit.data[0]).toMatchObject({ actorType: 'plugin', actorId: 'hr' });
  });

  it("sends through the organisation's SMS connection once it has one", async () => {
    await t.owner().integrations.connect({
      name: 'Twilio',
      key: 'twilio',
      keys: {
        accountSid: `AC${'0'.repeat(32)}`,
        authToken: 'twilio-token',
        from: '+15005550006',
      },
    });

    await t.hr().sms.send({ to: ['+97699445566'], text: 'Your order shipped' });
    await settle();

    expect(twilio.map((body) => Object.fromEntries(body))).toEqual([
      { From: '+15005550006', To: '+97699445566', Body: 'Your order shipped' },
    ]);
    expect(loggedSms.some((sms) => sms.text === 'Your order shipped')).toBe(false);

    // The other organisation has no SMS connection: its texts don't use Acme's.
    await t.hr(t.ids.otherOrg).sms.send({ to: ['+97699778899'], text: 'Globex text' });
    await settle();

    expect(twilio).toHaveLength(1);
  });

  it('is for plugins with sms:write only', async () => {
    await expect(t.owner().sms.send({ to: ['+97699112233'], text: 'Hi' })).rejects.toMatchObject({
      code: 'PLUGIN_ONLY',
    });
  });
});
