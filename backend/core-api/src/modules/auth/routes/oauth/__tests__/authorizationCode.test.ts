/**
 * "Sign in with erxes" (authorization code + PKCE): codes reach only
 * registered addresses, are bound to the browser and the verifier, work once,
 * and turn into RS256 tokens that verify with the published keys.
 */
import { createHash, createPublicKey, JsonWebKey } from 'crypto';
import express from 'express';
import cookieParser from 'cookie-parser';
import { Server } from 'http';
import { AddressInfo } from 'net';
import * as jwt from 'jsonwebtoken';

const mockStore = new Map<string, string>();
const mockStartSession = jest.fn();
const mockPasswordLogin = jest.fn();
const mockTwoFactorLogin = jest.fn();
const mockActiveSession = jest.fn();
const mockRefreshTokens: Record<string, unknown>[] = [];
const mockSupportUsers = new Set<string>();

jest.mock('erxes-api-shared/utils', () => ({
  ...jest.requireActual('erxes-api-shared/utils/errorClassifier'),
  getEnv: ({ name, defaultValue }: { name: string; defaultValue?: string }) =>
    process.env[name] || defaultValue || '',
  getSubdomain: () => 'acme',
  logHandler: (run: () => unknown) => run(),
  extractUserFromHeader: () => null,
  getActivePlugins: async () => [],
  getPlugin: async () => ({}),
  redis: {
    get: async (key: string) => mockStore.get(key) ?? null,
    set: async (key: string, value: string) => {
      mockStore.set(key, value);
      return 'OK';
    },
    del: async (key: string) => (mockStore.delete(key) ? 1 : 0),
    incr: async (key: string) => {
      const next = Number(mockStore.get(key) ?? 0) + 1;
      mockStore.set(key, String(next));
      return next;
    },
    expire: async () => 1,
    multi: () => {
      const steps: (() => unknown)[] = [];
      const chain = {
        get: (key: string) => {
          steps.push(() => mockStore.get(key) ?? null);
          return chain;
        },
        del: (key: string) => {
          steps.push(() => (mockStore.delete(key) ? 1 : 0));
          return chain;
        },
        exec: async () => steps.map((step) => [null, step()]),
      };
      return chain;
    },
  },
}));

jest.mock('erxes-api-shared/core-modules', () => ({
  canGroup: jest.fn(),
  hasDeclaredOAuthScopes: jest.fn(),
  resolveActionOAuthScopes: jest.fn(),
}));

const member = { _id: 'u1', email: 'bat@example.local', isActive: true };
const client = {
  clientId: 'hr-app',
  name: 'HR',
  type: 'public',
  status: 'active',
  redirectUrls: ['https://hr.example.local/auth/callback'],
};

const lean = <T>(value: T) => {
  const found = Promise.resolve(value);
  return Object.assign(found, { lean: () => found });
};

jest.mock('~/connectionResolvers', () => ({
  generateModels: async () => ({
    OAuthClientApps: {
      findOne: (query: { clientId: string }) =>
        lean(query.clientId === client.clientId ? client : null),
      updateOne: jest.fn(),
    },
    Users: {
      findOne: (query: { _id: string }) =>
        lean(query._id === member._id ? member : null),
      isSupportUser: async (userId: string) => mockSupportUsers.has(userId),
      getTokenFields: async () => ({ _id: member._id, email: member.email }),
    },
    Configs: {
      findOne: () => lean({ code: 'INSTALLATION_ID', value: 'install-1' }),
    },
    OAuthRefreshTokens: {
      create: async (doc: Record<string, unknown>) => {
        mockRefreshTokens.push(doc);
        return doc;
      },
      findOne: async (query: { tokenHash: string }) =>
        mockRefreshTokens.find((doc) => doc.tokenHash === query.tokenHash) ??
        null,
      updateOne: jest.fn(),
    },
  }),
}));

jest.mock('@/auth/session', () => ({
  startSession: (params: unknown) => mockStartSession(params),
  readActiveSession: (...args: unknown[]) => mockActiveSession(...args),
  readSessionCookie: (cookies?: Record<string, string>) =>
    cookies?.['erxes-sid'] ?? '',
}));

jest.mock('@/auth/staffLogin', () => ({
  staffPasswordLogin: (params: unknown) => mockPasswordLogin(params),
  staffTwoFactorLogin: (params: unknown) => mockTwoFactorLogin(params),
  afterStaffLogin: jest.fn(),
}));

jest.mock('@/auth/utils', () => ({ getRequestIp: () => '10.0.0.1' }));

import { router } from '@/auth/routes/oauth/routes';
import { resetSigningKey } from '@/auth/routes/oauth/productTokens';
import {
  resetPlatformClients,
  resolveRedirectUrls,
} from '@/auth/routes/oauth/platformClients';

const verifier = 'v'.repeat(43) + '-._~0123456789';
const challenge = createHash('sha256').update(verifier).digest('base64url');
const redirectUri = client.redirectUrls[0];

let server: Server;
let base: string;

beforeAll(async () => {
  process.env.OAUTH_ISSUER = 'https://erxes.example.local';
  resetSigningKey();
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);

  const app = express();
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(router);
  server = app.listen(0);
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

beforeEach(() => {
  mockStore.clear();
  mockRefreshTokens.length = 0;
  mockSupportUsers.clear();
  jest.clearAllMocks();
  mockActiveSession.mockResolvedValue(null);
});

const authorizeUrl = (params: Record<string, string> = {}) => {
  const url = new URL(`${base}/oauth/authorize`);
  const query = {
    response_type: 'code',
    client_id: client.clientId,
    redirect_uri: redirectUri,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state: 'state-1',
    ...params,
  };

  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value);
  }

  return url.toString();
};

const startSignIn = async () => {
  const response = await fetch(authorizeUrl(), { redirect: 'manual' });
  const html = await response.text();
  const requestId = /name="request" value="([^"]+)"/.exec(html)?.[1] ?? '';
  const cookie = (response.headers.get('set-cookie') ?? '').split(';')[0];

  return { response, html, requestId, cookie };
};

const post = (path: string, body: Record<string, string>, cookie = '') =>
  fetch(`${base}${path}`, {
    method: 'POST',
    redirect: 'manual',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      ...(cookie ? { cookie } : {}),
    },
    body: new URLSearchParams(body).toString(),
  });

const codeFrom = (response: Response) => {
  const location = new URL(response.headers.get('location') ?? '');

  return { location, code: location.searchParams.get('code') ?? '' };
};

const exchange = (body: Record<string, string>) =>
  fetch(`${base}/oauth/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: client.clientId,
      redirect_uri: redirectUri,
      code_verifier: verifier,
      ...body,
    }),
  });

const verifyWithJwks = async (token: string) => {
  const jwks = (await (
    await fetch(`${base}/.well-known/jwks.json`)
  ).json()) as {
    keys: (JsonWebKey & { kid: string })[];
  };
  const { header } = jwt.decode(token, { complete: true }) ?? {};
  const key = jwks.keys.find((item) => item.kid === header?.kid);

  return jwt.verify(
    token,
    createPublicKey({ key: key as JsonWebKey, format: 'jwk' }),
    {
      algorithms: ['RS256'],
      issuer: 'https://erxes.example.local',
      audience: client.clientId,
    },
  ) as jwt.JwtPayload;
};

describe('authorize', () => {
  it('never redirects to an address the client did not register', async () => {
    const response = await fetch(
      authorizeUrl({ redirect_uri: 'https://evil.example/callback' }),
      { redirect: 'manual' },
    );

    expect(response.status).toBe(400);
    expect(response.headers.get('location')).toBeNull();
  });

  it('requires PKCE with S256', async () => {
    const plain = await fetch(
      authorizeUrl({ code_challenge_method: 'plain' }),
      {
        redirect: 'manual',
      },
    );

    expect(plain.status).toBe(400);
  });

  it('shows the sign-in form, bound to the browser by a cookie', async () => {
    const { response, html, requestId, cookie } = await startSignIn();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-security-policy')).toContain(
      "frame-ancestors 'none'",
    );
    expect(html).toContain('Sign in with erxes');
    expect(requestId).toBeTruthy();
    expect(cookie).toBe(`erxes-oauth-request=${requestId}`);
  });

  it('refuses a form posted without the matching browser cookie', async () => {
    const { requestId } = await startSignIn();

    const response = await post('/oauth/authorize/login', {
      request: requestId,
      email: 'bat@example.local',
      password: 'secret',
    });

    expect(response.status).toBe(400);
    expect(mockPasswordLogin).not.toHaveBeenCalled();
  });

  it('signs in, starts the erxes session and returns a code with the state', async () => {
    mockPasswordLogin.mockResolvedValue({
      status: 'loggedIn',
      user: member,
      method: 'password',
    });
    const { requestId, cookie } = await startSignIn();

    const response = await post(
      '/oauth/authorize/login',
      { request: requestId, email: 'bat@example.local', password: 'secret' },
      cookie,
    );
    const { location, code } = codeFrom(response);

    expect(response.status).toBe(303);
    expect(location.origin + location.pathname).toBe(redirectUri);
    expect(location.searchParams.get('state')).toBe('state-1');
    expect(code).toBeTruthy();
    expect(mockStartSession).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'u1', method: 'password' }),
    );
  });

  it('shows the error and keeps the form on a wrong password', async () => {
    const { LoginError } = jest.requireActual('@/auth/loginError');
    mockPasswordLogin.mockRejectedValue(new LoginError('invalid_credentials'));
    const { requestId, cookie } = await startSignIn();

    const response = await post(
      '/oauth/authorize/login',
      { request: requestId, email: 'bat@example.local', password: 'nope' },
      cookie,
    );

    expect(response.status).toBe(401);
    expect(await response.text()).toContain('Invalid login');
    expect(mockStartSession).not.toHaveBeenCalled();
  });

  it('asks for the two-factor code before handing out a code', async () => {
    mockPasswordLogin.mockResolvedValue({
      status: 'two_factor_required',
      challenge: 'challenge-1',
    });
    mockTwoFactorLogin.mockResolvedValue({
      user: member,
      method: 'password',
      recoveryCodes: [],
    });
    const { requestId, cookie } = await startSignIn();

    const first = await post(
      '/oauth/authorize/login',
      { request: requestId, email: 'bat@example.local', password: 'secret' },
      cookie,
    );

    expect(first.status).toBe(200);
    expect(await first.text()).toContain(
      'name="challenge" value="challenge-1"',
    );
    expect(mockStartSession).not.toHaveBeenCalled();

    const second = await post(
      '/oauth/authorize/two-factor',
      { request: requestId, challenge: 'challenge-1', code: '123456' },
      cookie,
    );

    expect(second.status).toBe(303);
    expect(codeFrom(second).code).toBeTruthy();
    expect(mockTwoFactorLogin).toHaveBeenCalledWith(
      expect.objectContaining({ challenge: 'challenge-1', code: '123456' }),
    );
  });

  it('reuses an erxes session without asking again', async () => {
    mockActiveSession.mockResolvedValue({ userId: 'u1' });

    const response = await fetch(authorizeUrl(), {
      redirect: 'manual',
      headers: { cookie: 'erxes-sid=sid-1' },
    });

    expect(response.status).toBe(303);
    expect(codeFrom(response).code).toBeTruthy();
  });

  it('does not open apps during support access', async () => {
    mockSupportUsers.add('u1');
    mockPasswordLogin.mockResolvedValue({
      status: 'loggedIn',
      user: member,
      method: 'support',
    });
    const { requestId, cookie } = await startSignIn();

    const response = await post(
      '/oauth/authorize/login',
      { request: requestId, email: 'bat@example.local', password: 'secret' },
      cookie,
    );

    expect(response.status).toBe(403);
    expect(response.headers.get('location')).toBeNull();
  });
});

describe('token exchange', () => {
  const signedInCode = async () => {
    mockActiveSession.mockResolvedValue({ userId: 'u1' });
    const response = await fetch(authorizeUrl(), {
      redirect: 'manual',
      headers: { cookie: 'erxes-sid=sid-1' },
    });

    return codeFrom(response).code;
  };

  it('trades a code once for an RS256 token that verifies with the JWKS', async () => {
    const code = await signedInCode();

    const response = await exchange({ code });
    const body = (await response.json()) as {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
    const claims = await verifyWithJwks(body.accessToken);

    expect(response.status).toBe(200);
    expect(body.expiresIn).toBe(15 * 60);
    expect(claims).toMatchObject({
      typ: 'erxes_access',
      sub: 'u1',
      tid: 'acme',
      oid: 'install-1',
      user: { email: 'bat@example.local' },
    });
    expect(mockRefreshTokens[0]).toMatchObject({
      format: 'jwt',
      clientId: 'hr-app',
    });

    const replay = await exchange({ code });

    expect(replay.status).toBe(400);
    expect(await replay.json()).toEqual({ error: 'invalid_grant' });
  });

  it('refuses a wrong verifier or a different redirect address', async () => {
    const wrongVerifier = await exchange({
      code: await signedInCode(),
      code_verifier: 'w'.repeat(43),
    });
    const wrongRedirect = await exchange({
      code: await signedInCode(),
      redirect_uri: 'https://hr.example.local/other',
    });

    expect(wrongVerifier.status).toBe(400);
    expect(wrongRedirect.status).toBe(400);
  });

  it('refreshes into a new RS256 token', async () => {
    const first = (await (
      await exchange({ code: await signedInCode() })
    ).json()) as {
      refreshToken: string;
    };

    const response = await fetch(`${base}/oauth/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        client_id: client.clientId,
        refresh_token: first.refreshToken,
      }),
    });
    const body = (await response.json()) as { accessToken: string };

    expect(response.status).toBe(200);
    expect((await verifyWithJwks(body.accessToken)).sub).toBe('u1');
    expect(mockRefreshTokens[1]).toMatchObject({ format: 'jwt' });
  });
});

describe('platform clients (one registration for every organisation)', () => {
  const secret = 'platform-secret';
  const platformRedirect = 'https://acme.hr.erxes.io/auth/callback';

  beforeAll(() => {
    process.env.OAUTH_PLATFORM_CLIENTS = JSON.stringify([
      {
        clientId: 'erxes-hr',
        name: 'HR',
        type: 'confidential',
        secretHash: createHash('sha256').update(secret).digest('hex'),
        redirectUrls: ['https://{subdomain}.hr.erxes.io/auth/callback'],
      },
    ]);
    resetPlatformClients();
  });

  afterAll(() => {
    delete process.env.OAUTH_PLATFORM_CLIENTS;
    resetPlatformClients();
  });

  const platformAuthorize = (redirect: string) =>
    authorizeUrl({ client_id: 'erxes-hr', redirect_uri: redirect });

  it("accepts the organisation's own address from the {subdomain} template", async () => {
    const response = await fetch(platformAuthorize(platformRedirect), {
      redirect: 'manual',
    });

    expect(response.status).toBe(200);
    expect(await response.text()).toContain('<strong>HR</strong>');
  });

  it("refuses another organisation's address", async () => {
    const response = await fetch(
      platformAuthorize('https://beta.hr.erxes.io/auth/callback'),
      { redirect: 'manual' },
    );

    expect(response.status).toBe(400);
    expect(response.headers.get('location')).toBeNull();
  });

  it('exchanges a code only with the platform secret', async () => {
    mockActiveSession.mockResolvedValue({ userId: 'u1' });
    const signedIn = async () =>
      codeFrom(
        await fetch(platformAuthorize(platformRedirect), {
          redirect: 'manual',
          headers: { cookie: 'erxes-sid=sid-1' },
        }),
      ).code;

    const withoutSecret = await exchange({
      client_id: 'erxes-hr',
      redirect_uri: platformRedirect,
      code: await signedIn(),
    });
    const withSecret = await exchange({
      client_id: 'erxes-hr',
      client_secret: secret,
      redirect_uri: platformRedirect,
      code: await signedIn(),
    });
    const body = (await withSecret.json()) as { accessToken: string };

    expect(withoutSecret.status).toBe(401);
    expect(withSecret.status).toBe(200);

    const jwks = (await (
      await fetch(`${base}/.well-known/jwks.json`)
    ).json()) as {
      keys: (JsonWebKey & { kid: string })[];
    };
    const claims = jwt.verify(
      body.accessToken,
      createPublicKey({ key: jwks.keys[0] as JsonWebKey, format: 'jwk' }),
      { algorithms: ['RS256'], audience: 'erxes-hr' },
    ) as jwt.JwtPayload;

    expect(claims).toMatchObject({ tid: 'acme', oid: 'install-1' });
  });

  it('never builds an address from a subdomain that is not a DNS label', () => {
    const template = [
      'https://{subdomain}.hr.erxes.io/auth/callback',
      'https://fixed.example/cb',
    ];

    expect(resolveRedirectUrls(template, 'evil.example/x?')).toEqual([
      'https://fixed.example/cb',
    ]);
    expect(resolveRedirectUrls(template, 'Acme')).toEqual([
      'https://acme.hr.erxes.io/auth/callback',
      'https://fixed.example/cb',
    ]);
  });
});
