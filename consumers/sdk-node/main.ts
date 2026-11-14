// A plugin server built from the packed tarballs: every export of
// @erxes/core-contract and @erxes/plugin-sdk loads in Node, the typed core client
// gets a plugin token and calls core, and verifyCoreEvent accepts core's signed
// event delivery and rejects a changed body. Core is a stub on a local port.
import { CORE_API_PREFIX, type CoreEvent, type Organization } from '@erxes/core-contract';
import { createCoreClient, verifyCoreEvent, type DeliveredEvent } from '@erxes/plugin-sdk';
import { exportJWK, generateKeyPair, SignJWT } from 'jose';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { text } from 'node:stream/consumers';
import { z } from 'zod';

// skipLibCheck hides a .d.ts import that does not resolve, and the type turns into
// `any`. These fail the type check in that case.
// @ts-expect-error a currency is a string
export const wrongCurrency: Organization['currency'] = 1;
// @ts-expect-error the client has no such group
export const wrongGroup = (client: ReturnType<typeof createCoreClient>) => client.forOrg('o').nope;

const Manifest = z.object({ exports: z.record(z.string(), z.unknown()) });

for (const name of ['@erxes/core-contract', '@erxes/plugin-sdk']) {
  const manifest = Manifest.parse(
    JSON.parse(await readFile(new URL(import.meta.resolve(`${name}/package.json`)), 'utf8')),
  );

  for (const subpath of Object.keys(manifest.exports)) {
    if (subpath !== './package.json') await import(`${name}${subpath.slice(1)}`);
  }
}

const plugin = 'consumer';
const clientSecret = 'a'.repeat(32);
const pluginToken = 'plugin-token';
const { publicKey, privateKey } = await generateKeyPair('ES256');
const jwk = { ...(await exportJWK(publicKey)), kid: 'k1', alg: 'ES256', use: 'sig' };

const organization: Organization = {
  id: 'org_1',
  subdomain: 'acme',
  name: 'Acme',
  country: 'MN',
  currency: 'MNT',
  createdAt: new Date().toISOString(),
};

// What core's POST /plugins/token accepts; anything else gets no token.
const TokenRequest = z.object({
  grant_type: z.literal('client_credentials'),
  client_id: z.literal(plugin),
  client_secret: z.literal(clientSecret),
  org: z.literal(organization.id),
});

const core = createServer(async (request, response) => {
  const send = (status: number, body: unknown) =>
    response.writeHead(status, { 'content-type': 'application/json' }).end(JSON.stringify(body));

  switch (`${request.method} ${request.url}`) {
    case `GET ${CORE_API_PREFIX}/.well-known/jwks.json`:
      return send(200, { keys: [jwk] });
    case `POST ${CORE_API_PREFIX}/plugins/token`:
      return TokenRequest.safeParse(JSON.parse(await text(request))).success
        ? send(200, { access_token: pluginToken, expires_in: 900 })
        : send(400, { code: 'INVALID_CLIENT' });
    case `GET ${CORE_API_PREFIX}/organization`:
      return request.headers.authorization === `Bearer ${pluginToken}`
        ? send(200, organization)
        : send(401, { code: 'UNAUTHORIZED' });
    default:
      return send(404, { code: 'NOT_FOUND' });
  }
});

core.listen(0, '127.0.0.1');
await once(core, 'listening');

const address = core.address();

assert(address !== null && typeof address === 'object');

const coreUrl = `http://127.0.0.1:${address.port}`;

try {
  const client = createCoreClient({ coreUrl, plugin, clientSecret });

  assert.deepEqual(await client.forOrg(organization.id).organizations.current(), organization);
  await assert.rejects(
    createCoreClient({ coreUrl, plugin, clientSecret: 'b'.repeat(32) })
      .forOrg(organization.id)
      .organizations.current(),
  );

  const now = new Date().toISOString();
  const data: CoreEvent = {
    id: 'ev_1',
    source: 'core',
    type: 'core.customer.merged',
    version: 1,
    subjectType: 'customer',
    subjectId: 'cu_1',
    entityType: null,
    entityId: null,
    actorType: 'system',
    actorId: null,
    payload: {},
    summary: null,
    link: null,
    occurredAt: now,
    createdAt: now,
  };
  const event: DeliveredEvent = {
    id: data.id,
    type: data.type,
    organizationId: organization.id,
    createdAt: now,
    data,
  };
  const body = JSON.stringify(event);
  const token = await new SignJWT({
    sha: createHash('sha256').update(body).digest('base64url'),
    event: event.id,
    org: event.organizationId,
  })
    .setProtectedHeader({ alg: 'ES256', kid: jwk.kid, typ: 'erxes-core-event+jwt' })
    .setIssuer('erxes-core')
    .setAudience(plugin)
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(privateKey);

  assert.deepEqual(await verifyCoreEvent(`Bearer ${token}`, body, { coreUrl, plugin }), event);
  await assert.rejects(
    verifyCoreEvent(`Bearer ${token}`, body.replace('"version":1', '"version":2'), {
      coreUrl,
      plugin,
    }),
    /the body does not match the token/,
  );

  process.stdout.write('sdk-node: exports load, core client and verifyCoreEvent work\n');
} finally {
  core.close();
}
