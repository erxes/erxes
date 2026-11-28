import { afterAll, beforeAll, describe, expect, it, vi } from 'vite-plus/test';
import { z } from 'zod';
import { loggedEmails } from '~/modules/email/email';
import { loggedSms } from '~/modules/sms/sms';
import { aMinuteLater, useCustomers } from './customerAuth.fixture';
import { useTestDatabase } from './db';
import { urlOf } from './fakeGateway';
import { settle } from './settle';

const SessionBody = z.object({ phone: z.string(), text: z.string() });

const json = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status }));

const TWILIO_KEYS = (from: string) => ({
  accountSid: `AC${'0'.repeat(32)}`,
  authToken: 'twilio-token',
  from,
});

describe(
  'portal code messages, senders and phone methods (decision 42)',
  { timeout: 300_000 },
  () => {
    useTestDatabase();

    const t = useCustomers();

    /** What Twilio was asked to send. */
    const twilio: Record<string, string>[] = [];

    beforeAll(() => {
      const realFetch = globalThis.fetch;

      vi.stubGlobal('fetch', (input: string | URL | Request, init?: RequestInit) => {
        const url = urlOf(input);
        const body = typeof init?.body === 'string' ? init.body : '';

        if (url.startsWith('https://api.twilio.com/')) {
          if (url.endsWith('/Messages.json')) {
            twilio.push(Object.fromEntries(new URLSearchParams(body)));

            return json({ sid: 'SM1' }, 201);
          }

          return json({ status: 'active' });
        }

        if (url.startsWith('https://api.verify.mn/') && !url.endsWith('/sessions')) {
          return json({ sessionStatus: 'PENDING' });
        }

        if (url.startsWith('https://api.verify.mn/')) {
          const parsed = SessionBody.safeParse(JSON.parse(body));

          // Connecting checks the key with an empty session: refused for its fields.
          if (!parsed.success) return json({ message: 'phone and text' }, 400);

          const session = parsed.data;

          return json(
            {
              sessionId: 's1',
              phone: session.phone,
              shortcode: '144773',
              text: session.text,
              smsUri: `sms:144773?body=${session.text}`,
              displayInstruction: 'text it',
              expiresAt: new Date(Date.now() + 300_000).toISOString(),
            },
            201,
          );
        }

        return realFetch(input, init);
      });
    });

    afterAll(() => {
      vi.unstubAllGlobals();
    });

    it("sends the portal's own code email and text, in its language by default", async () => {
      const { api } = t.app();
      const email = { kind: 'email' as const, value: 'nomin@x.mn' };

      await t.owner().portals.update({ id: t.sites.acme, codeLanguage: 'mn' });
      await api.customerAuth.signUp({ ...email, firstName: 'Nomin' });
      await settle();

      const mongolian = loggedEmails.findLast((sent) => sent.to === 'nomin@x.mn');

      expect(mongolian?.subject).toMatch(/^acme shop: таны код \d{6}$/);
      expect(mongolian?.text).toContain('10 минутын турш ажиллана');

      // Its own words: they must say the code.
      await expect(
        t.owner().portals.update({ id: t.sites.acme, codeSmsText: 'Hello from Acme' }),
      ).rejects.toMatchObject({ status: 400 });

      await t.owner().portals.update({
        id: t.sites.acme,
        codeEmailSubject: 'Acme code {code}',
        codeEmailBody: 'Your {portal} code is {code}.\n\nIt lasts {minutes} minutes.',
        codeSmsText: 'Acme: {code} ({minutes} min)',
      });
      await aMinuteLater();
      await api.customerAuth.signUp({ ...email, firstName: 'Nomin' });
      await api.customerAuth.signUp({
        kind: 'phone',
        value: '99001122',
        firstName: 'Bat',
      });
      await settle();

      const own = loggedEmails.findLast((sent) => sent.to === 'nomin@x.mn');

      expect(own?.subject).toMatch(/^Acme code \d{6}$/);
      expect(own?.text).toMatch(/Your acme shop code is \d{6}\.\nIt lasts 10 minutes\./);
      expect(loggedSms.findLast((sent) => sent.to.endsWith('99001122'))?.text).toMatch(
        /^Acme: \d{6} \(10 min\)$/,
      );
    });

    it("asks replies to go to the portal's verified Reply-To", async () => {
      await expect(
        t.owner().portals.update({ id: t.sites.acme, replyTo: 'nobody@acme.mn' }),
      ).rejects.toMatchObject({ status: 400 });

      // A From only on a domain the organisation's provider verified (it has none here).
      await expect(
        t.owner().portals.update({ id: t.sites.acme, fromEmail: 'codes@acme.mn' }),
      ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });

      await t.owner().emails.addReplyTo({ email: 'help@acme.mn' });
      await t.owner().portals.update({ id: t.sites.acme, replyTo: 'help@acme.mn' });
      await aMinuteLater();
      await t.app().api.customerAuth.signUp({
        kind: 'email',
        value: 'reply@x.mn',
        firstName: 'Saraa',
      });
      await settle();

      expect(loggedEmails.findLast((sent) => sent.to === 'reply@x.mn')?.replyTo).toBe(
        'help@acme.mn',
      );
    });

    it('texts codes through the SMS connection the portal picks', async () => {
      const first = await t.owner().integrations.connect({
        name: 'Twilio main',
        key: 'twilio',
        keys: TWILIO_KEYS('+15005550001'),
      });

      const second = await t.owner().integrations.connect({
        name: 'Twilio shop',
        key: 'twilio',
        keys: TWILIO_KEYS('+15005550002'),
      });

      expect(first.id).not.toBe(second.id);

      // Only an SMS connection of the organisation's.
      await expect(
        t.owner().portals.update({ id: t.sites.acme, smsConnectionId: 'nope' }),
      ).rejects.toMatchObject({ status: 400, code: 'UNKNOWN_CONNECTION' });

      const phone = { kind: 'phone' as const, value: '99112244' };

      await aMinuteLater();
      await t.app().api.customerAuth.signUp({ ...phone, firstName: 'Dorj' });
      await settle();

      // No pick: the oldest.
      expect(twilio.at(-1)?.From).toBe('+15005550001');
      expect(twilio.at(-1)?.To).toContain('99112244');

      await t.owner().portals.update({ id: t.sites.acme, smsConnectionId: second.id });
      await aMinuteLater();
      await t.app().api.customerAuth.signUp({ ...phone, firstName: 'Dorj' });
      await settle();

      expect(twilio.at(-1)?.From).toBe('+15005550002');
      expect(twilio.at(-1)?.To).toContain('99112244');
    });

    it('lets the customer pick a texted code or texting one when the portal offers both', async () => {
      const verify = await t.owner().integrations.connect({
        name: 'verify.mn',
        key: 'verify-mn',
        keys: { apiKey: 'vrf_test_key_123' },
      });

      const { api } = t.app();
      const phone = { kind: 'phone' as const, value: '99113355' };

      await t.owner().portals.update({
        id: t.sites.acme,
        phoneConnectionId: verify.id,
        phoneTexts: true,
      });

      expect(await api.customerAuth.methods()).toMatchObject({
        phone: 'reply',
        phoneMethods: ['reply', 'code'],
      });

      // By default the customer texts it; asked, it is texted to them.
      expect((await api.customerAuth.signUp({ ...phone, firstName: 'Tuya' })).reply).toMatchObject({
        to: '144773',
      });

      await aMinuteLater();

      expect(
        await api.customerAuth.signUp({ ...phone, firstName: 'Tuya', method: 'code' }),
      ).toMatchObject({ reply: null });

      // verify.mn only: a texted code isn't offered.
      await t.owner().portals.update({ id: t.sites.acme, phoneTexts: false });
      await aMinuteLater();

      expect((await api.customerAuth.methods()).phoneMethods).toEqual(['reply']);
      await expect(
        api.customerAuth.signUp({ ...phone, firstName: 'Tuya', method: 'code' }),
      ).rejects.toMatchObject({ status: 400, code: 'SIGN_IN_UNAVAILABLE' });

      // Texted codes only: texting one isn't.
      await t.owner().portals.update({
        id: t.sites.acme,
        phoneConnectionId: null,
        phoneTexts: true,
      });

      expect((await api.customerAuth.methods()).phoneMethods).toEqual(['code']);
      await expect(
        api.customerAuth.signUp({ ...phone, firstName: 'Tuya', method: 'reply' }),
      ).rejects.toMatchObject({ status: 400, code: 'SIGN_IN_UNAVAILABLE' });
    });
  },
);
