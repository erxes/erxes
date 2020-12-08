import * as dotenv from 'dotenv';
import { debugNylas } from '../debuggers';
import { getGoogleConfigs } from '../gmail/utils';
import { sendMessage } from '../messageBroker';
import { Accounts, Integrations } from '../models';
import { compose, getConfig, getEnv } from '../utils';
import { getCalendarOrEvent, getMessageById } from './api';
import {
  GOOGLE_OAUTH_ACCESS_TOKEN_URL,
  GOOGLE_OAUTH_AUTH_URL,
  GOOGLE_SCOPES,
  MICROSOFT_OAUTH_ACCESS_TOKEN_URL,
  MICROSOFT_OAUTH_AUTH_URL,
  MICROSOFT_SCOPES
} from './constants';
import { NylasCalendars, NylasEvents } from './models';
import {
  createOrGetNylasConversation as storeConversation,
  createOrGetNylasConversationMessage as storeMessage,
  createOrGetNylasCustomer as storeCustomer,
  storeCalendars,
  storeEvents,
  updateCalendar,
  updateEvent
} from './store';
import { ICalendar, IEvent } from './types';

// load config
dotenv.config();

/**
 * Sync calendar events from webhook
 * @param {String} action
 * @param {String} accountUid
 * @param {String} eventId
 */
export const syncEvents = async (
  action: 'event.created' | 'event.updated' | 'event.deleted',
  accountUid: string,
  eventId: string
) => {
  try {
    debugNylas(`Syncing events action: ${action} eventId: ${eventId}`);

    const account = await Accounts.findOne({
      nylasAccountId: accountUid
    });

    if (!account) {
      throw new Error(`Account not found with accountUid: ${accountUid}`);
    }

    sendMessage({ action: 'sync-calendar-event' });

    switch (action) {
      case 'event.created':
        const newEvent: IEvent = await getCalendarOrEvent(
          eventId,
          'events',
          account.nylasToken
        );
        await storeEvents([newEvent]);
        break;
      case 'event.deleted':
        await NylasEvents.deleteOne({ accountUid, providerEventId: eventId });
        break;
      case 'event.updated':
        const event: IEvent = await getCalendarOrEvent(
          eventId,
          'events',
          account.nylasToken
        );
        await updateEvent(event);
        break;
    }
  } catch (e) {
    debugNylas(`Failed to sync events: ${e.message}`);

    throw e;
  }
};

/**
 * Sync calendars from webhook
 * @param action
 * @param accountUid
 * @param calendarId
 */
export const syncCalendars = async (
  action: 'calendar.created' | 'calendar.updated' | 'calendar.deleted',
  accountUid: string,
  calendarId: string
) => {
  try {
    debugNylas(`Syncing calendars action: ${action} calendarId: ${calendarId}`);

    const account = await Accounts.findOne({
      nylasAccountId: accountUid
    });

    if (!account) {
      throw new Error(`Account not found with accountUid: ${accountUid}`);
    }

    switch (action) {
      case 'calendar.created':
        const newCalendar: ICalendar = await getCalendarOrEvent(
          calendarId,
          'calendars',
          account.nylasToken
        );
        await storeCalendars([newCalendar]);
        break;
      case 'calendar.deleted':
        await NylasCalendars.deleteOne({ providerCalendarId: calendarId });
        await NylasEvents.deleteMany({ providerCalendarId: calendarId });
        break;
      case 'calendar.updated':
        const calendar: ICalendar = await getCalendarOrEvent(
          calendarId,
          'calendars',
          account.nylasToken
        );
        await updateCalendar(calendar);
        break;
    }
  } catch (e) {
    debugNylas(`Failed to sync calendars: ${e.message}`);

    throw e;
  }
};

/**
 * Sync messages with messageId from webhook
 * @param {String} accountId
 * @param {String} messageId
 * @retusn {Promise} nylas messages object
 */
const syncMessages = async (accountId: string, messageId: string) => {
  const integration = await Integrations.findOne({
    nylasAccountId: accountId
  }).lean();

  if (!integration) {
    throw new Error(`Integration not found with nylasAccountId: ${accountId}`);
  }

  const { nylasToken, email, kind } = integration;

  let message;

  try {
    message = await getMessageById(nylasToken, messageId);
  } catch (e) {
    debugNylas(`Failed to get nylas message by id: ${e.message}`);

    throw e;
  }

  const [from] = message.from;

  // Prevent to send email to itself
  if (from.email === integration.email && !message.subject.includes('Re:')) {
    return;
  }

  const doc = {
    kind,
    message: JSON.parse(JSON.stringify(message)),
    toEmail: email,
    integrationIds: {
      id: integration._id,
      erxesApiId: integration.erxesApiId
    }
  };

  // Store new received message
  return compose(storeMessage, storeConversation, storeCustomer)(doc);
};

export const getNylasConfig = async () => {
  return {
    NYLAS_CLIENT_ID: await getConfig('NYLAS_CLIENT_ID'),
    NYLAS_CLIENT_SECRET: await getConfig('NYLAS_CLIENT_SECRET'),
    NYLAS_WEBHOOK_CALLBACK_URL: await getConfig('NYLAS_WEBHOOK_CALLBACK_URL')
  };
};

/**
 * Convert string emails to email obect
 * @param {String} emailStr - user1@mail.com, user2mail.com
 * @returns {Object} - [{ email }]
 */
const buildEmailAddress = (emailStr: string[]) => {
  if (!emailStr || emailStr.length === 0) {
    return;
  }

  return emailStr
    .map(email => {
      if (email.length > 0) {
        return { email };
      }
    })
    .filter(email => email !== undefined);
};

/**
 * Get client id and secret
 * for selected provider
 * @returns void
 */
export const getClientConfig = async (kind: string): Promise<string[]> => {
  const MICROSOFT_CLIENT_ID = await getConfig('MICROSOFT_CLIENT_ID');
  const MICROSOFT_CLIENT_SECRET = await getConfig('MICROSOFT_CLIENT_SECRET');
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = await getGoogleConfigs();

  switch (kind) {
    case 'gmail': {
      return [GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET];
    }
    case 'office365': {
      return [MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET];
    }
  }
};

export const getProviderSettings = async (
  kind: string,
  refreshToken: string
) => {
  const DOMAIN = getEnv({ name: 'DOMAIN', defaultValue: '' });

  const [clientId, clientSecret] = await getClientConfig(kind);

  switch (kind) {
    case 'gmail':
      return {
        google_client_id: clientId,
        google_client_secret: clientSecret,
        google_refresh_token: refreshToken
      };
    case 'office365':
      return {
        microsoft_client_id: clientId,
        microsoft_client_secret: clientSecret,
        microsoft_refresh_token: refreshToken,
        redirect_uri: `${DOMAIN}/nylas/oauth2/callback`
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
          scope: GOOGLE_SCOPES
        },
        urls: {
          authUrl: GOOGLE_OAUTH_AUTH_URL,
          tokenUrl: GOOGLE_OAUTH_ACCESS_TOKEN_URL
        }
      };
    }
    case 'office365': {
      return {
        params: {
          scope: MICROSOFT_SCOPES
        },
        urls: {
          authUrl: MICROSOFT_OAUTH_AUTH_URL,
          tokenUrl: MICROSOFT_OAUTH_ACCESS_TOKEN_URL
        },
        otherParams: {
          headerType: 'application/x-www-form-urlencoded'
        }
      };
    }
  }
};

export { getProviderConfigs, buildEmailAddress, syncMessages };
