import { getSubdomain } from '@erxes/api-utils/src/core';
import { getConfig } from '../messageBroker';
import { getRedirect, redirectMiddleware } from './redirectMiddleware';

export const loginMiddleware = async (req, res) => {
  if (req.query.code) {
    return redirectMiddleware(req, res);
  }
  const subdomain = getSubdomain(req);
  const clientId = await getConfig('DISCORD_CLIENT_ID', subdomain);

  if (!clientId)
    return res.send(
      'Please setup the DISCORD_CLIENT_ID in the integrations config'
    );

  const redirectUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${getRedirect(
    subdomain
  )}&response_type=code&scope=bot%20identify`;

  res.redirect(redirectUrl);
};
