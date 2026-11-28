import { customers, events } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import { afterEach, describe, expect, it } from 'vite-plus/test';
import { z } from 'zod';
import { config } from '~/config';
import { loggedEmails } from '~/modules/email/email';
import { siteOrigin, useCustomers } from './customerAuth.fixture';
import { adminDb, useTestDatabase } from './db';
import { settle } from './settle';

const message = (email: string) => ({
  name: 'Nomin Bat',
  email,
  message: 'Do you have a room for two on 12 December?',
});

const codeOf = (error: unknown) => z.object({ code: z.string() }).parse(error).code;

/** The customer with this primary email, as Contacts keeps them. */
const customerBy = async (email: string) => {
  const [row] = await adminDb()
    .select({ id: customers.id, firstName: customers.firstName, source: customers.source })
    .from(customers)
    .where(eq(customers.primaryEmail, email));

  return row;
};

describe('portal contact form (decision 42)', { timeout: 300_000 }, () => {
  useTestDatabase();

  const t = useCustomers();

  afterEach(() => {
    config.isProduction = false;
  });

  it('refuses while no address takes the message or email only reaches the log', async () => {
    const { api } = t.app();

    await expect(api.portalContact.send(message('early@x.mn'))).rejects.toMatchObject({
      status: 503,
      code: 'CONTACT_UNAVAILABLE',
    });

    await t.owner().emails.addReplyTo({ email: 'help@acme.mn' });
    config.isProduction = true;

    await expect(api.portalContact.send(message('early@x.mn'))).rejects.toMatchObject({
      status: 503,
      code: 'CONTACT_UNAVAILABLE',
    });
    // Nothing is kept for a message that couldn't go.
    expect(await customerBy('early@x.mn')).toBeUndefined();
  });

  it("emails the organisation from the portal's sender, replying to the visitor", async () => {
    await t.owner().emails.addReplyTo({ email: 'desk@acme.mn' });

    // No Reply-To on the portal: the organisation's first verified address.
    await t.app().api.portalContact.send(message('first@x.mn'));
    await settle();

    expect(loggedEmails.findLast((sent) => sent.replyTo === 'first@x.mn')?.to).toBe('help@acme.mn');

    await t
      .owner()
      .portals.update({ id: t.sites.acme, replyTo: 'desk@acme.mn', senderName: 'Desk' });

    expect(
      await t.app().api.portalContact.send({
        ...message('Visitor@X.mn'),
        phone: '+976 9911 2233',
        subject: 'Room for two',
      }),
    ).toEqual({ ok: true });

    await settle();

    const sent = loggedEmails.findLast((email) => email.replyTo === 'visitor@x.mn');

    expect(sent).toMatchObject({
      to: 'desk@acme.mn',
      fromName: 'Desk',
      subject: 'acme shop: Room for two',
    });
    expect(sent?.text).toContain('Name: Nomin Bat');
    expect(sent?.text).toContain('Email: visitor@x.mn');
    expect(sent?.text).toContain('Phone: +976 9911 2233');
    expect(sent?.text).toContain('Do you have a room for two on 12 December?');
  });

  it('adds the visitor to Contacts and their timeline, keeping what staff wrote', async () => {
    const known = await t.owner().customers.create({
      firstName: 'Saraa',
      primaryEmail: 'saraa@x.mn',
    });

    await t.app().api.portalContact.send({ ...message('saraa@x.mn'), subject: 'Late check-in' });
    await t.app().api.portalContact.send(message('new@x.mn'));

    expect(await customerBy('saraa@x.mn')).toMatchObject({ id: known.id, firstName: 'Saraa' });
    expect(await customerBy('new@x.mn')).toMatchObject({
      firstName: 'Nomin Bat',
      source: 'website',
    });

    const timeline = await t
      .owner()
      .activities.list({ targetType: 'customer', targetId: known.id });

    expect(timeline.data.find((entry) => entry.type === 'customer.wrote_in')?.data).toEqual({
      portalId: t.sites.acme,
      portalName: 'acme shop',
      subject: 'Late check-in',
      message: 'Do you have a room for two on 12 December?',
      phone: null,
    });

    await settle();

    const published = await adminDb()
      .select({ payload: events.payload })
      .from(events)
      .where(and(eq(events.type, 'core.customer.wrote_in'), eq(events.subjectId, known.id)));

    expect(published).toEqual([
      {
        payload: {
          portalId: t.sites.acme,
          subject: 'Late check-in',
          message: 'Do you have a room for two on 12 December?',
          phone: null,
        },
      },
    ]);
  });

  it('checks the form, the token and where a browser calls from', async () => {
    await expect(
      t.app().api.portalContact.send({ ...message('short@x.mn'), message: 'Hi there' }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });
    await expect(
      t.app().api.portalContact.send({ ...message('short@x.mn'), subject: 'One\nBcc: two' }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });
    await expect(
      t.app({ portalToken: null }).api.portalContact.send(message('token@x.mn')),
    ).rejects.toMatchObject({ status: 401, code: 'UNAUTHORIZED' });
    await expect(
      t.app({ origin: siteOrigin('globex') }).api.portalContact.send(message('origin@x.mn')),
    ).rejects.toMatchObject({ status: 403, code: 'ORIGIN_NOT_ALLOWED' });

    // A server sends no origin.
    expect(await t.app({ origin: null }).api.portalContact.send(message('server@x.mn'))).toEqual({
      ok: true,
    });
  });

  it('limits messages per email address and per network address', async () => {
    const answers = [];

    for (let index = 0; index < 6; index += 1) {
      answers.push(
        await t
          .app()
          .api.portalContact.send(message('again@x.mn'))
          .then(() => 'sent', codeOf),
      );
    }

    expect(answers).toEqual([...Array.from({ length: 5 }, () => 'sent'), 'TOO_MANY_REQUESTS']);

    const flood = t.app();
    const fromOne = [];

    for (let index = 0; index < 11; index += 1) {
      fromOne.push(
        await flood.api.portalContact
          .send(message(`flood${index}@x.mn`))
          .then(() => 'sent', codeOf),
      );
    }

    expect(fromOne.at(-1)).toBe('TOO_MANY_REQUESTS');
  });
});
