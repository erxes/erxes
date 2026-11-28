import { once } from 'node:events';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { type CryptoKey, decodeJwt, exportJWK, generateKeyPair, SignJWT } from 'jose';
import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { z } from 'zod';
import { config } from '~/config';
import { fetchLicense } from '~/modules/license/activation';
import { ERXES_LICENSE_KEYS } from '~/modules/license/keys';
import { useTestDatabase } from './db';
import { useTwoOrgs } from './support';

const KID = 'erxes-license-v1';
const KEY = `os_${'5'.repeat(64)}`;
const DAY = 24 * 60 * 60 * 1000;

/** What core reports on its daily call. */
const Report = z.object({
  version: z.string(),
  members: z.number(),
  organizations: z.number(),
  plugins: z.array(z.string()),
});

/** What the fake erxes.io received on its last call. */
interface Received {
  authorization: string | undefined;
  report: z.infer<typeof Report>;
}

/** Until a test says how, the fake erxes.io fails. */
const failing = (res: ServerResponse) => {
  res.writeHead(500).end();
};

describe('the erxes license fetched with an activation key (self-hosted)', () => {
  useTestDatabase();

  const t = useTwoOrgs();
  let erxesKey: CryptoKey;
  let strangerKey: CryptoKey;
  let issuer: Server;
  let received: Received | undefined;
  /** How the fake erxes.io answers its next call. */
  let answer: (res: ServerResponse) => void = failing;

  /** Its last call; a function, so a test reads it after the call instead of what it reset. */
  const lastCall = () => received;

  beforeAll(async () => {
    const pair = await generateKeyPair('ES256', { extractable: true });
    const { x = '', y = '' } = await exportJWK(pair.publicKey);

    erxesKey = pair.privateKey;
    strangerKey = (await generateKeyPair('ES256')).privateKey;

    issuer = createServer((req: IncomingMessage, res: ServerResponse) => {
      const chunks: Buffer[] = [];

      req.on('data', (chunk: Buffer) => chunks.push(chunk));
      req.on('end', () => {
        received =
          req.url === '/api/self-hosted/license' && req.method === 'POST'
            ? {
                authorization: req.headers.authorization,
                report: Report.parse(JSON.parse(Buffer.concat(chunks).toString('utf8'))),
              }
            : undefined;
        answer(res);
      });
    }).listen(0, '127.0.0.1');
    await once(issuer, 'listening');

    const address = issuer.address();

    if (!address || typeof address === 'string') throw new Error('not listening on a port');

    Object.assign(config.license, {
      token: undefined,
      keys: [{ kty: 'EC', crv: 'P-256', kid: KID, x, y }],
      activationKey: KEY,
      issuer: `http://127.0.0.1:${address.port}`,
    });
  });

  afterAll(async () => {
    Object.assign(config.license, {
      token: undefined,
      keys: ERXES_LICENSE_KEYS,
      activationKey: undefined,
    });
    issuer.closeAllConnections();
    await new Promise<void>((resolve) => issuer.close(() => resolve()));
  });

  /** A license as erxes.io issues one, for these plugins, ending `until`. */
  const license = (plugins: string[], until: Date, key = erxesKey) =>
    new SignJWT({ name: 'Acme LLC', plugins, until: until.toISOString() })
      .setProtectedHeader({ alg: 'ES256', kid: KID, typ: 'erxes-license+jwt' })
      .setIssuer('erxes')
      .setSubject('server-1')
      .setIssuedAt()
      .sign(key);

  const answerWith = (status: number, body?: unknown) => {
    answer = (res) => {
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(body === undefined ? '' : JSON.stringify(body));
    };
  };

  const registerHr = async () =>
    t
      .client(await t.pluginToken())
      .plugins.registerManifest({ title: 'HR', version: '9', requiresLicense: true });

  const accessNow = async () =>
    decodeJwt((await t.member().plugins.session({ name: 'hr' })).token).access;

  /** After a failed fetch: the license kept, and why the fetch failed. */
  const kept = async () => {
    const status = await t.member().license.status({});

    expect(status.license?.plugins).toEqual(['hr']);

    return status.checkError;
  };

  it('takes the license erxes.io has for the server, and tells it what the server runs', async () => {
    await registerHr();
    answerWith(200, { license: await license(['hr'], new Date(Date.now() + 365 * DAY)) });

    await fetchLicense();

    expect(lastCall()?.authorization).toBe(`Bearer ${KEY}`);
    expect(lastCall()?.report).toMatchObject({ version: config.version, organizations: 2 });
    expect(lastCall()?.report.members).toBeGreaterThan(0);
    expect(lastCall()?.report.plugins).toContain('hr');

    await expect(accessNow()).resolves.toBe('full');
    await expect(t.member().license.status({})).resolves.toMatchObject({
      saas: false,
      source: 'activation',
      license: { customer: 'Acme LLC', plugins: ['hr'], graceDays: 14 },
      checkError: null,
      plugins: [{ name: 'hr', title: 'HR', access: 'full' }],
    });
  });

  it('keeps the last license when erxes.io fails or sends what it can’t use, and says why', async () => {
    await registerHr();
    answerWith(200, { license: await license(['hr'], new Date(Date.now() + 365 * DAY)) });
    await fetchLicense();

    answerWith(500);
    await fetchLicense();
    await expect(accessNow()).resolves.toBe('full');
    await expect(kept()).resolves.toContain('erxes.io answered 500');

    // Signed by a key this core doesn't have, as a newer release's would be.
    answerWith(200, {
      license: await license(['hr'], new Date(Date.now() + 365 * DAY), strangerKey),
    });
    await fetchLicense();
    await expect(accessNow()).resolves.toBe('full');
    await expect(kept()).resolves.toContain('cannot verify: update core');

    answerWith(401, { error: 'Unauthorized' });
    await fetchLicense();
    await expect(kept()).resolves.toContain('does not know this activation key');
  });

  it('stops the plugins when erxes.io has no license for the server any more', async () => {
    await registerHr();
    answerWith(200, { license: await license(['hr'], new Date(Date.now() + 365 * DAY)) });
    await fetchLicense();

    answerWith(200, { license: null });
    await fetchLicense();

    await expect(accessNow()).rejects.toMatchObject({ code: 'NOT_IN_PLAN' });
    await expect(t.member().license.status({})).resolves.toMatchObject({
      license: null,
      checkError: null,
      plugins: [{ name: 'hr', access: 'off' }],
    });
  });

  it('runs on ERXES_LICENSE, given by hand, over the fetched one', async () => {
    await registerHr();
    answerWith(200, { license: await license(['hr'], new Date(Date.now() + 365 * DAY)) });
    await fetchLicense();

    config.license.token = await license(['hr'], new Date(Date.now() - DAY));

    try {
      await expect(accessNow()).resolves.toBe('read_only');
      await expect(t.member().license.status({})).resolves.toMatchObject({ source: 'file' });
    } finally {
      config.license.token = undefined;
    }
  });

  it('asks erxes.io again on request, only for who manages plugins', async () => {
    await registerHr();
    answerWith(200, { license: await license(['hr'], new Date(Date.now() + 30 * DAY)) });
    received = undefined;

    await expect(t.member().license.refresh({})).rejects.toMatchObject({ code: 'NOT_ALLOWED' });
    expect(lastCall()).toBeUndefined();

    await expect(t.owner().license.refresh({})).resolves.toMatchObject({
      source: 'activation',
      license: { plugins: ['hr'] },
    });
    expect(lastCall()?.authorization).toBe(`Bearer ${KEY}`);
  });
});
