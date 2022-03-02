import * as querystring from 'querystring';
import * as sinon from 'sinon';
import * as debuggers from '../debuggers';
import { initMemoryStorage } from '../inmemoryStorage';
import * as api from '../nylas/api';
import {
  AUTHORIZED_CALENDAR_REDIRECT_URL,
  AUTHORIZED_REDIRECT_URL,
  GOOGLE_CALENDAR_SCOPES,
  GOOGLE_GMAIL_SCOPES,
  GOOGLE_OAUTH_ACCESS_TOKEN_URL,
  GOOGLE_OAUTH_AUTH_URL
} from '../nylas/constants';
import getOAuthCredentials from '../nylas/loginMiddleware';
import * as nylasUtils from '../nylas/utils';
import * as utils from '../utils';
import './setup.ts';

initMemoryStorage();

interface IReqBody {
  kind?: string;
  password?: string;
  email?: string;
  imapHost?: string;
}

interface IReqQuery {
  kind?: string;
  error?: string;
  code?: string;
  type?: string;
  state?: string;
}

describe('Login middleware test', () => {
  const req: { body?: IReqBody; query: IReqQuery } = {
    query: { kind: 'nylas-gmail' }
  };
  const res = { redirect: (value: string): string => value };
  const next = (value: Error): string | Error => value;

  let debugRequestMock;
  let checkCredentialsMock;
  let getClientConfigMock;
  let uidMock;

  const setConfigAndCredentials = (
    isCredentialed: boolean,
    isClientConfigred: boolean
  ): void => {
    checkCredentialsMock.callsFake(() => isCredentialed);
    getClientConfigMock.callsFake(() =>
      isClientConfigred ? ['clientId', 'clientSecret'] : []
    );
  };

  beforeEach(() => {
    process.env.DOMAIN = 'http://localhost:3400';
    process.env.MAIN_APP_DOMAIN = 'http://localhost:3400';

    checkCredentialsMock = sinon.stub(api, 'checkCredentials');
    getClientConfigMock = sinon.stub(nylasUtils, 'getClientConfig');
    uidMock = sinon.stub(utils, 'generateUid').returns('123');

    debugRequestMock = sinon.stub(debuggers, 'debugRequest').callsFake(() => {
      return 'debugRequest';
    });
  });

  afterEach(() => {
    delete process.env.DOMAIN;
    delete process.env.MAIN_APP_DOMAIN;

    debugRequestMock.restore();
    checkCredentialsMock.restore();
    getClientConfigMock.restore();
    uidMock.restore();
  });

  test('OAuth get code test', async () => {
    const config = {
      params: { access_type: 'offline', scope: '' },
      urls: {
        authUrl: GOOGLE_OAUTH_AUTH_URL,
        tokenUrl: GOOGLE_OAUTH_ACCESS_TOKEN_URL
      }
    };

    config.params.scope = GOOGLE_GMAIL_SCOPES;

    const doc = {
      client_id: 'clientId',
      response_type: 'code',
      redirect_uri: 'http://localhost:3400/nylas/oauth2/callback',
      state: 'gmail'
    };

    setConfigAndCredentials(true, true);

    // Gmail
    // req.query.type = 'gmail';

    expect(await getOAuthCredentials(req, res, next)).toEqual(
      config.urls.authUrl + querystring.stringify({ ...doc, ...config.params })
    );

    // User global variable for redirect
    await getOAuthCredentials(req, res, next);
  });

  test('OAuth Nylas Calendar get code', async () => {
    const config = {
      params: { access_type: 'offline', scope: GOOGLE_CALENDAR_SCOPES },
      urls: {
        authUrl: GOOGLE_OAUTH_AUTH_URL,
        tokenUrl: GOOGLE_OAUTH_ACCESS_TOKEN_URL
      }
    };

    const doc = {
      client_id: 'clientId',
      response_type: 'code',
      redirect_uri: 'http://localhost:3400/nylas/oauth2/callback',
      state: 'gmail&&calendar'
    };

    setConfigAndCredentials(true, true);

    // Calendar
    req.query.type = 'calendar';

    expect(await getOAuthCredentials(req, res, next)).toEqual(
      config.urls.authUrl + querystring.stringify({ ...doc, ...config.params })
    );

    // User global variable for redirect
    await getOAuthCredentials(req, res, next);
  });

  test('OAuth Nylas not configured', async () => {
    setConfigAndCredentials(false, false);

    const nextFunc = (e: Error) => {
      expect(e.message).toBe('Nylas not configured, check your env');
    };

    await getOAuthCredentials(req, res, nextFunc);
  });

  test('OAuth access denied', async () => {
    req.query.error = 'error';

    setConfigAndCredentials(true, true);

    const nextFunc = (e: Error) => {
      expect(e.message).toBe('access denied');
    };

    await getOAuthCredentials(req, res, nextFunc);
  });

  test('OAuth Google not configured', async () => {
    setConfigAndCredentials(true, false);

    const nextFunc = (e: Error) => {
      expect(e.message).toBe('Missing config check your env of gmail');
    };

    await getOAuthCredentials(req, res, nextFunc);
  });

  test('OAuth Gmail request to access_token', async () => {
    req.query.code = 'code';

    // clear calendar
    req.query.type = null;

    setConfigAndCredentials(true, true);

    const sendRequestMock = sinon.stub(utils, 'sendRequest');

    sendRequestMock.onCall(0).returns(
      Promise.resolve({
        access_token: 'access_token',
        refresh_token: 'refresh_token'
      })
    );

    sendRequestMock
      .onCall(1)
      .returns(Promise.resolve({ email: 'johndoe@gmail.com' }));

    const response = await getOAuthCredentials(req, res, next);

    expect(response).toBe(
      `${AUTHORIZED_REDIRECT_URL}?uid=123#showgmailModal=true`
    );

    sendRequestMock.restore();
  });

  test('OAuth Office365 request to access_token', async () => {
    req.query.kind = 'nylas-office365';
    req.query.code = 'code';
    req.query.type = 'calendar';
    req.query.state = 'office365&&calendar';

    setConfigAndCredentials(true, true);

    const sendRequestMock = sinon.stub(utils, 'sendRequest');

    sendRequestMock.onCall(0).returns(
      Promise.resolve({
        access_token: 'access_token',
        refresh_token: 'refresh_token'
      })
    );

    sendRequestMock
      .onCall(1)
      .returns(Promise.resolve({ mail: 'johndoe@O365.com' }));

    const response = await getOAuthCredentials(req, res, next);

    expect(response).toEqual(
      `${AUTHORIZED_CALENDAR_REDIRECT_URL}?uid=123#showCalendarModal=true`
    );

    sendRequestMock.restore();
  });
});
