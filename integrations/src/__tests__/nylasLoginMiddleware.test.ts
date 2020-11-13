import * as querystring from 'querystring';
import * as sinon from 'sinon';
import * as debuggers from '../debuggers';
import { initMemoryStorage } from '../inmemoryStorage';
import * as api from '../nylas/api';
import {
  AUTHORIZED_CALENDAR_REDIRECT_URL,
  AUTHORIZED_REDIRECT_URL,
  GOOGLE_OAUTH_ACCESS_TOKEN_URL,
  GOOGLE_OAUTH_AUTH_URL,
  GOOGLE_SCOPES
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
    const providerConfigs = {
      params: {
        access_type: 'offline',
        scope: GOOGLE_SCOPES
      },
      urls: {
        authUrl: GOOGLE_OAUTH_AUTH_URL,
        tokenUrl: GOOGLE_OAUTH_ACCESS_TOKEN_URL
      }
    };

    const doc = {
      client_id: 'clientId',
      response_type: 'code',
      redirect_uri: 'http://localhost:3400/nylas/oauth2/callback',
      ...providerConfigs.params
    };

    setConfigAndCredentials(true, true);

    expect(await getOAuthCredentials(req, res, next)).toEqual(
      providerConfigs.urls.authUrl + querystring.stringify(doc)
    );

    // User global variable for redirect
    delete req.query.kind;
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
