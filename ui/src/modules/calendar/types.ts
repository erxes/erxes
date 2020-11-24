export interface ICalendar {
  _id: string;
  object: 'calendar';
  account_id: string;
  name?: string;
  description?: string;
  readOnly: boolean;
  providerCalendarId: string;
}

export interface IEvent {
  _id: string;
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
  providerCalendarId: string;
  providerEventId: string;
}

export interface INylasCalendar {
  _id: string;
  providerCalendarId: string;
  accountUid: string;
  name: string;
  description: string;
  readOnly: boolean;
}

export interface IAccount {
  _id: string;
  name: string;
  color: string;
  accountId: string;
  userId: string;
  isPrimary: boolean;

  calendars: INylasCalendar[];
}
