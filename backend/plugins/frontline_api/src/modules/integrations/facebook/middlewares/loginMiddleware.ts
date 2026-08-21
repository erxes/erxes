import {
  facebookAccountSelector,
  getConfig,
  resolveFacebookApp,
} from '@/integrations/facebook/commonUtils';
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

/**
 * The OAuth `state` is sent back to us by the shared authorize redirector,
 * which builds the callback url as `${state}/fblogin?code=...`. A query string
 * in `state` would therefore end up before the `/fblogin` path, so the kind is
 * carried as a `/kind/<kind>` path segment instead.
 */
const KIND_PATH_SEGMENT = '/kind/';

const buildStateUrl = (apiDomain: string, kind?: string) =>
  kind
    ? `${apiDomain}/pl:frontline/facebook${KIND_PATH_SEGMENT}${encodeURIComponent(kind)}`
    : `${apiDomain}/pl:frontline/facebook`;

const readKindFromState = (state?: string): string | undefined => {
  const [path] = (state || '').split('?');
  const index = path.indexOf(KIND_PATH_SEGMENT);

  if (index === -1) {
    return undefined;
  }

  return (
    decodeURIComponent(
      path.slice(index + KIND_PATH_SEGMENT.length).split('/')[0],
    ) || undefined
  );
};

export const loginMiddleware = async (req, res) => {
  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);

  const kind =
    (req.query.kind as string) ||
    (req.params.kind as string) ||
    readKindFromState(req.query.state as string);

  const app = await resolveFacebookApp(models, kind);

  console.log('[fblogin] request', {
    subdomain,
    kind,
    query: req.query,
    params: req.params,
  });
  console.log('[fblogin] resolved app', {
    appId: app.appId,
    isSeparate: app.isSeparate,
    hasSecret: Boolean(app.appSecret),
  });

  const FACEBOOK_PERMISSIONS = await getConfig(
    models,
    'FACEBOOK_PERMISSIONS',
    'pages_messaging,pages_manage_ads,pages_manage_engagement,pages_manage_metadata,pages_read_user_content,business_management,pages_manage_posts',
  );

  console.log('[fblogin] FACEBOOK_PERMISSIONS config', FACEBOOK_PERMISSIONS);

  const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });
  const API_DOMAIN = DOMAIN.includes('zrok') ? DOMAIN : `${DOMAIN}/gateway`;
  const FACEBOOK_LOGIN_REDIRECT_URL = await getConfig(
    models,
    'FACEBOOK_LOGIN_REDIRECT_URL',
    `${API_DOMAIN}/pl:frontline/facebook/fblogin`,
  );
  const conf = {
    client_id: app.appId,
    client_secret: app.appSecret,
    scope:
      FACEBOOK_PERMISSIONS +
      ',pages_read_engagement,pages_show_list,pages_manage_posts',
    redirect_uri: FACEBOOK_LOGIN_REDIRECT_URL,
  };

  console.log('[fblogin] oauth conf', {
    client_id: conf.client_id,
    redirect_uri: conf.redirect_uri,
    scope: conf.scope,
    DOMAIN,
    API_DOMAIN,
  });

  debugRequest(debugFacebook, req);

  if (!req.query.code) {
    const state = buildStateUrl(API_DOMAIN, kind);

    const authUrl = graph.getOauthUrl({
      client_id: conf.client_id,
      redirect_uri: conf.redirect_uri,
      scope: conf.scope,
      state,
    });

    console.log('[fblogin] built auth url', { state, authUrl });

    if (!req.query.error) {
      debugResponse(debugFacebook, req, authUrl);
      return res.redirect(authUrl);
    } else {
      console.log('[fblogin] access denied', {
        error: req.query.error,
        error_code: req.query.error_code,
        error_reason: req.query.error_reason,
        error_description: req.query.error_description,
      });
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
    console.log('[fblogin] authorize result', {
      error: _err,
      hasAccessToken: Boolean(facebookRes && facebookRes.access_token),
      response: facebookRes,
    });

    const { access_token } = facebookRes;

    const userAccount: {
      id: string;
      first_name: string;
      last_name: string;
    } = await graphRequest.get(
      'me?fields=id,first_name,last_name',
      access_token,
    );

    try {
      const granted = await graphRequest.get('me/permissions', access_token);
      console.log(
        '[fblogin] granted permissions',
        JSON.stringify(granted, null, 2),
      );
    } catch (e) {
      console.log('[fblogin] failed to read me/permissions', e.message);
    }
    const name = `${userAccount.first_name} ${userAccount.last_name}`;
    const account = await models.FacebookAccounts.findOne(
      facebookAccountSelector(userAccount.id, app),
    );

    console.log('[fblogin] account lookup', {
      selector: facebookAccountSelector(userAccount.id, app),
      found: account ? account._id : null,
    });

    if (account) {
      await models.FacebookAccounts.updateOne(
        { _id: account._id },
        { $set: { token: access_token, appId: app.appId } },
      );
      const integrations = await models.FacebookIntegrations.find({
        accountId: account._id,
      });

      console.log('[fblogin] repairing integrations', {
        accountId: account._id,
        count: integrations.length,
        erxesApiIds: integrations.map((i) => i.erxesApiId),
      });

      for (const integration of integrations) {
        try {
          await repairIntegrations(subdomain, integration.erxesApiId);
          console.log('[fblogin] repaired', integration.erxesApiId);
        } catch (e) {
          console.log('[fblogin] repair failed', {
            erxesApiId: integration.erxesApiId,
            message: e.message,
            stack: e.stack,
          });
        }
      }
    } else {
      const created = await models.FacebookAccounts.create({
        token: access_token,
        name,
        kind: 'facebook',
        uid: userAccount.id,
        appId: app.appId,
      });
      console.log('[fblogin] created account', {
        _id: created._id,
        uid: userAccount.id,
        appId: app.appId,
      });
    }

    const reactAppUrl = !DOMAIN.includes('zrok')
      ? DOMAIN
      : 'http://localhost:3001';
    const url = `${reactAppUrl}/settings/frontline/channels/fb-auth`;

    console.log('[fblogin] redirecting to', url);

    debugResponse(debugFacebook, req, url);

    return res.redirect(url);
  });
};
