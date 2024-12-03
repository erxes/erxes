import * as graph from "fbgraph";
import { getSubdomain } from "@erxes/api-utils/src/core";
import { generateModels } from "../connectionResolver";
import { getConfig, getEnv } from "../commonUtils";
import { graphRequest } from "../utils";
import { debugInstagram, debugRequest, debugResponse } from "../debuggers";
import { repairIntegrations } from "../helpers";

const loginMiddleware = async (req, res) => {
  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);
  const INSTAGRAM_APP_ID = await getConfig(models, "INSTAGRAM_APP_ID");
  const INSTAGRAM_APP_SECRET = await getConfig(models, "INSTAGRAM_APP_SECRET");

  const INSTAGRAM_PERMISSIONS = await getConfig(
    models,
    "INSTAGRAM_PERMISSIONS",
    "pages_messaging,pages_manage_ads,pages_manage_engagement,pages_manage_metadata,pages_read_user_content"
  );

  const DOMAIN = getEnv({ name: "DOMAIN", subdomain });
  const API_DOMAIN = DOMAIN.includes("zrok") ? DOMAIN : `${DOMAIN}/gateway`;
  const INSTAGRAM_LOGIN_REDIRECT_URL = await getConfig(
    models,
    "INSTAGRAM_LOGIN_REDIRECT_URL",
    `${API_DOMAIN}/pl:instagram/iglogin`
  );
  const conf = {
    client_id: INSTAGRAM_APP_ID,
    client_secret: INSTAGRAM_APP_SECRET,
    scope: `${INSTAGRAM_PERMISSIONS},instagram_manage_comments,instagram_basic,instagram_manage_messages`,
    redirect_uri: INSTAGRAM_LOGIN_REDIRECT_URL
  };

  debugRequest(debugInstagram, req);
  // we don't have a code yet
  // so we'll redirect to the oauth dialog
  if (!req.query.code) {
    const authUrl = graph.getOauthUrl({
      client_id: conf.client_id,
      redirect_uri: conf.redirect_uri,
      scope: conf.scope,
      state: `${API_DOMAIN}/pl:instagram`
    });

    // checks whether a user denied the app instagram login/permissions
    if (!req.query.error) {
      debugResponse(debugInstagram, req, authUrl);
      return res.redirect(authUrl);
    } else {
      debugResponse(debugInstagram, req, "access denied");
      return res.send("access denied");
    }
  }

  const config = {
    client_id: conf.client_id,
    redirect_uri: conf.redirect_uri,
    client_secret: conf.client_secret,
    code: req.query.code
  };

  debugResponse(debugInstagram, req, JSON.stringify(config));

  // If this branch executes user is already being redirected back with
  // code (whatever that is)
  // code is set
  // we'll send that and get the access token

  return graph.authorize(config, async (_err, facebookRes) => {
    const { access_token } = facebookRes;
    const userAccount: {
      id: string;
      first_name: string;
      last_name: string;
    } = await graphRequest.get(
      "me?fields=id,first_name,last_name",
      access_token
    );

    const name = `${userAccount.first_name} ${userAccount.last_name}`;

    const account = await models.Accounts.findOne({ uid: userAccount.id });

    if (account) {
      await models.Accounts.updateOne(
        { _id: account._id },
        { $set: { token: access_token } }
      );
      const integrations = await models.Integrations.find({
        accountId: account._id
      });

      for (const integration of integrations) {
        await repairIntegrations(subdomain, models, integration.erxesApiId);
      }
    } else {
      await models.Accounts.create({
        token: access_token,
        name,
        kind: "instagram",
        uid: userAccount.id
      });
    }
    const reactAppUrl = !DOMAIN.includes("zrok")
      ? DOMAIN
      : "http://localhost:3000";
    const url = `${reactAppUrl}/settings/ig-authorization?igAuthorized=true`;

    debugResponse(debugInstagram, req, url);

    return res.redirect(url);
  });
};
export default loginMiddleware;
