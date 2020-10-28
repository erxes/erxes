import * as qs from 'querystring';
import { debugGmail, debugRequest, debugResponse } from '../debuggers';
import Accounts from '../models/Accounts';
import { getEnv } from '../utils';
import { getAccessToken, getUserInfo } from './api';
import { GOOGLE_AUTH_CODE, SCOPE } from './constant';
import { getGoogleConfigs } from './utils';

export const getAuthCode = async (): Promise<string> => {
  const { GOOGLE_CLIENT_ID } = await getGoogleConfigs();
  const GMAIL_REDIRECT_URL = `${getEnv({ name: 'DOMAIN' })}/gmail/login`;

  return `${GOOGLE_AUTH_CODE}?${qs.stringify({
    redirect_uri: GMAIL_REDIRECT_URL,
    client_id: GOOGLE_CLIENT_ID,
    response_type: 'code',
    access_type: 'offline',
    scope: SCOPE
  })}`;
};

const loginMiddleware = async (req, res) => {
  const MAIN_APP_DOMAIN = getEnv({ name: 'MAIN_APP_DOMAIN' });

  debugRequest(debugGmail, req);

  // we don't have a code yet
  // so we'll redirect to the oauth dialog
  if (!req.query.code) {
    const authCodeUrl = await getAuthCode();

    if (!req.query.error) {
      return res.redirect(authCodeUrl);
    } else {
      debugResponse(debugGmail, req, 'access denied');
      return res.send('access denied');
    }
  }

  debugResponse(debugGmail, req, JSON.stringify(req.query.code));

  const credentials = await getAccessToken(req.query.code);

  // get email address connected with
  const { emailAddress } = await getUserInfo(credentials.access_token);

  const account = await Accounts.findOne({ uid: emailAddress });
  const { access_token } = credentials;

  if (account) {
    await Accounts.updateOne(
      { _id: account._id },
      { $set: { token: access_token } }
    );
  } else {
    await Accounts.create({
      name: emailAddress,
      uid: emailAddress,
      email: emailAddress,
      kind: 'gmail',
      token: access_token,
      tokenSecret: credentials.refresh_token,
      expireDate: credentials.expiry_date,
      scope: credentials.scope
    });
  }

  const url = `${MAIN_APP_DOMAIN}/settings/authorization?gmailAuthorized=true`;

  debugResponse(debugGmail, req, url);

  return res.redirect(url);
};

export default loginMiddleware;
