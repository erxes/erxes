import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

const getOauthClient = () => {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;

  return new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
};

export const getAuthorizeUrl = () => {
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
      console.log('token...............', code, token);
      if (err) return reject(err);

      return resolve(token);
    }),
  );
};
