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

export const getAccessToken = (code) => {
  const oauthClient = getOauthClient();

  return new Promise((resolve, reject) =>
    oauthClient.getToken(code, (err, token) => {
      if (err) { return reject(err); }

      return resolve(token);
    }),
  );
};

export const createMeetEvent = (credentials, event) => {
  const auth = getOauthClient();

  auth.setCredentials(credentials);

  const calendar: any = google.calendar({ version: 'v3', auth });

  return new Promise((resolve, reject) => {
    calendar.events.insert(
      {
        auth,
        calendarId: 'primary',
        resource: {
          description: event.summary,
          conferenceData: {
            createRequest: { requestId: Math.random() },
          },
          ...event,
        },
        conferenceDataVersion: 1,
      },

      (error, response) => {
        if (error) {
          return reject(error);
        }

        return resolve(response.data);
      },
    );
  });
};
