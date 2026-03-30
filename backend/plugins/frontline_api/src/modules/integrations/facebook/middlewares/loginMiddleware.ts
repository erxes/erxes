import { getConfig } from '@/integrations/facebook/commonUtils';
import {
  debugFacebook,
  debugRequest,
  debugResponse,
} from '@/integrations/facebook/debuggers';
import { repairIntegrations } from '@/integrations/facebook/helpers';
import { graphRequest } from '@/integrations/facebook/utils';
import { getEnv, getSubdomain } from 'erxes-api-shared/utils';
import * as graph from 'fbgraph';
import { generateModels } from '~/connectionResolvers';

export const loginMiddleware = async (req, res) => {
  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  const FACEBOOK_APP_ID = await getConfig(models, 'FACEBOOK_APP_ID');
  const FACEBOOK_APP_SECRET = await getConfig(models, 'FACEBOOK_APP_SECRET');
  const FACEBOOK_PERMISSIONS = await getConfig(
    models,
    'FACEBOOK_PERMISSIONS',
    'pages_messaging,pages_manage_ads,pages_manage_engagement,pages_manage_metadata,pages_read_user_content',
  );

  const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });
  const API_DOMAIN = DOMAIN.includes('zrok') ? DOMAIN : `${DOMAIN}/gateway`;
  const FACEBOOK_LOGIN_REDIRECT_URL = await getConfig(
    models,
    'FACEBOOK_LOGIN_REDIRECT_URL',
    `${API_DOMAIN}/pl:frontline/facebook/fblogin`,
  );
  const conf = {
    client_id: FACEBOOK_APP_ID,
    client_secret: FACEBOOK_APP_SECRET,
    scope: FACEBOOK_PERMISSIONS + ',pages_read_engagement,pages_show_list',
    redirect_uri: FACEBOOK_LOGIN_REDIRECT_URL,
  };

  debugRequest(debugFacebook, req);

  if (!req.query.code) {
    const authUrl = graph.getOauthUrl({
      client_id: conf.client_id,
      redirect_uri: conf.redirect_uri,
      scope: conf.scope,
      state: `${API_DOMAIN}/pl:frontline/facebook`,
    });

    if (!req.query.error) {
      debugResponse(debugFacebook, req, authUrl);
      return res.redirect(authUrl);
    } else {
      debugResponse(debugFacebook, req, 'access denied');
      return res.send('access denied');
    }
  }

  const config = {
    client_id: conf.client_id,
    redirect_uri: conf.redirect_uri,
    client_secret: conf.client_secret,
    code: req.query.code,
  };
  debugResponse(debugFacebook, req, JSON.stringify(config));

  return graph.authorize(config, async (_err, facebookRes) => {
    const { access_token } = facebookRes;

    const userAccount: {
      id: string;
      first_name: string;
      last_name: string;
    } = await graphRequest.get(
      'me?fields=id,first_name,last_name',
      access_token,
    );
    const name = `${userAccount.first_name} ${userAccount.last_name}`;
    const account = await models.FacebookAccounts.findOne({
      uid: userAccount.id,
    });
    let accountId: string;
    if (account) {
      await models.FacebookAccounts.updateOne(
        { _id: account._id },
        { $set: { token: access_token } },
      );
      const integrations = await models.FacebookIntegrations.find({
        accountId: account._id,
      });
      accountId = account._id;

      for (const integration of integrations) {
        await repairIntegrations(subdomain, integration.erxesApiId);
      }
    } else {
      const newAccount = await models.FacebookAccounts.create({
        token: access_token,
        name,
        kind: 'facebook',
        uid: userAccount.id,
      });
      accountId = newAccount._id;
    }

    const reactAppUrl = !DOMAIN.includes('zrok')
      ? DOMAIN
      : 'http://localhost:3001';
    const url = `${reactAppUrl}/settings/frontline/channels/fb-auth`;

    debugResponse(debugFacebook, req, url);

    return res.redirect(url);
  });
};
