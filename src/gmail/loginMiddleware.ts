import { debugGmail, debugRequest, debugResponse } from '../debuggers';
import Accounts from '../models/Accounts';
import { getEnv } from '../utils';
import { getAccessToken, getAuthorizeUrl, getProfile } from './api';

const loginMiddleware = async (req, res) => {
  const MAIN_APP_DOMAIN = getEnv({ name: 'MAIN_APP_DOMAIN' });

  debugRequest(debugGmail, req);

  // we don't have a code yet
  // so we'll redirect to the oauth dialog
  if (!req.query.code) {
    const authUrl = await getAuthorizeUrl();

    if (!req.query.error) {
      debugResponse(debugGmail, req, authUrl);
      return res.redirect(authUrl);
    } else {
      debugResponse(debugGmail, req, 'access denied');
      return res.send('access denied');
    }
  }

  debugResponse(debugGmail, req, JSON.stringify(req.query.code));

  const credentials = await getAccessToken(req.query.code);

  // get email address connected with
  const { data } = await getProfile(credentials);
  const email = data.emailAddress || '';

  const account = await Accounts.findOne({ uid: data.emailAddress });
  const { access_token } = credentials;

  if (account) {
    await Accounts.updateOne({ _id: account._id }, { $set: { token: access_token } });
  } else {
    await Accounts.create({
      name: email,
      uid: email,
      email,
      kind: 'gmail',
      token: access_token,
      tokenSecret: credentials.refresh_token,
      expireDate: credentials.expiry_date,
      scope: credentials.scope,
    });
  }

  const url = `${MAIN_APP_DOMAIN}/settings/integrations?gmailAuthorized=true`;

  debugResponse(debugGmail, req, url);

  return res.redirect(url);
};

export default loginMiddleware;
