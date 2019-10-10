import * as dotenv from 'dotenv';

// load config
dotenv.config();

const { MAIN_APP_DOMAIN } = process.env;

// Integration action
export const ACTIONS = {
  customer: 'get-create-update-customer',
  conversation: 'create-or-update-conversation',
  conversationMessage: 'create-conversation-message',
};

// Google
export const GOOGLE_OAUTH_TOKEN_VALIDATION_URL = 'https://www.googleapis.com/oauth2/v2/tokeninfo';
export const GOOGLE_OAUTH_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth?';
export const GOOGLE_OAUTH_ACCESS_TOKEN_URL = 'https://www.googleapis.com/oauth2/v4/token';

// Nylas
export const NYLAS_API_URL = 'https://api.nylas.com';
export const AUTHORIZED_REDIRECT_URL = `${MAIN_APP_DOMAIN}/settings/integrations?authenticated=true`;
export const CONNECT_AUTHORIZE_URL = NYLAS_API_URL + '/connect/authorize';
export const CONNECT_TOKEN_URL = NYLAS_API_URL + '/connect/token';

export const MESSAGE_WEBHOOKS = ['message.created', 'message.opened', 'message.link_clicked', 'thread.replied'];

export const GOOGLE_SCOPES = [
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/calendar',
  'https://www.google.com/m8/feeds/',
].join(' ');
