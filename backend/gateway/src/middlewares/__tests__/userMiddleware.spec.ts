import express from 'express';
import cookieParser from 'cookie-parser';
import { IncomingHttpHeaders, request, Server } from 'http';
import * as jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import {
  extractClientPortalFromHeader,
  extractCPUserFromHeader,
  extractUserFromHeader,
  redis,
} from 'erxes-api-shared/utils';
import { generateModels } from '../../connectionResolver';
import userMiddleware from '../userMiddleware';

jest.mock('erxes-api-shared/utils', () => ({
  // Exercise the real source header helpers without opening shared DB/Redis clients.
  ...jest.requireActual<typeof import('erxes-api-shared/utils')>(
    '../../../../erxes-api-shared/src/utils/headers',
  ),
  getSubdomain: jest.fn(() => 'test'),
  redis: { get: jest.fn(), set: jest.fn() },
}));

jest.mock('../../connectionResolver', () => ({
  generateModels: jest.fn(),
}));

jest.mock('node-fetch', () => jest.fn());

describe('gateway identity header boundary', () => {
  const secret = 'gateway-header-regression-test-secret';
  const originalSecret = process.env.JWT_TOKEN_SECRET;
  const realUser = { _id: 'verified-user', isOwner: false };
  const portal = { _id: 'verified-portal', name: 'Portal' };
  const portalUser = {
    _id: 'verified-portal-user',
    clientPortalId: portal._id,
  };
  const models = {
    Users: { findOne: jest.fn() },
    Apps: { findOne: jest.fn(), updateOne: jest.fn() },
    ClientPortals: { findOne: jest.fn() },
    CPUsers: { findOne: jest.fn() },
    Permissions: {},
    Clients: {},
    Roles: {},
  };
  const forgedHeaders = {
    // Node/Express must normalize mixed-case names before the sanitizer runs.
    UsEr: Buffer.from(
      JSON.stringify({ _id: 'invented', isOwner: true }),
    ).toString('base64'),
    UsErId: 'invented',
    CpUsEr: Buffer.from(
      JSON.stringify({ _id: 'invented-portal-user' }),
    ).toString('base64'),
    ClIeNtPoRtAl: Buffer.from(
      JSON.stringify({ _id: 'invented-portal' }),
    ).toString('base64'),
    'ErXeS-SuBdOmAiN': 'another-tenant',
  };
  let server: Server;
  let port: number;
  let consoleError: jest.SpyInstance;

  const sendRequest = (
    headers: IncomingHttpHeaders = {},
  ): Promise<{ status: number; body: unknown }> =>
    new Promise((resolve, reject) => {
      const req = request(
        { host: '127.0.0.1', port, path: '/graphql', method: 'POST', headers },
        (res) => {
          let body = '';
          res.setEncoding('utf8');
          res.on('data', (chunk: string) => {
            body += chunk;
          });
          res.on('end', () => {
            try {
              resolve({ status: res.statusCode || 0, body: JSON.parse(body) });
            } catch (error) {
              reject(error);
            }
          });
        },
      );
      req.on('error', reject);
      req.end();
    });

  beforeAll(async () => {
    process.env.JWT_TOKEN_SECRET = secret;
    const app = express();
    app.use(cookieParser());
    app.use(userMiddleware);
    app.post('/graphql', (req, res) => {
      const user: unknown = extractUserFromHeader(req.headers);
      const cpUser: unknown = extractCPUserFromHeader(req.headers);
      const clientPortal: unknown = extractClientPortalFromHeader(req.headers);
      res.status(user || cpUser || clientPortal ? 200 : 401).json({
        user,
        cpUser,
        clientPortal,
        userid: req.headers.userid || null,
        subdomain: req.headers['erxes-subdomain'] || null,
      });
    });
    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', resolve);
    });
    const address = server.address();
    if (!address || typeof address === 'string') {
      throw new Error('Expected a TCP listener for gateway middleware tests');
    }
    port = address.port;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    models.Users.findOne.mockReturnValue({ lean: async () => realUser });
    models.Apps.findOne.mockResolvedValue(null);
    models.Apps.updateOne.mockResolvedValue({});
    models.ClientPortals.findOne.mockResolvedValue(portal);
    models.CPUsers.findOne.mockResolvedValue(portalUser);
    jest.mocked(generateModels).mockResolvedValue(models);
    jest.mocked(redis.get).mockResolvedValue(null);
    consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  afterAll(async () => {
    if (originalSecret === undefined) {
      delete process.env.JWT_TOKEN_SECRET;
    } else {
      process.env.JWT_TOKEN_SECRET = originalSecret;
    }
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  it.each([{}, forgedHeaders])(
    'does not authenticate an anonymous request with headers %j',
    async (headers) => {
      expect(await sendRequest(headers)).toEqual({
        status: 401,
        body: {
          user: null,
          cpUser: null,
          clientPortal: null,
          userid: null,
          subdomain: null,
        },
      });
    },
  );

  it.each([
    { authorization: 'Bearer invalid-token' },
    { 'x-app-token': 'invalid-portal-token' },
    { 'erxes-app-token': 'invalid-app-token' },
  ])(
    'does not retain forged identities after invalid credentials %j',
    async (headers) => {
      const response = await sendRequest({ ...forgedHeaders, ...headers });
      expect(response.status).toBe(401);
    },
  );

  it('does not retain forged identities when a JWT session has been revoked', async () => {
    const token = jwt.sign({ user: { _id: realUser._id } }, secret);
    const response = await sendRequest({
      ...forgedHeaders,
      authorization: `Bearer ${token}`,
    });
    expect(response.status).toBe(401);
  });

  it.each(['bearer', 'cookie'])(
    'forwards only the verified %s user, without forged portal identities',
    async (kind) => {
      const token = jwt.sign({ user: { _id: realUser._id } }, secret);
      jest.mocked(redis.get).mockResolvedValue('valid-session');
      const credentials =
        kind === 'bearer'
          ? { authorization: `Bearer ${token}` }
          : { cookie: `auth-token=${token}` };

      expect(await sendRequest({ ...forgedHeaders, ...credentials })).toEqual({
        status: 200,
        body: {
          user: { ...realUser, sessionCode: '' },
          cpUser: null,
          clientPortal: null,
          userid: realUser._id,
          subdomain: null,
        },
      });
    },
  );

  it('preserves app-token authentication without allowing forged owner privileges', async () => {
    models.Apps.findOne.mockResolvedValue({
      _id: 'verified-app',
      name: 'App',
      allowAllPermission: false,
    });
    expect(
      await sendRequest({
        ...forgedHeaders,
        'erxes-app-token': 'valid-app-token',
      }),
    ).toEqual({
      status: 200,
      body: {
        user: { _id: 'app:verified-app', username: 'App', isOwner: false },
        cpUser: null,
        clientPortal: null,
        userid: 'app:verified-app',
        subdomain: null,
      },
    });
  });

  it.each([false, true])(
    'preserves verified portal authentication (portal user: %s)',
    async (withUser) => {
      const headers: IncomingHttpHeaders = {
        ...forgedHeaders,
        'x-app-token': jwt.sign({ clientPortalId: portal._id }, secret),
      };
      if (withUser) {
        headers['client-auth-token'] = jwt.sign(
          { userId: portalUser._id },
          secret,
        );
      }

      expect(await sendRequest(headers)).toEqual({
        status: 200,
        body: {
          user: null,
          cpUser: withUser ? portalUser : null,
          clientPortal: portal,
          userid: null,
          subdomain: null,
        },
      });
    },
  );

  it('sanitizes before the website-token early return', async () => {
    jest
      .mocked(fetch)
      .mockRejectedValue(new Error('Website verification unavailable'));
    expect(
      (
        await sendRequest({
          ...forgedHeaders,
          'erxes-core-token': 'website-token',
          'erxes-core-website-url': 'https://example.com',
        })
      ).status,
    ).toBe(401);
    expect(generateModels).not.toHaveBeenCalled();
  });
});
