import * as sinon from 'sinon';
import * as debuggers from '../debuggers';
import { accountFactory } from '../factories';
import * as api from '../gmail/api';
import loginMiddleware from '../gmail/loginMiddleware';
import { Accounts } from '../models';
import './setup.ts';

type Func = (value: string) => string;

describe('Gmail login middleware', () => {
  const req: { query: { error?: string; code?: string } } = { query: {} };
  const res: { redirect?: Func; send?: Func } = {};

  let debugRequestMock;
  let debugResponseMock;

  const mockFunc = (value: string) => value;

  beforeEach(() => {
    process.env.MAIN_APP_DOMAIN = 'http://localhost:3400';

    debugRequestMock = sinon.stub(debuggers, 'debugRequest').returns('');
    debugResponseMock = sinon.stub(debuggers, 'debugResponse').returns('');
  });

  afterEach(async () => {
    delete process.env.MAIN_APP_DOMAIN;

    debugRequestMock.restore();
    debugResponseMock.restore();

    await Accounts.remove({});
  });

  test('LoginMiddleware test without code', async () => {
    res.redirect = mockFunc;

    const getAuthorizeUrlMock = sinon.stub(api, 'getAuthorizeUrl').returns('gmail auth url');

    expect(await loginMiddleware(req, res)).toBe('gmail auth url');

    getAuthorizeUrlMock.restore();
  });

  test('LoginMiddleware test access denied', async () => {
    req.query.error = 'error';
    res.send = mockFunc;

    const getAuthorizeUrlMock = sinon.stub(api, 'getAuthorizeUrl');

    expect(await loginMiddleware(req, res)).toBe('access denied');

    getAuthorizeUrlMock.restore();
  });

  test('', async () => {
    req.query.code = 'code';

    const account = await accountFactory({ uid: 'bob@gmail.com', token: 'foo' });

    const accessTokenMock = sinon.stub(api, 'getAccessToken').callsFake(() => {
      return Promise.resolve({
        access_token: 'accessToken',
        refresh_token: 'refreshToken',
        expire_date: 123123,
        scope: 'gmail.modify',
      });
    });

    const getProfileMock = sinon.stub(api, 'getProfile');

    getProfileMock.onCall(0).returns(Promise.resolve({ data: { emailAddress: 'bob@gmail.com' } }));

    await loginMiddleware(req, res);

    const updatedAccount = await Accounts.findOne({ _id: account._id }).lean();

    expect(updatedAccount.token).toBe('accessToken');

    getProfileMock.onCall(1).returns(Promise.resolve({ data: { emailAddress: 'john@gmail.com' } }));

    await loginMiddleware(req, res);

    const createdAccount = await Accounts.findOne({ uid: 'john@gmail.com' }).lean();

    expect(createdAccount.name).toBe('john@gmail.com');
    expect(createdAccount.token).toBe('accessToken');
    expect(createdAccount.tokenSecret).toBe('refreshToken');

    accessTokenMock.restore();
    getProfileMock.restore();
  });
});
