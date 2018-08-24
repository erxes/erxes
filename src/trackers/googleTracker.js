import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

const getOauthClient = () => {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env.GOOGLE || {};

  return new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
};

export const getGoogleAuthorizeUrl = () => {
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
