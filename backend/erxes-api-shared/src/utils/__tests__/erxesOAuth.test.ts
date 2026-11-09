import { createPublicKey, generateKeyPairSync, KeyObject, sign } from 'crypto';
import {
  createErxesOAuthClient,
  createPkcePair,
  ErxesOAuthError,
} from '../erxes-oauth';

const ISSUER = 'https://erxes.example.local';

const keyPair = (kid: string) => {
  const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const jwk = createPublicKey(privateKey).export({ format: 'jwk' });

  return { kid, privateKey, jwk: { ...jwk, kid, alg: 'RS256', use: 'sig' } };
};

const encode = (value: unknown) =>
  Buffer.from(JSON.stringify(value)).toString('base64url');

const signToken = (
  privateKey: KeyObject,
  kid: string,
  claims: Record<string, unknown>,
  alg = 'RS256',
) => {
  const head = encode({ alg, typ: 'JWT', kid });
  const body = encode({
    typ: 'erxes_access',
    sub: 'u1',
    tid: 'acme',
    aud: 'hr-app',
    iss: ISSUER,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 900,
    user: { _id: 'u1', email: 'bat@example.local' },
    ...claims,
  });
  const signature = sign(
    'RSA-SHA256',
    Buffer.from(`${head}.${body}`),
    privateKey,
  );

  return `${head}.${body}.${signature.toString('base64url')}`;
};

const setup = (initialKeys: ReturnType<typeof keyPair>[]) => {
  let published = initialKeys;
  const calls: { url: string; body?: unknown }[] = [];
  const responses = new Map<string, { status: number; body: unknown }>();

  const fakeFetch = (async (input: string, init?: { body?: string }) => {
    const url = String(input);
    calls.push({ url, body: init?.body ? JSON.parse(init.body) : undefined });

    if (url.endsWith('/.well-known/jwks.json')) {
      return new Response(
        JSON.stringify({ keys: published.map((key) => key.jwk) }),
      );
    }

    const canned = responses.get(url);

    return new Response(JSON.stringify(canned?.body ?? {}), {
      status: canned?.status ?? 404,
    });
  }) as typeof fetch;

  const client = createErxesOAuthClient({
    coreUrl: 'https://erxes.example.local/gateway/',
    issuer: ISSUER,
    clientId: 'hr-app',
    redirectUri: 'https://hr.example.local/auth/callback',
    fetch: fakeFetch,
  });

  return {
    client,
    calls,
    responses,
    publish: (next: ReturnType<typeof keyPair>[]) => {
      published = next;
    },
  };
};

const rejected = async (work: Promise<unknown>) => {
  try {
    await work;
  } catch (error) {
    return error as ErxesOAuthError;
  }

  throw new Error('expected a rejection');
};

describe('erxes OAuth client', () => {
  it('builds the authorize URL with PKCE S256 and the state', () => {
    const { client } = setup([]);
    const { challenge } = createPkcePair();
    const url = new URL(
      client.authorizeUrl({ state: 's1', codeChallenge: challenge }),
    );

    expect(url.origin + url.pathname).toBe(
      'https://erxes.example.local/gateway/oauth/authorize',
    );
    expect(Object.fromEntries(url.searchParams)).toEqual({
      response_type: 'code',
      client_id: 'hr-app',
      redirect_uri: 'https://hr.example.local/auth/callback',
      code_challenge: challenge,
      code_challenge_method: 'S256',
      state: 's1',
    });
  });

  it('accepts a token signed by a published key and returns its claims', async () => {
    const key = keyPair('k1');
    const { client } = setup([key]);

    const claims = await client.verifyAccessToken(
      signToken(key.privateKey, 'k1', {}),
    );

    expect(claims).toMatchObject({
      sub: 'u1',
      tid: 'acme',
      user: { email: 'bat@example.local' },
    });
  });

  it('refuses tokens for another app, issuer or type, expired or tampered ones', async () => {
    const key = keyPair('k1');
    const { client } = setup([key]);
    const bad = [
      signToken(key.privateKey, 'k1', { aud: 'other-app' }),
      signToken(key.privateKey, 'k1', { iss: 'https://evil.example' }),
      signToken(key.privateKey, 'k1', { typ: 'oauth_access' }),
      signToken(key.privateKey, 'k1', {
        exp: Math.floor(Date.now() / 1000) - 3600,
      }),
      signToken(key.privateKey, 'k1', {}).replace(
        /\.[^.]+\./,
        `.${encode({ sub: 'admin' })}.`,
      ),
      signToken(key.privateKey, 'k1', {}, 'HS256'),
      signToken(keyPair('k1').privateKey, 'k1', {}),
    ];

    for (const token of bad) {
      expect((await rejected(client.verifyAccessToken(token))).code).toBe(
        'invalid_token',
      );
    }
  });

  it('picks up a rotated key by refetching on an unknown key id', async () => {
    const first = keyPair('k1');
    const second = keyPair('k2');
    const { client, publish, calls } = setup([first]);

    await client.verifyAccessToken(signToken(first.privateKey, 'k1', {}));
    publish([first, second]);
    await client.verifyAccessToken(signToken(second.privateKey, 'k2', {}));

    expect(calls.filter((call) => call.url.endsWith('jwks.json'))).toHaveLength(
      2,
    );
  });

  it('exchanges a code and reports why a refresh was refused', async () => {
    const { client, calls, responses } = setup([]);
    const tokenUrl = 'https://erxes.example.local/gateway/oauth/token';

    responses.set(tokenUrl, {
      status: 200,
      body: {
        accessToken: 'a',
        refreshToken: 'r',
        expiresIn: 900,
        user: { _id: 'u1' },
      },
    });

    await expect(
      client.exchangeCode('code-1', 'verifier-1'),
    ).resolves.toMatchObject({
      accessToken: 'a',
      refreshToken: 'r',
      expiresIn: 900,
    });
    expect(calls.at(-1)?.body).toEqual({
      client_id: 'hr-app',
      grant_type: 'authorization_code',
      code: 'code-1',
      code_verifier: 'verifier-1',
      redirect_uri: 'https://hr.example.local/auth/callback',
    });

    responses.set(tokenUrl, { status: 401, body: { error: 'invalid_grant' } });

    expect(await rejected(client.refresh('old'))).toMatchObject({
      code: 'invalid_grant',
      status: 401,
    });
  });
});
