import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import * as Nylas from 'nylas';
import { debugNylas } from '../debuggers';
import { getEnv } from '../utils';
import {
  GOOGLE_OAUTH_ACCESS_TOKEN_URL,
  GOOGLE_OAUTH_AUTH_URL,
  GOOGLE_SCOPES,
  MICROSOFT_OAUTH_ACCESS_TOKEN_URL,
  MICROSOFT_OAUTH_AUTH_URL,
  MICROSOFT_SCOPES,
} from './constants';

// load config
dotenv.config();

const algorithm = 'aes-256-cbc';

/**
 * Check nylas credentials
 * @returns void
 */
const checkCredentials = () => {
  return Nylas.clientCredentials();
};

/**
 * Convert string emails to email obect
 * @param {String} emailStr - user1@mail.com, user2mail.com
 * @returns {Object} - [{ email }]
 */
const buildEmailAddress = (emailStr: string) => {
  if (!emailStr) {
    return;
  }

  return emailStr
    .split(',')
    .map(email => {
      if (email.length > 0) {
        return { email };
      }
    })
    .filter(email => email !== undefined);
};

/**
 * Set token for nylas and
 * check credentials
 * @param {String} accessToken
 * @returns {Boolean} credentials
 */
const setNylasToken = (accessToken: string) => {
  if (!checkCredentials()) {
    debugNylas('Nylas is not configured');

    return false;
  }

  if (!accessToken) {
    debugNylas('Access token not found');

    return false;
  }

  const nylas = Nylas.with(accessToken);

  return nylas;
};

/**
 * Get client id and secret
 * for selected provider
 * @returns void
 */
const getClientConfig = (kind: string): string[] => {
  switch (kind) {
    case 'gmail': {
      return [getEnv({ name: 'GOOGLE_CLIENT_ID' }), getEnv({ name: 'GOOGLE_CLIENT_SECRET' })];
    }
    case 'office365': {
      return [getEnv({ name: 'MICROSOFT_CLIENT_ID' }), getEnv({ name: 'MICROSOFT_CLIENT_SECRET' })];
    }
  }
};

const getProviderSettings = (kind: string, refreshToken: string) => {
  const DOMAIN = getEnv({ name: 'DOMAIN', defaultValue: '' });

  const [clientId, clientSecret] = getClientConfig(kind);

  switch (kind) {
    case 'gmail':
      return {
        google_client_id: clientId,
        google_client_secret: clientSecret,
        google_refresh_token: refreshToken,
      };
    case 'office365':
      return {
        microsoft_client_id: clientId,
        microsoft_client_secret: clientSecret,
        microsoft_refresh_token: refreshToken,
        redirect_uri: `${DOMAIN}/nylas/oauth2/callback`,
      };
  }
};

/**
 * Get provider specific values
 * @param {String} kind
 * @returns {Object} configs
 */
const getProviderConfigs = (kind: string) => {
  switch (kind) {
    case 'gmail': {
      return {
        params: {
          access_type: 'offline',
          scope: GOOGLE_SCOPES,
        },
        urls: {
          authUrl: GOOGLE_OAUTH_AUTH_URL,
          tokenUrl: GOOGLE_OAUTH_ACCESS_TOKEN_URL,
        },
      };
    }
    case 'office365': {
      return {
        params: {
          scope: MICROSOFT_SCOPES,
        },
        urls: {
          authUrl: MICROSOFT_OAUTH_AUTH_URL,
          tokenUrl: MICROSOFT_OAUTH_ACCESS_TOKEN_URL,
        },
        otherParams: {
          headerType: 'application/x-www-form-urlencoded',
        },
      };
    }
  }
};

/**
 * Request to Nylas SDK
 * @param {String} - accessToken
 * @param {String} - parent
 * @param {String} - child
 * @param {String} - filter
 * @returns {Promise} - nylas response
 */
const nylasRequest = ({
  parent,
  child,
  accessToken,
  filter,
}: {
  parent: string;
  child: string;
  accessToken: string;
  filter?: any;
}) => {
  const nylas = setNylasToken(accessToken);

  if (!nylas) {
    return;
  }

  return nylas[parent][child](filter)
    .then(response => response)
    .catch(e => debugNylas(e.message));
};

/**
 * Nylas file request
 */
const nylasFileRequest = (nylasFile: any, method: string) => {
  return new Promise((resolve, reject) => {
    nylasFile[method]((err, file) => {
      if (err) {
        reject(err);
      }

      return resolve(file);
    });
  });
};

/**
 * Get Nylas SDK instrance
 */
const nylasInstance = (name: string, method: string, options?: any, action?: string) => {
  if (!action) {
    return Nylas[name][method](options);
  }

  return Nylas[name][method](options)[action]();
};

/**
 * Get Nylas SDK instance with token
 */
const nylasInstanceWithToken = async ({
  accessToken,
  name,
  method,
  options,
  action,
}: {
  accessToken: string;
  name: string;
  method: string;
  options?: any;
  action?: string;
}) => {
  const nylas = setNylasToken(accessToken);

  if (!nylas) {
    return;
  }

  const instance = nylas[name][method](options);

  if (!action) {
    return instance;
  }

  return instance[action]();
};

/**
 * Encrypt password
 * @param {String} password
 * @returns {String} encrypted password
 */
const encryptPassword = (password: string): string => {
  const { ENCRYPTION_KEY } = process.env;

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(ENCRYPTION_KEY), iv);

  let encrypted = cipher.update(password);

  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

/**
 * Decrypt password
 * @param {String} password
 * @returns {String} decrypted password
 */
const decryptPassword = (password: string): string => {
  const { ENCRYPTION_KEY } = process.env;

  const passwordParts = password.split(':');
  const ivKey = Buffer.from(passwordParts.shift(), 'hex');

  const encryptedPassword = Buffer.from(passwordParts.join(':'), 'hex');

  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(ENCRYPTION_KEY), ivKey);

  let decrypted = decipher.update(encryptedPassword);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
};

export {
  nylasFileRequest,
  setNylasToken,
  getProviderConfigs,
  nylasRequest,
  checkCredentials,
  buildEmailAddress,
  encryptPassword,
  decryptPassword,
  getProviderSettings,
  getClientConfig,
  nylasInstance,
  nylasInstanceWithToken,
};
