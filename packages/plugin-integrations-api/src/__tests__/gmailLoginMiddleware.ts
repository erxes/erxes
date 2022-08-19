import * as qs from 'querystring';
import * as sinon from 'sinon';
import * as debuggers from '../debuggers';
import { accountFactory } from '../factories';
import * as api from '../gmail/api';
import { GOOGLE_AUTH_CODE } from '../gmail/constant';
import loginMiddleware from '../gmail/loginMiddleware';
import * as gmailUtils from '../gmail/utils';
import { Accounts } from '../models';
import './setup.ts';

type Func = (value: string) => string;

describe('Gmail login middleware', () => {
  const req: { query: { error?: string; code?: string } } = { query: {} };
  const res: { redirect?: Func; send?: Func } = {};

  let debugRequestMock;
  let debugResponseMock;

  let googleMock;

  const mockFunc = (value: string) => value;

  const codeParams = {
    redirect_uri: 'http://localhost:3400/gmail/login',
    client_id: '123',
    response_type: 'code',
    access_type: 'offline',
    scope: 'https://mail.google.com'
  };

  beforeEach(() => {
    googleMock = sinon.stub(gmailUtils, 'getGoogleConfigs').callsFake(() => {
      return Promise.resolve({ GOOGLE_CLIENT_ID: '123' });
    });

    process.env.MAIN_APP_DOMAIN = 'http://localhost:3400';
    process.env.DOMAIN = 'http://localhost:3400';

    debugRequestMock = sinon.stub(debuggers, 'debugRequest').returns('');
    debugResponseMock = sinon.stub(debuggers, 'debugResponse').returns('');
  });

  afterEach(async () => {
    delete process.env.MAIN_APP_DOMAIN;

    debugRequestMock.restore();
    debugResponseMock.restore();

    googleMock.restore();

    await Accounts.remove({});
  });

  test('LoginMiddleware get auth code', async () => {
    const url = `${GOOGLE_AUTH_CODE}?${qs.stringify(codeParams)}`;

    res.redirect = mockFunc;

    expect(await loginMiddleware(req, res)).toBe(url);
  });

  test('LoginMiddleware test access denied', async () => {
    req.query.error = 'error';
    res.send = mockFunc;

    expect(await loginMiddleware(req, res)).toBe('access denied');
  });

  test('LoginMiddleware get access token and create account', async () => {
    req.query.code = 'code';

    const account = await accountFactory({
      uid: 'test@mail.com',
      token: 'foo'
    });

    const getAccessTokenMock = sinon
      .stub(api, 'getAccessToken')
      .callsFake(() => {
        return Promise.resolve({
          access_token: '123'
        });
      });

    const getUserInfoMock = sinon.stub(api, 'getUserInfo');

    getUserInfoMock.onCall(0).returns(
      Promise.resolve({
        emailAddress: 'test@mail.com'
      })
    );

    getUserInfoMock.onCall(1).returns(
      Promise.resolve({
        emailAddress: 'test123123@mail.com'
      })
    );

    expect(await loginMiddleware(req, res)).toBe(
      `${process.env.MAIN_APP_DOMAIN}/settings/authorization?gmailAuthorized=true`
    );

    const updatedAccount = await Accounts.findOne({ uid: account.uid }).lean();

    expect(updatedAccount.token).toBe('123');

    await loginMiddleware(req, res);

    const createdAccount = await Accounts.findOne({
      email: 'test123123@mail.com'
    });

    expect(createdAccount.name).toBe('test123123@mail.com');
    expect(createdAccount.email).toBe('test123123@mail.com');
    expect(createdAccount.token).toBe('123');

    getAccessTokenMock.restore();
    getUserInfoMock.restore();
  });
});
