import * as dotenv from 'dotenv';

// load config
dotenv.config();

const { MAIN_APP_DOMAIN } = process.env;

// Google
export const GOOGLE_OAUTH_TOKEN_VALIDATION_URL =
  'https://www.googleapis.com/oauth2/v2/tokeninfo';
export const GOOGLE_OAUTH_AUTH_URL =
  'https://accounts.google.com/o/oauth2/v2/auth?';
export const GOOGLE_OAUTH_ACCESS_TOKEN_URL =
  'https://www.googleapis.com/oauth2/v4/token';

// Nylas
export const NYLAS_API_URL = 'https://api.nylas.com';
export const AUTHORIZED_REDIRECT_URL = `${MAIN_APP_DOMAIN}/settings/integrations`;
export const AUTHORIZED_CALENDAR_REDIRECT_URL = `${MAIN_APP_DOMAIN}/settings/calendars`;
export const CONNECT_AUTHORIZE_URL = NYLAS_API_URL + '/connect/authorize';
export const CONNECT_TOKEN_URL = NYLAS_API_URL + '/connect/token';

export const MESSAGE_WEBHOOKS = [
  'message.created',
  'thread.replied',

  'calendar.created',
  'calendar.deleted',
  'calendar.updated',
  'event.created',
  'event.deleted',
  'event.updated'
];

// Microsoft
export const MICROSOFT_OAUTH_AUTH_URL = `https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize?`;
export const MICROSOFT_OAUTH_ACCESS_TOKEN_URL = `https://login.microsoftonline.com/organizations/oauth2/v2.0/token`;
export const MICROSOFT_GRAPH_URL = 'https://graph.microsoft.com/v1.0';

export const MICROSOFT_SCOPES = [
  'https://outlook.office.com/user.read',
  'https://outlook.office.com/mail.send',
  'https://outlook.office.com/mail.readwrite',
  'https://outlook.office.com/calendars.readwrite',
  'https://outlook.office.com/contacts.readwrite',
  'https://outlook.office.com/eas.accessasuser.all',
  'https://outlook.office.com/ews.accessasuser.all',
  'offline_access', // for refresh token
  'openid',
  'email',
  'profile'
].join(' ');

export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/contacts',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
].join(' ');
