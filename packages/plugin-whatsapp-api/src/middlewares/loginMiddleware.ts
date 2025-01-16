import * as graph from "fbgraph";
import { getSubdomain } from "@erxes/api-utils/src/core";
import { generateModels } from "../connectionResolver";
import { getConfig, getEnv } from "../commonUtils";
import { graphRequest } from "../utils";
import { debugWhatsapp, debugRequest, debugResponse } from "../debuggers";
import { repairIntegrations } from "../helpers";

const loginMiddleware = async (req, res) => {
  const subdomain = getSubdomain(req);
  const models = await generateModels(subdomain);
  const WHATSAPP_APP_ID = await getConfig(models, "WHATSAPP_APP_ID");
  const WHATSAPP_APP_SECRET = await getConfig(models, "WHATSAPP_APP_SECRET");

  const WHATSAPP_PERMISSIONS = await getConfig(
    models,
    "WHATSAPP_PERMISSIONS",
    "business_management,whatsapp_business_messaging,whatsapp_business_management"
  );

  const DOMAIN = getEnv({ name: "DOMAIN", subdomain });
  const API_DOMAIN = DOMAIN.includes("zrok") ? DOMAIN : `${DOMAIN}/gateway`;
  const INSTAGRAM_LOGIN_REDIRECT_URL = await getConfig(
    models,
    "WHATSAPP_LOGIN_REDIRECT_URL",
    `${API_DOMAIN}/pl:whatsapp/login`
  );
  const conf = {
    client_id: WHATSAPP_APP_ID,
    client_secret: WHATSAPP_APP_SECRET,
    scope: `${WHATSAPP_PERMISSIONS},`,
    redirect_uri: INSTAGRAM_LOGIN_REDIRECT_URL
  };

  debugRequest(debugWhatsapp, req);

  if (!req.query.code) {
    const authUrl = graph.getOauthUrl({
      client_id: conf.client_id,
      redirect_uri: conf.redirect_uri,
      scope: conf.scope,
      state: `${API_DOMAIN}/pl:whatsapp`
    });

    if (!req.query.error) {
      debugResponse(debugWhatsapp, req, authUrl);
      return res.redirect(authUrl);
    } else {
      debugResponse(debugWhatsapp, req, "access denied");
      return res.send("access denied");
    }
  }

  const config = {
    client_id: conf.client_id,
    redirect_uri: conf.redirect_uri,
    client_secret: conf.client_secret,
    code: req.query.code
  };

  debugResponse(debugWhatsapp, req, JSON.stringify(config));

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
        kind: "whatsapp",
        uid: userAccount.id
      });
    }
    const reactAppUrl = !DOMAIN.includes("zrok")
      ? DOMAIN
      : "http://localhost:3000";
    const url = `${reactAppUrl}/settings/whatsapp-authorization?whatsAppAuthorized=true`;

    debugResponse(debugWhatsapp, req, url);

    return res.redirect(url);
  });
};
export default loginMiddleware;
