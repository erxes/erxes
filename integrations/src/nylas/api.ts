import * as fs from 'fs';
import * as Nylas from 'nylas';
import { debugNylas } from '../debuggers';
import { Integrations } from '../models';
import { sendRequest } from '../utils';
import { NYLAS_API_URL } from './constants';
import {
  ICalendarAvailability,
  IEvent,
  IEventDoc,
  IMessageDraft
} from './types';

/**
 * Build message and send API request
 * @param {String} - child function name
 * @param {String} - accessToken
 * @param {String} - filter
 * @param {Promise} - nylas message object
 */
const buildMessage = (child: string, ...args: string[]) => {
  const [accessToken, filter] = args;

  return nylasRequest({
    parent: 'messages',
    child,
    accessToken,
    filter
  });
};

/**
 * Get messages
 * @param {String} - accessToken
 * @param {Object} - filter
 * @returns {Promise} - nylas list of messagas
 */
const getMessages = (...args: string[]) => buildMessage('list', ...args);

/**
 * Get message by filtered args
 * @param {String} - accessToken
 * @param {Object} - filter
 * @returns {Promise} - nylas message object
 */
const getMessageById = (...args: string[]) => buildMessage('find', ...args);

/**
 * Send or Reply message
 * @param {String} accessToken
 * @param {Object} args - message object
 * @returns {Promise} message object response
 */
const sendMessage = (accessToken: string, args: IMessageDraft) => {
  return nylasInstanceWithToken({
    accessToken,
    name: 'drafts',
    method: 'build',
    options: args,
    action: 'send'
  });
};

/**
 * Upload a file to Nylas
 * @param {String} accessToken - nylas account accessToken
 * @param {String} name
 * @param {String} path
 * @param {String} fileType
 * @returns {Promise} - nylas file object
 */
const uploadFile = async (file, accessToken: string) => {
  const buffer = await fs.readFileSync(file.path);

  if (!buffer) {
    throw new Error('Failed to read file');
  }

  const nylasFile = await nylasInstanceWithToken({
    accessToken,
    name: 'files',
    method: 'build',
    options: {
      data: buffer,
      filename: file.name,
      contentType: file.type
    }
  });

  return nylasFileRequest(nylasFile, 'upload');
};

/**
 * Get attachment with file id from nylas
 * @param {String} fileId
 * @param {String} accessToken
 * @returns {Buffer} file buffer
 */
const getAttachment = async (fileId: string, accessToken: string) => {
  const nylasFile = await nylasInstanceWithToken({
    accessToken,
    name: 'files',
    method: 'build',
    options: { id: fileId }
  });

  return nylasFileRequest(nylasFile, 'download');
};

/**
 * Check nylas credentials
 * @returns void
 */
const checkCredentials = () => {
  return Nylas.clientCredentials();
};

/**
 * Set token for nylas and
 * check credentials
 * @param {String} accessToken
 * @returns {Boolean} credentials
 */
export const setNylasToken = (accessToken: string) => {
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
 * Request to Nylas SDK
 * @param {String} - accessToken
 * @param {String} - parent
 * @param {String} - child
 * @param {String} - filter
 * @returns {Promise} - nylas response
 */
export const nylasRequest = ({
  parent,
  child,
  accessToken,
  filter
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
export const nylasFileRequest = (nylasFile: any, method: string) => {
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
export const nylasInstance = (
  name: string,
  method: string,
  options?: any,
  action?: string
) => {
  if (!action) {
    return Nylas[name][method](options);
  }

  return Nylas[name][method](options)[action]();
};

/**
 * Get Nylas SDK instance with token
 */
export const nylasInstanceWithToken = async ({
  accessToken,
  name,
  method,
  options,
  action
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
 * Enable or Disable nylas account billing state
 * @param {String} accountId
 * @param {Boolean} enable
 */
export const enableOrDisableAccount = async (
  accountId: string,
  enable: boolean
) => {
  debugNylas(`${enable} account with uid: ${accountId}`);

  await nylasInstance('accounts', 'find', accountId).then(account => {
    if (enable) {
      return account.upgrade();
    }

    return account.downgrade();
  });
};

/**
 * Revoke nylas token
 * @param {String} accountId
 */
export const revokeTokenAccount = async (accountId: string) => {
  debugNylas(`account with uid: ${accountId}`);

  await nylasInstance('accounts', 'find', accountId).then(account =>
    account.revokeAll()
  );
};

export const checkEmailDuplication = async (
  email: string,
  kind: string
): Promise<any> => {
  debugNylas(`Checking email duplication: ${email}`);

  return Integrations.exists({ email, kind });
};

const getCalendarOrEvent = async (
  id: string,
  type: 'calendars' | 'events',
  accessToken: string
) => {
  try {
    const response = await nylasInstanceWithToken({
      accessToken,
      name: type,
      method: 'find',
      options: id
    });

    if (!response) {
      throw new Error(`${type} with id ${id} not found`);
    }

    return JSON.parse(response);
  } catch (e) {
    debugNylas(`Failed to get events: ${e.message}`);

    throw e;
  }
};

const getCalenderOrEventList = async (
  type: 'calendars' | 'events',
  accessToken: string,
  filter?: {
    show_cancelled?: boolean;
    event_id?: string;
    calendar_id?: string;
    description?: string;
    title?: string;
    date?: string;
  }
) => {
  const options: any = filter || {};

  const extractDate = (date: Date) => {
    return {
      month: date.getMonth(),
      year: date.getFullYear(),
      date: date.getDate()
    };
  };

  if (type === 'events') {
    options.expand_recurring = true;
  }

  if (type === 'events' && !filter.date) {
    const { month, year } = extractDate(new Date());

    options.starts_after = new Date(year, month, 1).getTime() / 1000;
    options.ends_before = new Date(year, month + 1, 0).getTime() / 1000;
  }

  try {
    const responses = await nylasInstanceWithToken({
      accessToken,
      name: type,
      method: 'list',
      options
    });

    if (!responses) {
      throw new Error(`${type} not found`);
    }

    return responses.map(response => JSON.parse(response));
  } catch (e) {
    debugNylas(`Failed to get list: ${e.message}`);

    throw e;
  }
};

const checkCalendarAvailability = async (
  email: string,
  dates: { startTime: number; endTime: number },
  accessToken: string
): Promise<ICalendarAvailability[]> => {
  try {
    const responses = await sendRequest({
      url: `${NYLAS_API_URL}/calendars/free-busy`,
      method: 'POST',
      headerParams: {
        Authorization: `Basic ${Buffer.from(`${accessToken}:`).toString(
          'base64'
        )}`
      },
      body: {
        start_time: dates.startTime,
        end_time: dates.endTime
      }
    });

    if (!responses) {
      throw new Error(`Failed to check calendar availability with ${email}`);
    }

    return responses.map(response => JSON.parse(response));
  } catch (e) {
    debugNylas(`Failed to check availability: ${e.message}`);

    throw e;
  }
};

const deleteCalendarEvent = async (eventId: string, accessToken: string) => {
  try {
    await sendRequest({
      url: `${NYLAS_API_URL}/events/${eventId}`,
      method: 'DELETE',
      headerParams: {
        Authorization: `Basic ${Buffer.from(`${accessToken}:`).toString(
          'base64'
        )}`
      },
      body: {
        notify_participants: true
      }
    });

    debugNylas(`Successfully deleted the event`);
  } catch (e) {
    debugNylas(`Failed to delete event: ${e.message}`);

    throw e;
  }
};

const generateEventParams = (doc: IEventDoc) => {
  const start = new Date(doc.start).getTime() / 1000;
  const end = new Date(doc.end).getTime() / 1000;

  const params = { when: { start_time: start, end_time: end }, start, end };
  const { rrule, timezone } = doc;

  if (!rrule) {
    return params;
  }

  return {
    ...params,
    recurrence: {
      rrule: [rrule],
      timezone
    }
  };
};

const createEvent = async (
  doc: IEventDoc,
  accessToken: string
): Promise<IEvent> => {
  try {
    const event = await nylasInstanceWithToken({
      accessToken,
      name: 'events',
      method: 'build'
    });

    const {
      start,
      end,
      when,
      recurrence
    }: {
      start: number;
      end: number;
      when: { [key: string]: number };
      recurrence?: any;
    } = generateEventParams(doc);

    event.title = doc.title;
    event.location = doc.location;
    event.description = doc.description;
    event.busy = doc.busy;
    event.calendarId = doc.calendarId;
    event.participants = doc.participants;
    event.when = when;
    event.start = start;
    event.end = end;

    if (recurrence) {
      event.recurrence = recurrence;
    }

    debugNylas(`Successfully created the calendar event`);

    return event.save({ notify_participants: doc.notifyParticipants });
  } catch (e) {
    debugNylas(`Failed to create event: ${e.message}`);

    throw e;
  }
};

const updateEvent = async (
  eventId: string,
  doc: IEventDoc,
  accessToken: string
): Promise<IEvent> => {
  try {
    const params = generateEventParams(doc);

    const response = await sendRequest({
      url: `${NYLAS_API_URL}/events/${eventId}`,
      method: 'PUT',
      headerParams: {
        Authorization: `Basic ${Buffer.from(`${accessToken}:`).toString(
          'base64'
        )}`
      },
      params: {
        notify_participants: doc.notifyParticipants
      },
      body: {
        title: doc.title,
        location: doc.location,
        calendar_id: doc.calendarId,
        status: doc.status,
        busy: doc.busy,
        read_only: doc.readonly,
        participants: doc.participants,
        description: doc.description,
        when: params.when || doc.when,
        start: params.start,
        end: params.end
      }
    });

    debugNylas(`Successfully updated the event with id: ${eventId}`);

    return response;
  } catch (e) {
    debugNylas(`Failed to update event: ${e.message}`);

    throw e;
  }
};

// Emailed events calendar type only
const sendEventAttendance = async (
  eventId: string,
  args: { status: 'yes' | 'no' | 'maybe'; comment?: string },
  accessToken: string
) => {
  try {
    const event = await nylasInstanceWithToken({
      accessToken,
      name: 'events',
      method: 'find',
      options: eventId
    });

    if (!event) {
      throw new Error(`Failed to send attendance with event id: ${eventId}`);
    }

    event.rsvp(args.status, args.comment);

    debugNylas(`Successfully send attendance with event id: ${eventId}`);
  } catch (e) {
    debugNylas(`Failed to send event attendance: ${e.message}`);

    throw e;
  }
};

export {
  uploadFile,
  sendMessage,
  getMessageById,
  getMessages,
  getAttachment,
  checkCredentials,
  getCalenderOrEventList,
  getCalendarOrEvent,
  checkCalendarAvailability,
  deleteCalendarEvent,
  createEvent,
  updateEvent,
  sendEventAttendance
};
