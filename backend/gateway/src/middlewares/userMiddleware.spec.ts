import {
  clientPortalHeaderName,
  cpUserHeaderName,
  userHeaderName,
} from '../../../erxes-api-shared/src/utils/headers/user';
import { erxesSubdomainHeaderName } from '../../../erxes-api-shared/src/utils/headers/subdomain';
import { sanitizeHeaders } from '../../../erxes-api-shared/src/utils/headers/sanitize';

jest.mock('node-fetch', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('jsonwebtoken', () => {
  class TokenExpiredError extends Error {}

  return {
    verify: jest.fn(),
    TokenExpiredError,
  };
});

jest.mock('../connectionResolver', () => ({
  generateModels: jest.fn(),
}));

jest.mock('erxes-api-shared/utils', () => {
  const sanitizeModule = jest.requireActual(
    '../../../erxes-api-shared/src/utils/headers/sanitize',
  );
  const userHeaderModule = jest.requireActual(
    '../../../erxes-api-shared/src/utils/headers/user',
  );

  return {
    getSubdomain: jest.fn(() => 'localhost'),
    redis: {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    },
    sanitizeHeaders: sanitizeModule.sanitizeHeaders,
    setClientPortalHeader: userHeaderModule.setClientPortalHeader,
    setCPUserHeader: userHeaderModule.setCPUserHeader,
    setUserHeader: userHeaderModule.setUserHeader,
  };
});

import * as jwt from 'jsonwebtoken';
import userMiddleware from './userMiddleware';
import { generateModels } from '../connectionResolver';
import * as sharedUtils from 'erxes-api-shared/utils';

const mockedJwtVerify = jwt.verify as jest.MockedFunction<typeof jwt.verify>;
const mockedGenerateModels = generateModels as jest.MockedFunction<
  typeof generateModels
>;
const mockedGetSubdomain = sharedUtils.getSubdomain as jest.MockedFunction<
  typeof sharedUtils.getSubdomain
>;
const mockedRedis = sharedUtils.redis as unknown as {
  get: jest.Mock;
  set: jest.Mock;
  del: jest.Mock;
};

const decodeHeader = (value?: string | string[]) => {
  if (!value || Array.isArray(value)) {
    return null;
  }

  return JSON.parse(Buffer.from(value, 'base64').toString('utf8'));
};

const createReq = () =>
  ({
    headers: {
      host: 'localhost:4000',
    },
    cookies: {},
  }) as any;

const createRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('sanitizeHeaders', () => {
  it('removes internal auth headers and preserves unrelated headers', () => {
    const headers: Record<string, string> = {
      host: 'localhost:4000',
      [erxesSubdomainHeaderName]: 'tenant',
      [userHeaderName]: 'forged-user',
      userid: 'forged-id',
      [clientPortalHeaderName]: 'forged-clientportal',
      [cpUserHeaderName]: 'forged-cpuser',
      authorization: 'Bearer keep-me',
    };

    sanitizeHeaders(headers);

    expect(headers).toEqual({
      host: 'localhost:4000',
      authorization: 'Bearer keep-me',
    });
  });
});

describe('userMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetSubdomain.mockReturnValue('localhost');
    mockedGenerateModels.mockResolvedValue({} as any);
    mockedRedis.get.mockResolvedValue(null);
  });

  it('strips forged internal auth headers for unauthenticated requests', async () => {
    const req = createReq();
    req.headers[userHeaderName] = 'forged-user';
    req.headers.userid = 'forged-id';
    req.headers[clientPortalHeaderName] = 'forged-clientportal';
    req.headers[cpUserHeaderName] = 'forged-cpuser';
    req.headers[erxesSubdomainHeaderName] = 'forged-subdomain';
    const res = createRes();
    const next = jest.fn();

    await userMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toBeUndefined();
    expect(req.headers[userHeaderName]).toBeUndefined();
    expect(req.headers.userid).toBeUndefined();
    expect(req.headers[clientPortalHeaderName]).toBeUndefined();
    expect(req.headers[cpUserHeaderName]).toBeUndefined();
    expect(req.headers[erxesSubdomainHeaderName]).toBeUndefined();
  });

  it('repopulates trusted user headers after validating the auth cookie', async () => {
    const req = createReq();
    req.cookies['auth-token'] = 'valid-auth-token';
    req.headers[userHeaderName] = Buffer.from(
      JSON.stringify({ _id: 'attacker', isOwner: true }),
      'utf8',
    ).toString('base64');
    req.headers.userid = 'attacker';

    const userDoc = {
      _id: 'real-user',
      email: 'real@erxes.io',
      isOwner: false,
      permissionGroupIds: ['core:viewer'],
    };

    mockedGenerateModels.mockResolvedValue({
      Users: {
        findOne: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(userDoc),
        }),
      },
    } as any);
    mockedJwtVerify.mockReturnValue({
      user: { _id: 'real-user' },
    } as any);
    mockedRedis.get
      .mockResolvedValueOnce('1')
      .mockResolvedValueOnce(null);

    const res = createRes();
    const next = jest.fn();

    await userMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toMatchObject({
      _id: 'real-user',
      email: 'real@erxes.io',
      loginToken: 'valid-auth-token',
      sessionCode: '',
    });
    expect(req.headers.userid).toBe('real-user');
    expect(decodeHeader(req.headers[userHeaderName])).toMatchObject({
      _id: 'real-user',
      email: 'real@erxes.io',
      isOwner: false,
      permissionGroupIds: ['core:viewer'],
      loginToken: 'valid-auth-token',
    });
    expect(mockedRedis.set).toHaveBeenCalledWith(
      'hostname',
      expect.any(String),
    );
  });

  it('repopulates trusted client portal headers after validating portal tokens', async () => {
    const req = createReq();
    req.headers['x-app-token'] = 'valid-client-portal-token';
    req.headers['client-auth-token'] = 'valid-client-auth-token';
    req.headers[clientPortalHeaderName] = 'forged-clientportal';
    req.headers[cpUserHeaderName] = 'forged-cpuser';

    const clientPortal = {
      _id: 'portal-1',
      name: 'Portal One',
    };
    const cpUser = {
      _id: 'cp-user-1',
      clientPortalId: 'portal-1',
      email: 'cp@erxes.io',
    };

    mockedGenerateModels.mockResolvedValue({
      ClientPortals: {
        findOne: jest.fn().mockResolvedValue(clientPortal),
      },
      CPUsers: {
        findOne: jest.fn().mockResolvedValue(cpUser),
      },
    } as any);
    mockedJwtVerify
      .mockReturnValueOnce({ clientPortalId: 'portal-1' } as any)
      .mockReturnValueOnce({ userId: 'cp-user-1' } as any);

    const res = createRes();
    const next = jest.fn();

    await userMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.clientPortal).toEqual(clientPortal);
    expect(req.cpUser).toEqual(cpUser);
    expect(decodeHeader(req.headers[clientPortalHeaderName])).toEqual(
      clientPortal,
    );
    expect(decodeHeader(req.headers[cpUserHeaderName])).toEqual(cpUser);
  });
});
