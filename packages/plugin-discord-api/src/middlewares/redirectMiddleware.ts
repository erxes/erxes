import fetch from 'node-fetch';
import { getSubdomain } from '@erxes/api-utils/src/core';
import { getConfig } from '../messageBroker';
import { Accounts } from '../models';
import { DISCORD_API_URL } from '../constants';

export const getRedirect = (subdomain: string) => {
  return `http://${subdomain}:4000/pl:discord/redirect`;
};

export const redirectMiddleware = async (req, res) => {
  const { code } = req.query;

  const subdomain = getSubdomain(req);
  const clientId = await getConfig('DISCORD_CLIENT_ID', subdomain);
  const clientSecret = await getConfig('DISCORD_CLIENT_SECRET', subdomain);
  const redirect = getRedirect(subdomain);
  // Request with the code

  const params = new URLSearchParams();
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', redirect);

  const response = await fetch(`${DISCORD_API_URL}/oauth2/token`, {
    method: 'POST',
    body: params,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  const body = await response.json();

  const { access_token, refresh_token, guild } = body;

  const foundGuild = await Accounts.findOne({ guildId: guild.id });

  if (foundGuild) {
    await Accounts.updateOne(
      { _id: foundGuild._id },
      { $set: { token: access_token } }
    );
  } else {
    await Accounts.create({
      token: access_token,
      name: guild.name,
      kind: 'discord',
      guildId: guild.id
    });
  }

  res.redirect(
    `http://${subdomain}:3000/settings/discord-authorization?discordAuthorized=true`
  );
};
