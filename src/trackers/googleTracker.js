import google from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

const getOauthClient = () => {
  const { client_secret, client_id, redirect_uris } = process.env.GOOGLE || {};

  return new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
};

export const generateAuthorizeUrl = () => {
  const oauthClient = getOauthClient();

  return oauthClient.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
};

export const getAccessToken = code => {
  const oauthClient = getOauthClient();

  return new Promise((resolve, reject) =>
    oauthClient.getToken(code, (err, token) => {
      if (err) return reject(err);

      return resolve(token);
    }),
  );
};
