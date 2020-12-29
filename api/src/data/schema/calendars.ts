const scheduleTypes = `
  input ScheduleAppearance {
    color: String
    companyName: String
    logo: String
    submitText: String
    thankYouText: String
  }

  input ScheduleOpeningHours {
    days: [String]
    start: String
    end: String
  }

  input ScheduleAdditionalField {
    label: String
    name: String
    required: Boolean
    type: String
  }

  input ScheduleBooking {
    openingHours: [ScheduleOpeningHours],
    additionalFields: [ScheduleAdditionalField],
    cancellationPolicy: String,
    confirmationMethod: String,
    minBookingNotice: Int
    availableDaysInFuture: Int
    minBuffer: Int
    minCancellationNotice: Int
  }

  input ScheduleEvent {
    title: String!
    location: String!
    duration: Int!
  }
`;

export const types = `
  type Calendar {
    _id: String!
    name: String
    color: String
    userId: String
    groupId: String
    accountId: String
    isPrimary: Boolean
  }

  type CalendarGroup {
    _id: String!
    name: String
    isPrivate: Boolean
    boardId: String
    memberIds: [String]

    calendars: [Calendar]
  }

  type CalendarBoard {
    _id: String!
    name: String

    groups: [CalendarGroup]
  }

  type NylasCalendar {
    _id: String
    providerCalendarId: String
    accountUid: String
    name: String
    description: String
    readOnly: Boolean
    color: String
    customName: String
  }

  type FullCalendar {
    _id: String!
    name: String
    color: String
    accountId: String
    userId: String
    isPrimary: Boolean

    calendars: [NylasCalendar]
  }

 input Participant {
    name: String
    email: String
    status: String
    comment: String
  }

  ${scheduleTypes}
`;

export const queries = `
  calendarBoards: [CalendarBoard]
  calendarBoardCounts: Int!
  calendarBoardGetLast: CalendarBoard
  calendarBoardDetail(_id: String!): CalendarBoard

  calendarGroups(boardId: String): [CalendarGroup]
  calendarGroupCounts: Int
  calendarGroupGetLast: CalendarGroup
  calendarGroupDetail(_id: String!): CalendarGroup

  calendars(groupId: String, userId: String, page: Int, perPage: Int): [Calendar]
  calendarDetail(_id: String!): Calendar

  calendarAccounts(groupId: String): [FullCalendar]
`;

const eventParams = `
  accountId: String!,
  calendarId: String!,
  title: String!,
  description: String,
  start: String,
  end: String,
  
  participants: [Participant],
  rrule: String,
  timezone: String,
  location: String,
  busy: Boolean,
`;

const commonParams = `
  groupId: String!,
  color: String,
  isPrimary: Boolean,
`;

const commonGroupParams = `
  name: String!,
  boardId: String!,
  isPrivate: Boolean,
  memberIds: [String],
`;

const scheduleParams = `
  accountId: String!,
  appearance: ScheduleAppearance,
  calendarIds: [String],
  booking: ScheduleBooking
  event: ScheduleEvent!,
  timezone: String!,
  name: String!,
  slug: String!
`;

export const mutations = `
  createCalendarEvent(${eventParams}): JSON
  editCalendarEvent(_id: String!, ${eventParams}): JSON
  deleteCalendarEvent(_id: String!, accountId: String!): JSON
  createSchedulePage(${scheduleParams}): JSON
  editSchedulePage(_id: String!, ${scheduleParams}): JSON
  deleteSchedulePage(pageId: String!): JSON

  calendarsAdd(uid: String, ${commonParams}): Calendar
  calendarsEdit(_id: String!, ${commonParams}): Calendar
  calendarsDelete(_id: String!, accountId: String!): JSON

  calendarGroupsAdd(${commonGroupParams}): CalendarGroup
  calendarGroupsEdit(_id: String!, ${commonGroupParams}): CalendarGroup
  calendarGroupsDelete(_id: String!): JSON

  calendarBoardsAdd(name: String!): CalendarBoard
  calendarBoardsEdit(_id: String!, name: String): CalendarBoard
  calendarBoardsDelete(_id: String!): JSON
  editAccountCalendar(_id: String!, name: String, color: String, show: Boolean): JSON
`;
