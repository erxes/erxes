import {
  IAttachments,
  IEmail,
  ILabels,
  INylasConversationMessage
} from './models';

interface ICommonType {
  name?: string;
  email?: string;
}

export interface INylasAttachment {
  name: string;
  path: string;
  type: string;
  accessToken: string;
}

export interface IMapArgument {
  email: string;
  password: string;
}

export interface IMessageDraft {
  to?: ICommonType[];
  from?: ICommonType[];
  cc?: ICommonType[];
  bcc?: ICommonType[];
  replyToMessageId?: string;
  threadId?: string;
  files?: INylasAttachment[];
  subject: string;
  body?: string;
}

export interface IGetOrCreateArguments {
  kind: string;
  collectionName: string;
  selector: { [key: string]: string };
  fields: {
    doc: {
      [key: string]:
        | string
        | string[]
        | boolean
        | number
        | IEmail[]
        | IAttachments[]
        | ILabels[];
    };
    api: IAPIConversation | IAPIConversationMessage | IAPICustomer;
  };
}

export interface IIntegrateProvider {
  email: string;
  kind: string;
  settings: IProviderSettings;
  scopes?: string | string[];
}

export interface IProviderSettings {
  eas_server_host?: string;
  imap_username?: string;
  imap_password?: string;
  smtp_username?: string;
  smtp_password?: string;
  imap_host?: string;
  imap_port?: number;
  smtp_host?: string;
  smtp_port?: number;
  ssl_required?: boolean;
  redirect_uri?: string;
  google_refresh_token?: string;
  google_client_id?: string;
  google_client_secret?: string;
  email?: string;
  username?: string;
  password?: string;
}

// API ====================
export interface IAPICustomer {
  emails: string[];
  primaryEmail: string;
  integrationId: string;
  firstName: string;
  lastName: string;
  kind: string;
}

export interface IAPIConversation {
  integrationId: string;
  customerId: string;
  content: string;
  unread: boolean;
  createdAt: number;
}

export interface IAPIConversationMessage {
  conversationId: string;
  customerId: string;
  content: string;
  unread: boolean;
  createdAt: number;
}

// Store =======================
export interface INylasAccountArguments {
  kind: string;
  email: string;
  accountId: string;
  accessToken: string;
}

export interface INylasCustomerArguments {
  kind: string;
  toEmail: string;
  message: any;
  integrationIds: {
    id: string;
    erxesApiId: string;
  };
}

export interface INylasConversationArguments {
  kind: string;
  customerId: string;
  message: INylasConversationMessage;
  emails: {
    toEmail: string;
    fromEmail: string;
  };
  integrationIds: {
    id: string;
    erxesApiId: string;
  };
}

export interface INylasConversationMessageArguments {
  kind: string;
  customerId: string;
  conversationIds: {
    id: string;
    erxesApiId: string;
  };
  message: INylasConversationMessage & { id: string };
}

export interface IEvent {
  id: string;
  object: 'event';
  account_id: string;
  calendar_id: string;
  message_id?: string;
  title?: string;
  description?: string;
  owner: string;
  time?: {
    object: 'time';
    time?: number;
  };
  participants: Array<{
    name?: string;
    email: string;
    status?: string;
    comment?: string;
  }>;
  read_only: boolean;
  location: string;
  when: {
    end_time: number;
    start_time: number;
  };
  busy: boolean;
  status: string;
}

export interface ICalendar {
  id: string;
  object: 'calendar';
  account_id: string;
  name?: string;
  description?: string;
  read_only: boolean;
}

export interface ICalendarAvailability {
  object: 'free_busy';
  email: string;
  time_slots: Array<{
    object: 'time_slot';
    status: string;
    start_time: number;
    end_time: number;
  }>;
}

export interface IParticipants {
  name?: string;
  email?: string;
  status?: string;
  comment?: string;
}

export interface IEventDoc {
  title?: string;
  location?: string;
  description?: string;
  busy?: boolean;
  status?: string;
  calendarId: string;
  when: any;
  start: any;
  end: any;
  readonly: boolean;
  participants: IParticipants[];
  notifyParticipants: boolean;
  rrule?: string;
  timezone?: string;
}

export interface INylasIntegrationData {
  username?: string;
  password?: string;
  email?: string;
  host?: string;
  imapHost?: string;
  imapPort?: number;
  smtpHost?: string;
  smtpPort?: number;
  uid?: string;
  billingState?: string;
}

export interface ICalendarParams {
  _id: string;
  name?: string;
  color?: string;
  show?: boolean;
}

export interface INylasSchedulePageDoc {
  name: string;
  slug: string;
  timezone: string;
  calendarIds: string[];
  event: {
    title: string;
    location: string;
    duration: number;
  };
  appearance?: {
    color: string;
    companyName?: string;
    logo?: string;
    submitText?: string;
    thankYouText?: string;
  };
  booking?: {
    openingHours?: {
      days: string[];
      start: string;
      end: string;
    };
    additionalFields?: {
      label: string;
      name?: string;
      required: boolean;
      type: string;
    };
    cancellationPolicy?: string;
    confirmationMethod?: string;
    minBookingNotice?: number;
    availableDaysInFuture?: number;
    minBuffer?: number;
    minCancellationNotice?: number;
  };
}
export interface ISchedulePageConfig {
  eas_server_host?: string;
  imap_username?: string;
  imap_password?: string;
  smtp_username?: string;
  smtp_password?: string;
  imap_host?: string;
  imap_port?: number;
  smtp_host?: string;
  smtp_port?: number;
  ssl_required?: boolean;
  redirect_uri?: string;
  google_refresh_token?: string;
  google_client_id?: string;
  google_client_secret?: string;
  email?: string;
  username?: string;
  password?: string;
}
export interface IPage {
  app_client_id: string;
  app_organization_id: number;
  created_at: string;
  edit_token: string;
  id: number;
  modified_at: string;
  name: string;
  slug: string;
  config: {
    appearance: {
      color: string;
      company_name: string;
      logo: string;
      show_autoschedule: boolean;
      show_nylas_branding: boolean;
      submit_text: string;
      thank_you_text: string;
    };
    booking: {
      additional_fields: any;
      available_days_in_future: number;
      calendar_invite_to_guests: boolean;
      confirmation_emails_to_guests: boolean;
      confirmation_emails_to_host: boolean;
      confirmation_method: string;
      min_booking_notice: number;
      min_buffer: number;
      min_cancellation_notice: number;
      opening_hours: any;
      scheduling_method: string;
      cancellation_policy: string;
    };
    calendar_ids: {
      [key: string]: { availability: any; booking: string };
    };
    event: { duration: number; location: string; title: string };
    locale: string;
    reminders: any;
    timezone: string;
  };
}
