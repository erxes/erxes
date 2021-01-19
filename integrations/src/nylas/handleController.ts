import { debugNylas } from '../debuggers';
import { revokeToken } from '../gmail/api';
import memoryStorage from '../inmemoryStorage';
import { Accounts, Integrations } from '../models';
import { IAccount } from '../models/Accounts';
import { sendRequest } from '../utils';
import {
  checkCalendarAvailability,
  createEvent,
  createSchedulePage,
  deleteCalendarEvent,
  deleteSchedulePage,
  enableOrDisableAccount,
  getAttachment,
  getCalendarList,
  getCalendarOrEvent,
  getEventList,
  getSchedulePages,
  revokeTokenAccount,
  sendEventAttendance,
  sendMessage,
  updateEvent,
  updateSchedulePage,
  uploadFile
} from './api';
import {
  connectExchangeToNylas,
  connectImapToNylas,
  connectProviderToNylas,
  connectYahooAndOutlookToNylas
} from './auth';
import { NYLAS_API_URL } from './constants';
import { NylasCalendars, NylasEvents, NylasPages } from './models';
import { NYLAS_MODELS, storeCalendars, storeEvents, storePages } from './store';
import {
  ICalendar,
  ICalendarParams,
  IEventDoc,
  INylasIntegrationData,
  INylasSchedulePageDoc
} from './types';
import { buildEmailAddress, extractDate } from './utils';

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

    const calendars: ICalendar[] = await getCalendarList(account.nylasToken);

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
        await getEventList(account.nylasToken, {
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
    const account = await Accounts.findOne({ _id: accountId });

    if (!account) {
      throw new Error('Account not found');
    }

    const { email, nylasAccountId, googleAccessToken } = account;

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
    await NylasPages.deleteMany({ accountId });

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
  show?: boolean
) => {
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

  return NylasCalendars.find(params);
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
    debugNylas(`Get events with calendarIds: ${calendarIds}`);

    const getTime = (date: Date) => {
      return date.getTime() / 1000;
    };

    const ids = (calendarIds && calendarIds.split(',')) || [];

    // sync events
    for (const id of ids) {
      const calendar = await NylasCalendars.findOne({ providerCalendarId: id });

      if (calendar) {
        const syncedMonths = calendar.syncedMonths || [];
        let syncDate = new Date(startTime);

        const { month, year, date } = extractDate(syncDate);

        let sYear = year;
        let sMonth = month;

        if (date !== 1) {
          syncDate = new Date(year, month + 1, 1);
          const currentMonth = extractDate(new Date(year, month + 1, 1));

          sYear = currentMonth.year;
          sMonth = currentMonth.month;
        }

        if (!syncedMonths.includes(`${sYear}-${sMonth}`)) {
          const account = await Accounts.findOne({
            nylasAccountId: calendar.accountUid
          });

          const calendarEvents = await NylasEvents.find({
            providerCalendarId: calendar.providerCalendarId,
            $and: [
              { 'when.start_time': { $gte: getTime(syncDate) } },
              {
                'when.end_time': {
                  $lte: getTime(new Date(sYear, sMonth + 1, 0))
                }
              }
            ]
          }).select({ providerEventId: 1 });

          const eventIds = calendarEvents.map(e => e.providerEventId);

          storeEvents(
            await getEventList(
              account.nylasToken,
              {
                calendar_id: calendar.providerCalendarId
              },
              syncDate
            ),
            eventIds
          );
        }
      }
    }

    const events = await NylasEvents.find({
      providerCalendarId: { $in: ids },
      $and: [
        { 'when.start_time': { $gte: getTime(new Date(startTime)) } },
        { 'when.end_time': { $lte: getTime(new Date(endTime)) } }
      ]
    });

    return events;
  } catch (e) {
    debugNylas(`Failed to get calendars: ${e.message}`);

    throw e;
  }
};

// schedule
export const nylasGetSchedulePages = async (accountId: string) => {
  try {
    const account = await Accounts.findOne({ _id: accountId });

    if (!account) {
      throw new Error(`Account not found with id: ${accountId}`);
    }

    const pages = await NylasPages.find(
      { accountId },
      {
        appClientId: 0,
        appOrganizationId: 0,
        editToken: 0,
        pageId: 0
      }
    );

    if (pages.length !== 0) {
      return pages;
    }

    const accessToken = account.nylasToken;

    await storePages(await getSchedulePages(accessToken), accountId);

    return NylasPages.find(
      { accountId },
      {
        appClientId: 0,
        appOrganizationId: 0,
        editToken: 0,
        pageId: 0
      }
    );
  } catch (e) {
    debugNylas(`Failed to get schedule pages: ${e.message}`);
  }
};

export const nylasGetSchedulePage = async (pageId: string) => {
  return NylasPages.findOne(
    { _id: pageId },
    {
      appClientId: 0,
      appOrganizationId: 0,
      editToken: 0,
      pageId: 0
    }
  );
};

export const nylasCreateSchedulePage = async (
  accountId: string,
  doc: INylasSchedulePageDoc
) => {
  try {
    debugNylas(`Creating event in calendar with accountId: ${accountId}`);

    const account = await Accounts.findOne({ _id: accountId });

    if (!account) {
      throw new Error(`Account not found with id: ${accountId}`);
    }

    return createSchedulePage(account.nylasToken, doc, accountId);
  } catch (e) {
    debugNylas(`Failed to create event: ${e.message}`);
  }
};

export const nylasUpdateSchedulePage = async (
  _id: string,
  doc: INylasSchedulePageDoc
) => {
  try {
    debugNylas(`Updating page id: ${_id}`);

    const page = await NylasPages.findOne({ _id });

    if (!page) {
      throw new Error(`Page not found with id: ${_id}`);
    }

    const { pageId, editToken } = page;

    return updateSchedulePage(pageId, doc, editToken);
  } catch (e) {
    debugNylas(`Failed to create event: ${e.message}`);
  }
};

export const nylasDeleteSchedulePage = async (_id: string) => {
  try {
    debugNylas(`Deleting schedule page id: ${_id}`);

    const page = await NylasPages.findOne({ _id }).lean();

    if (!page) {
      throw new Error(`page not found with id: ${_id}`);
    }

    const { pageId, accountId } = page;

    const account = await Accounts.findOne({ _id: accountId });

    await deleteSchedulePage(pageId, account.nylasToken);

    await NylasPages.deleteOne({ _id });
  } catch (e) {
    debugNylas(`Failed to delete event: ${e.message}`);

    throw e;
  }
};
