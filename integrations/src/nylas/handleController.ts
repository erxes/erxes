import { debugNylas } from '../debuggers';
import { revokeToken } from '../gmail/api';
import memoryStorage from '../inmemoryStorage';
import { Accounts, Integrations } from '../models';
import { IAccount } from '../models/Accounts';
import { sendRequest } from '../utils';
import {
  checkCalendarAvailability,
  createEvent,
  deleteCalendarEvent,
  enableOrDisableAccount,
  getAttachment,
  getCalendarOrEvent,
  getCalenderOrEventList,
  revokeTokenAccount,
  sendEventAttendance,
  sendMessage,
  updateEvent,
  uploadFile
} from './api';
import {
  connectExchangeToNylas,
  connectImapToNylas,
  connectProviderToNylas,
  connectYahooAndOutlookToNylas
} from './auth';
import { NYLAS_API_URL } from './constants';
import { NylasCalendars, NylasEvents } from './models';
import { NYLAS_MODELS, storeCalendars, storeEvents } from './store';
import {
  ICalendar,
  ICalendarParams,
  IEventDoc,
  INylasIntegrationData
} from './types';
import { buildEmailAddress } from './utils';

export const createNylasIntegration = async (
  kind: string,
  integrationId: string,
  data: INylasIntegrationData
) => {
  debugNylas(`Creating nylas integration kind: ${kind}`);

  try {
    if (data.email) {
      const integration = await Integrations.findOne({
        email: data.email
      }).lean();

      if (integration) {
        throw new Error(`${data.email} already exists`);
      }
    }

    // Connect provider to nylas ===========
    switch (kind) {
      case 'exchange':
        await connectExchangeToNylas(integrationId, data);
        break;
      case 'imap':
        await connectImapToNylas(integrationId, data);
        break;
      case 'outlook':
      case 'yahoo':
        await connectYahooAndOutlookToNylas(kind, integrationId, data);
        break;
      default:
        await connectProviderToNylas(data.uid, integrationId);
        break;
    }
  } catch (e) {
    throw e;
  }
};

export const getMessage = async (
  erxesApiMessageId: string,
  integrationId: string
) => {
  const integration = await Integrations.findOne({
    erxesApiId: integrationId
  }).lean();

  if (!integration) {
    throw new Error('Integration not found!');
  }

  const { email, kind } = integration;

  const conversationMessages = NYLAS_MODELS[kind].conversationMessages;

  const message = await conversationMessages
    .findOne({ erxesApiMessageId })
    .lean();

  if (!message) {
    throw new Error('Conversation message not found');
  }

  // attach account email for dinstinguish sender
  message.integrationEmail = email;

  return message;
};

export const nylasFileUpload = async (erxesApiId: string, response: any) => {
  const integration = await Integrations.findOne({ erxesApiId }).lean();

  if (!integration) {
    throw new Error('Integration not found');
  }

  const file = response.file || response.upload;

  try {
    return uploadFile(file, integration.nylasToken);
  } catch (e) {
    throw e;
  }
};

export const nylasGetAttachment = async (
  attachmentId: string,
  integrationId: string
) => {
  const integration = await Integrations.findOne({
    erxesApiId: integrationId
  }).lean();

  if (!integration) {
    throw new Error('Integration not found');
  }

  const response: { body?: Buffer } = await getAttachment(
    attachmentId,
    integration.nylasToken
  );

  if (!response) {
    throw new Error('Attachment not found');
  }

  return response;
};

export const nylasSendEmail = async (erxesApiId: string, params: any) => {
  const integration = await Integrations.findOne({ erxesApiId }).lean();

  if (!integration) {
    throw new Error('Integration not found');
  }

  try {
    const {
      shouldResolve,
      to,
      cc,
      bcc,
      body,
      threadId,
      subject,
      attachments,
      replyToMessageId
    } = params;

    const doc = {
      to: buildEmailAddress(to),
      cc: buildEmailAddress(cc),
      bcc: buildEmailAddress(bcc),
      subject:
        replyToMessageId && !subject.includes('Re:')
          ? `Re: ${subject}`
          : subject,
      body,
      threadId,
      files: attachments,
      replyToMessageId
    };

    const message = await sendMessage(integration.nylasToken, doc);

    if (!shouldResolve) {
      await memoryStorage().addToArray('nylas_unread_messageId', message.id);

      // Set mail to inbox
      await sendRequest({
        url: `${NYLAS_API_URL}/messages/${message.id}`,
        method: 'PUT',
        headerParams: {
          Authorization: `Basic ${Buffer.from(
            `${integration.nylasToken}:`
          ).toString('base64')}`
        },
        body: { unread: true }
      });

      await memoryStorage().removeFromArray(
        'nylas_unread_messageId',
        message.id
      );
    }

    debugNylas('Successfully sent message');

    return 'success';
  } catch (e) {
    debugNylas(`Failed to send message: ${e.message}`);

    throw e;
  }
};

export const nylasGetCalendars = async (account: IAccount) => {
  try {
    if (!account.nylasToken) {
      throw new Error('Account not found');
    }

    const calendars: ICalendar[] = await getCalenderOrEventList(
      'calendars',
      account.nylasToken
    );

    return storeCalendars(calendars);
  } catch (e) {
    debugNylas(`Failed to get calendars: ${e.message}`);

    throw e;
  }
};

export const nylasGetAllEvents = async (account: IAccount) => {
  try {
    if (!account.nylasAccountId) {
      throw new Error('Account not found');
    }

    const calendars = await NylasCalendars.find({
      accountUid: account.nylasAccountId
    });

    for (const calendar of calendars) {
      await storeEvents(
        await getCalenderOrEventList('events', account.nylasToken, {
          calendar_id: calendar.providerCalendarId
        })
      );
    }
  } catch (e) {
    debugNylas(`Failed to get events: ${e.message}`);

    throw e;
  }
};

export const nylasGetCalendarOrEvent = async (
  id: string,
  type: 'calendars' | 'events',
  erxesApiId: string
) => {
  try {
    debugNylas(`Getting account ${type} erxesApiId: ${erxesApiId}`);

    const integration = await Integrations.findOne({ erxesApiId });

    if (!integration) {
      throw new Error(`Integration not found with id: ${erxesApiId}`);
    }

    return getCalendarOrEvent(id, type, integration.nylasToken);
  } catch (e) {
    debugNylas(`Failed to get events: ${e.message}`);

    throw e;
  }
};

export const nylasCheckCalendarAvailability = async (
  accountId: string,
  dates: { startTime: number; endTime: number }
) => {
  try {
    const account = await Accounts.findOne({ _id: accountId });

    if (!account) {
      throw new Error(`Account not found with id: ${accountId}`);
    }

    debugNylas(`Check availability email: ${account.email}`);

    return checkCalendarAvailability(account.email, dates, account.nylasToken);
  } catch (e) {
    debugNylas(`Failed to check Availability: ${e.message}`);

    throw e;
  }
};

// calendars
export const nylasDeleteCalendarEvent = async ({
  eventId,
  accountId
}: {
  eventId: string;
  accountId: string;
}) => {
  try {
    debugNylas(`Deleting calendar event id: ${eventId}`);

    const account = await Accounts.findOne({ _id: accountId }).lean();

    if (!account) {
      throw new Error(`Account not found with id: ${accountId}`);
    }

    await deleteCalendarEvent(eventId, account.nylasToken);

    await NylasEvents.deleteOne({ providerEventId: eventId });
  } catch (e) {
    debugNylas(`Failed to delete event: ${e.message}`);

    throw e;
  }
};

export const nylasCreateCalenderEvent = async ({
  accountId,
  doc
}: {
  accountId: string;
  doc: IEventDoc;
}) => {
  try {
    debugNylas(`Creating event in calendar with accountId: ${accountId}`);

    const account = await Accounts.findOne({ _id: accountId });

    if (!account) {
      throw new Error(`Account not found with id: ${accountId}`);
    }

    return createEvent(doc, account.nylasToken);
  } catch (e) {
    debugNylas(`Failed to create event: ${e.message}`);

    throw e;
  }
};

export const nylasUpdateEvent = async ({
  accountId,
  eventId,
  doc
}: {
  accountId: string;
  eventId: string;
  doc: IEventDoc;
}) => {
  try {
    debugNylas(`Updating event id: ${eventId}`);

    const account = await Accounts.findOne({ _id: accountId });

    if (!account) {
      throw new Error(`Account not found with id: ${accountId}`);
    }

    return updateEvent(eventId, doc, account.nylasToken);
  } catch (e) {
    debugNylas(`Failed to update event: ${e.message}`);

    throw e;
  }
};

export const nylasSendEventAttendance = async ({
  erxesApiId,
  eventId,
  doc
}: {
  erxesApiId: string;
  eventId: string;
  doc: { status: 'yes' | 'no' | 'maybe'; comment?: string };
}) => {
  try {
    debugNylas(`Send event attendance of eventId: ${eventId}`);

    const integration = await Integrations.findOne({ erxesApiId });

    if (!integration) {
      throw new Error(`Integration not found with id: ${erxesApiId}`);
    }

    return sendEventAttendance(eventId, doc, integration.nylasToken);
  } catch (e) {
    debugNylas(`Failed to send event attendance: ${e.message}`);

    throw e;
  }
};

export const updateCalendar = async (doc: ICalendarParams) => {
  const { _id, ...params } = doc;

  await NylasCalendars.updateOne({ _id }, { $set: params });
  const calendar = await NylasCalendars.findOne({ _id });

  if (calendar && doc.color) {
    await NylasEvents.updateMany(
      { providerCalendarId: calendar.providerCalendarId },
      { $set: { color: doc.color } }
    );
  }

  return calendar;
};

export const nylasConnectCalendars = async (uid: string) => {
  try {
    const { account, isAlreadyExists } = await connectProviderToNylas(uid);

    if (!isAlreadyExists) {
      await nylasGetCalendars(account);
      await nylasGetAllEvents(account);
    }

    return {
      accountId: account._id,
      email: account.email
    };
  } catch (e) {
    debugNylas(`Failed to sync calendars & events: ${e.message}`);

    throw e;
  }
};

export const nylasRemoveCalendars = async (accountId: string) => {
  try {
    const {
      email,
      nylasAccountId,
      googleAccessToken
    } = await Accounts.findOne({ _id: accountId });

    const calendars = await NylasCalendars.find({
      accountUid: nylasAccountId
    }).select('providerCalendarId');

    const calendarIds = calendars.map(c => {
      return c.providerCalendarId;
    });

    await Accounts.deleteOne({ _id: accountId });
    await NylasCalendars.deleteMany({ accountUid: nylasAccountId });
    await NylasEvents.deleteMany({
      providerCalendarId: { $in: calendarIds }
    });

    await revokeToken(email, googleAccessToken);
    await enableOrDisableAccount(nylasAccountId, false);
    await revokeTokenAccount(nylasAccountId);
  } catch (e) {
    debugNylas(`Failed to remove calendars: ${e.message}`);

    throw e;
  }
};

export const nylasGetAccountCalendars = async (
  accountId: string,
  show: boolean
) => {
  try {
    const account = await Accounts.findOne({ _id: accountId });

    if (!account) {
      throw new Error('Account not found');
    }

    const accountUid = account.nylasAccountId;

    debugNylas(`Get calendars with accountUid: $${accountUid}`);

    const params: { accountUid: string; show?: boolean } = { accountUid };

    if (show) {
      params.show = true;
    }

    const calendars = await NylasCalendars.find(params);

    if (!calendars) {
      throw new Error('Calendars not found');
    }

    return calendars;
  } catch (e) {
    debugNylas(`Failed to get calendars: ${e.message}`);

    throw e;
  }
};

export const nylasGetEvents = async ({
  calendarIds,
  startTime,
  endTime
}: {
  calendarIds: string;
  startTime: string;
  endTime: string;
}) => {
  try {
    const getTime = (date: string) => {
      return new Date(date).getTime() / 1000;
    };

    debugNylas(`Get events with calendarIds: ${calendarIds}`);

    const events = await NylasEvents.find({
      providerCalendarId: { $in: calendarIds && calendarIds.split(',') },
      $and: [
        { 'when.start_time': { $gte: getTime(startTime) } },
        { 'when.end_time': { $lte: getTime(endTime) } }
      ]
    });

    if (!events) {
      throw new Error('Events not found');
    }

    return events;
  } catch (e) {
    debugNylas(`Failed to get calendars: ${e.message}`);

    throw e;
  }
};
