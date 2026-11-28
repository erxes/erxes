import { once } from 'node:events';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vite-plus/test';
import { config } from '~/config';
import { say } from './broadcasts.fixture';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

/** What the fake SendGrid and SES answer about their domains, as each test sets it. */
const answers = {
  sendgrid: { status: 200, body: [] as unknown },
  ses: { status: 200, body: {} as unknown },
};

const answer = (req: IncomingMessage, res: ServerResponse) => {
  const { status, body } = req.url?.startsWith('/whitelabel/domains')
    ? answers.sendgrid
    : answers.ses;

  res.writeHead(status, { 'content-type': 'application/json' }).end(JSON.stringify(body));
};

const sendgridDomains = (domains: { domain: string; valid: boolean }[]) => {
  answers.sendgrid = { status: 200, body: domains };
};

/** Sending from an address on a domain the organisation's own provider verified (self-hosted). */
describe('email From on verified domains', () => {
  useTestDatabase();

  const t = useTwoOrgs();
  const sendgridApi = config.email.domainApis.sendgrid;
  let server: Server;

  beforeAll(async () => {
    server = createServer(answer).listen(0);
    await once(server, 'listening');

    const address = server.address();

    if (!address || typeof address === 'string') throw new Error('not listening on a port');

    config.email.domainApis.sendgrid = `http://127.0.0.1:${address.port}`;
    config.email.domainApis.ses.endpoint = `http://127.0.0.1:${address.port}`;
  });

  afterAll(() => {
    config.email.domainApis.sendgrid = sendgridApi;
    delete config.email.domainApis.ses.endpoint;
    server.closeAllConnections();
    server.close();
  });

  afterEach(async () => {
    config.saas.enabled = false;
    await t.owner().emails.removeSettings({});
  });

  const useSendgrid = () =>
    t.owner().emails.saveSettings({
      provider: 'sendgrid',
      fromEmail: 'hello@acme.mn',
      secret: 'SG.test-key',
      eventsKey: '',
    });

  it('keeps the domains SendGrid validated, for every member of the organisation', async () => {
    await useSendgrid();
    sendgridDomains([
      { domain: 'News.Acme.mn', valid: true },
      { domain: 'acme.mn', valid: true },
      { domain: 'pending.mn', valid: false },
    ]);

    const settings = await t.owner().emails.checkDomains({});

    expect(settings).toMatchObject({
      verifiedDomains: ['acme.mn', 'news.acme.mn'],
      domainsError: null,
    });
    expect(settings?.domainsCheckedAt).toBeTruthy();
    expect(await t.owner().emails.sender({})).toMatchObject({
      address: 'hello@acme.mn',
      domains: ['acme.mn', 'news.acme.mn'],
    });
    expect((await t.other().emails.sender({})).domains).toEqual([]);
  });

  it('keeps the last answer when the provider refuses, and says why', async () => {
    await useSendgrid();
    sendgridDomains([{ domain: 'acme.mn', valid: true }]);
    await t.owner().emails.checkDomains({});
    answers.sendgrid = { status: 403, body: { errors: [{ message: 'access forbidden' }] } };

    const settings = await t.owner().emails.checkDomains({});

    expect(settings?.verifiedDomains).toEqual(['acme.mn']);
    expect(settings?.domainsError).toContain('SendGrid answered 403');
  });

  it('asks SES for its domain identities that are verified and may send', async () => {
    await t.owner().emails.saveSettings({
      provider: 'ses',
      fromEmail: 'hello@acme.mn',
      secret: 'test-secret-access-key',
      region: 'us-east-1',
      username: 'AKIATESTKEY12345',
      configurationSet: '',
      eventsTopicArn: '',
    });
    answers.ses = {
      status: 200,
      body: {
        EmailIdentities: [
          {
            IdentityType: 'DOMAIN',
            IdentityName: 'acme.mn',
            SendingEnabled: true,
            VerificationStatus: 'SUCCESS',
          },
          {
            IdentityType: 'DOMAIN',
            IdentityName: 'paused.mn',
            SendingEnabled: false,
            VerificationStatus: 'SUCCESS',
          },
          {
            IdentityType: 'DOMAIN',
            IdentityName: 'pending.mn',
            SendingEnabled: true,
            VerificationStatus: 'PENDING',
          },
          {
            IdentityType: 'EMAIL_ADDRESS',
            IdentityName: 'one@else.mn',
            SendingEnabled: true,
            VerificationStatus: 'SUCCESS',
          },
        ],
      },
    };

    expect(await t.owner().emails.checkDomains({})).toMatchObject({
      verifiedDomains: ['acme.mn'],
      domainsError: null,
    });
  });

  it('lets a broadcast go out from an address on a verified domain only', async () => {
    const owner = t.owner();

    await useSendgrid();
    sendgridDomains([{ domain: 'acme.mn', valid: true }]);
    await owner.emails.checkDomains({});

    const draft = await owner.broadcasts.create({
      name: 'From a domain',
      channel: 'email',
      subject: 'Hello',
      content: say('Hello'),
      fromEmail: 'News@Acme.mn',
    });

    expect(draft.fromEmail).toBe('news@acme.mn');
    await expect(
      owner.broadcasts.update({ id: draft.id, fromEmail: 'news@globex.mn' }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });

    // The provider drops the domain: sending refuses the From until it is fixed, a copy drops it.
    sendgridDomains([]);
    await owner.emails.checkDomains({});
    await expect(owner.broadcasts.send({ id: draft.id })).rejects.toMatchObject({
      status: 400,
      code: 'INVALID_INPUT',
    });

    const copy = await owner.broadcasts.duplicate({ id: draft.id });

    expect(copy.fromEmail).toBeNull();
    await owner.broadcasts.remove({ id: copy.id });
    await owner.broadcasts.remove({ id: draft.id });
  });

  it('offers no domain on SaaS, where emails go out from erxes’ address', async () => {
    config.saas.enabled = true;

    expect((await t.owner().emails.sender({})).domains).toEqual([]);
    await expect(
      t.owner().broadcasts.create({
        name: 'SaaS From',
        channel: 'email',
        fromEmail: 'news@acme.mn',
      }),
    ).rejects.toMatchObject({ status: 400, code: 'INVALID_INPUT' });
  });

  it('lets only those who manage integrations ask again', async () => {
    await expect(t.member().emails.checkDomains({})).rejects.toMatchObject({
      status: 403,
      code: 'NOT_ALLOWED',
    });
  });
});
