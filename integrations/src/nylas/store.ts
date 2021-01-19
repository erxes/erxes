import { debugNylas } from '../debuggers';
import memoryStorage from '../inmemoryStorage';
import { sendRPCMessage } from '../messageBroker';
import { cleanHtml } from '../utils';
import {
  NylasCalendars,
  NylasEvents,
  NylasExchangeConversationMessages,
  NylasExchangeConversations,
  NylasExchangeCustomers,
  NylasGmailConversationMessages,
  NylasGmailConversations,
  NylasGmailCustomers,
  NylasImapConversationMessages,
  NylasImapConversations,
  NylasImapCustomers,
  NylasOffice365ConversationMessages,
  NylasOffice365Conversations,
  NylasOffice365Customers,
  NylasOutlookConversationMessages,
  NylasOutlookConversations,
  NylasOutlookCustomers,
  NylasPages,
  NylasYahooConversationMessages,
  NylasYahooConversations,
  NylasYahooCustomers
} from './models';
import {
  ICalendar,
  IEvent,
  IGetOrCreateArguments,
  INylasConversationArguments,
  INylasConversationMessageArguments,
  INylasCustomerArguments,
  IPage
} from './types';

const NYLAS_MODELS = {
  gmail: {
    customers: NylasGmailCustomers,
    conversations: NylasGmailConversations,
    conversationMessages: NylasGmailConversationMessages
  },
  exchange: {
    customers: NylasExchangeCustomers,
    conversations: NylasExchangeConversations,
    conversationMessages: NylasExchangeConversationMessages
  },
  imap: {
    customers: NylasImapCustomers,
    conversations: NylasImapConversations,
    conversationMessages: NylasImapConversationMessages
  },
  outlook: {
    customers: NylasOutlookCustomers,
    conversations: NylasOutlookConversations,
    conversationMessages: NylasOutlookConversationMessages
  },
  yahoo: {
    customers: NylasYahooCustomers,
    conversations: NylasYahooConversations,
    conversationMessages: NylasYahooConversationMessages
  },
  office365: {
    customers: NylasOffice365Customers,
    conversations: NylasOffice365Conversations,
    conversationMessages: NylasOffice365ConversationMessages
  }
};

const storeCalendars = async (calendars: ICalendar[]) => {
  const doc = [];

  for (const calendar of calendars) {
    if (!calendar.read_only) {
      doc.push({
        providerCalendarId: calendar.id,
        accountUid: calendar.account_id,
        name: calendar.name || '',
        description: calendar.description,
        readOnly: calendar.read_only,
        show: true
      });
    }
  }

  return NylasCalendars.insertMany(doc);
};

const updateCalendar = async (calendar: ICalendar) => {
  const prevCalendar = await NylasCalendars.findOne({
    providerCalendarId: calendar.id
  });

  if (!prevCalendar) {
    throw new Error(`Calendar not found to be updated ${calendar.id}`);
  }

  prevCalendar.name = calendar.name;
  prevCalendar.description = calendar.description;
  prevCalendar.readOnly = calendar.read_only;

  return prevCalendar.save();
};

const updateEvent = async (event: IEvent) => {
  const prevEvent = await NylasEvents.findOne({ providerEventId: event.id });

  if (!prevEvent) {
    throw new Error(`Event not found to be updated ${event.id}`);
  }

  prevEvent.providerEventId = event.id;
  prevEvent.providerCalendarId = event.calendar_id;
  prevEvent.messageId = event.message_id;
  prevEvent.title = event.title;
  prevEvent.accountUid = event.account_id;
  prevEvent.description = event.description;
  prevEvent.owner = event.owner;
  prevEvent.participants = event.participants;
  prevEvent.readOnly = event.read_only;
  prevEvent.location = event.location;
  prevEvent.when.end_time = event.when.end_time;
  prevEvent.when.start_time = event.when.start_time;
  prevEvent.busy = event.busy;
  prevEvent.status = event.status;

  return prevEvent.save();
};

const storeEvents = async (events: IEvent[], eventIds?: string[]) => {
  const doc = [];

  for (const event of events) {
    if (!eventIds || !eventIds.includes(event.id)) {
      doc.push({
        providerEventId: event.id,
        providerCalendarId: event.calendar_id,
        messageId: event.message_id,
        title: event.title,
        accountUid: event.account_id,
        description: event.description,
        owner: event.owner,
        participants: event.participants,
        readOnly: event.read_only,
        location: event.location,
        when: event.when,
        busy: event.busy,
        status: event.status
      });
    }
  }

  return NylasEvents.insertMany(doc);
};

const storePages = async (pages: IPage[], accountId: string) => {
  const doc = [];

  for (const page of pages) {
    const config = page.config;
    const appearance = config.appearance;
    const booking = config.booking;

    doc.push({
      accountId,
      name: page.name,
      slug: page.slug,
      appClientId: page.app_client_id,
      appOrganizationId: page.app_organization_id,
      editToken: page.edit_token,
      pageId: page.id,
      createdAt: page.created_at,
      modifiedAt: page.modified_at,
      config: {
        appearance: {
          color: appearance.color,
          companyName: appearance.company_name,
          logo: appearance.logo,
          submitText: appearance.submit_text,
          thankYouText: appearance.thank_you_text,
          showAutoschedule: appearance.show_autoschedule,
          showNylasBranding: appearance.show_nylas_branding
        },
        event: {
          title: config.event.title,
          location: config.event.location,
          duration: config.event.duration
        },
        booking: {
          openingHours: booking.opening_hours,
          additionalFields: booking.additional_fields,
          cancellationPolicy: booking.cancellation_policy,
          confirmationMethod: booking.confirmation_method,
          minBookingNotice: booking.min_booking_notice,
          availableDaysInFuture: booking.available_days_in_future,
          minBuffer: booking.min_buffer,
          minCancellationNotice: booking.min_cancellation_notice
        },
        reminders: config.reminders,
        pageCalendarIds: config.calendar_ids,
        locale: config.locale,
        timezone: config.timezone
      }
    });
  }

  return NylasPages.insertMany(doc);
};

/**
 * Create or get nylas customer
 * @param {String} kind
 * @param {String} toEmail
 * @param {Object} from - email, name
 * @param {Object} integrationIds - id, erxesApiId
 * @param {Object} message
 * @returns {Promise} customer object
 */
const createOrGetNylasCustomer = async ({
  kind,
  toEmail,
  integrationIds,
  message
}: INylasCustomerArguments) => {
  const { id, erxesApiId } = integrationIds;
  const [{ email, name }] = message.from;

  debugNylas('Create or get nylas customer function called...');

  const common = { kind, firstName: name, lastName: '' };

  const doc = {
    email,
    integrationId: id,
    ...common
  };

  // fields to save on api
  const api = {
    emails: [email],
    primaryEmail: email,
    integrationId: erxesApiId,
    ...common
  };

  let customer;

  try {
    customer = await getOrCreate({
      kind,
      collectionName: 'customers',
      selector: { email },
      fields: { doc, api }
    });
  } catch (e) {
    debugNylas(`Failed to getOrCreate customer: ${e.message}`);
    throw new Error(e);
  }

  return {
    kind,
    message,
    integrationIds,
    customerId: customer.erxesApiId,
    emails: {
      fromEmail: email,
      toEmail
    }
  };
};

/**
 * Create or get nylas conversation
 * @param {String} kind
 * @param {String} toEmail
 * @param {String} threadId
 * @param {String} subject
 * @param {Object} emails - toEmail, fromEamil
 * @param {Object} integrationIds - id, erxesApiId
 * @returns {Promise} conversation object
 */
const createOrGetNylasConversation = async ({
  kind,
  customerId,
  integrationIds,
  emails,
  message
}: INylasConversationArguments) => {
  const { toEmail, fromEmail } = emails;
  const { id, erxesApiId } = integrationIds;

  debugNylas(`Creating nylas conversation kind: ${kind}`);

  const createdAt = message.date * 1000; // get milliseconds

  const doc = {
    to: toEmail,
    from: fromEmail,
    integrationId: id,
    threadId: message.thread_id,
    unread: message.unread,
    createdAt
  };

  // fields to save on api
  const api = {
    customerId,
    content: message.subject,
    integrationId: erxesApiId,
    unread: message.unread,
    createdAt
  };

  let conversation;

  try {
    conversation = await getOrCreate({
      kind,
      collectionName: 'conversations',
      fields: { doc, api },
      selector: { threadId: message.thread_id }
    });
  } catch (e) {
    debugNylas(`Failed to getOrCreate conversation: ${e.message}`);
    throw new Error(e);
  }

  return {
    kind,
    message,
    customerId,
    conversationIds: {
      id: conversation._id,
      erxesApiId: conversation.erxesApiId
    }
  };
};

/**
 * Create or get nylas conversation message
 * @param {String} kind
 * @param {Object} conversationIds - id, erxesApiId
 * @param {Object} message
 * @param {String} customerId
 * @returns {Promise} - conversationMessage object
 */
const createOrGetNylasConversationMessage = async ({
  kind,
  conversationIds,
  message,
  customerId
}: INylasConversationMessageArguments) => {
  const { id, erxesApiId } = conversationIds;

  debugNylas(`Creating nylas conversation message kind: ${kind}`);

  const createdAt = message.date * 1000; // get milliseconds

  const doc = {
    customerId,
    conversationId: id,

    // message
    messageId: message.id,
    accountId: message.account_id,
    threadId: message.thread_id,
    subject: message.subject,
    from: message.from,
    to: message.to,
    replyTo: message.replyTo,
    cc: message.cc,
    bcc: message.bcc,
    date: message.date,
    snipped: message.snippet,
    body: message.body,
    attachments: message.files,
    labels: message.labels,
    unread: message.unread,
    createdAt
  };

  const isUnreadMessage = await memoryStorage().inArray(
    'nylas_unread_messageId',
    message.id
  );

  // fields to save on api
  const api = {
    customerId,
    conversationId: erxesApiId,
    content: cleanHtml(message.body),
    unread: isUnreadMessage ? true : message.unread,
    createdAt
  };

  let conversationMessage;

  try {
    conversationMessage = await getOrCreate({
      kind,
      collectionName: 'conversationMessages',
      selector: { messageId: message.id },
      fields: { doc, api }
    });
  } catch (e) {
    debugNylas(`Failed to getOrCreate conversationMessage: ${e.message}`);
    throw new Error(e);
  }

  return conversationMessage;
};

/**
 * Get or create selected model
 * @param {Model} model - Customer, Conversation, ConversationMessage
 * @param {Object} args - doc, selector, apiField, name
 * @param {Promise} selected model
 */
export const getOrCreate = async ({
  kind,
  collectionName,
  selector,
  fields
}: IGetOrCreateArguments) => {
  const map = {
    customers: {
      action: 'get-create-update-customer',
      apiField: 'erxesApiId'
    },
    conversations: {
      action: 'create-or-update-conversation',
      apiField: 'erxesApiId'
    },
    conversationMessages: {
      action: 'create-conversation-message',
      apiField: 'erxesApiMessageId'
    }
  };

  const model = NYLAS_MODELS[kind][collectionName];

  let selectedObj = await model.findOne(selector);

  if (selectedObj === null) {
    selectedObj = await model.create(fields.doc);

    try {
      const action = map[collectionName].action;

      const response = await sendRPCMessage({
        action,
        metaInfo: action.includes('message') ? 'replaceContent' : null,
        payload: JSON.stringify(fields.api)
      });

      selectedObj[map[collectionName].apiField] = response._id;

      await selectedObj.save();
    } catch (e) {
      await model.deleteOne({ _id: selectedObj._id });
      throw e;
    }
  }

  return selectedObj;
};

export {
  createOrGetNylasCustomer,
  createOrGetNylasConversation,
  createOrGetNylasConversationMessage,
  storeCalendars,
  storeEvents,
  updateEvent,
  updateCalendar,
  NYLAS_MODELS,
  storePages
};
