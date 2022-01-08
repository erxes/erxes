const commonParamsDef = `
  $accountId: String!,
  $calendarId: String!,
  $title: String!,
  $description: String,
  $start: String,
  $end: String

  $participants: [Participant],
  $rrule: String,
  $timezone: String,
  $location: String,
  $busy: Boolean,
`;

const commonParams = `
  accountId: $accountId,
  calendarId: $calendarId,
  title: $title,
  description: $description,
  start: $start,
  end: $end,

  participants: $participants,
  rrule: $rrule,
  timezone: $timezone,
  location: $location,
  busy: $busy,
`;

const createEvent = `
  mutation createCalendarEvent(
    ${commonParamsDef}
  ) {
    createCalendarEvent(
      ${commonParams}
    )
  }
`;

const editEvent = `
  mutation editCalendarEvent(
    $_id: String!,
    ${commonParamsDef}
  ) {
    editCalendarEvent(
      _id: $_id,
      ${commonParams}
    )
  }
`;

const deleteEvent = `
  mutation deleteCalendarEvent(
    $_id: String!,
    $accountId: String!,
  ) {
    deleteCalendarEvent(
      _id: $_id,
      accountId: $accountId,
    )
  }
`;

export default {
  createEvent,
  editEvent,
  deleteEvent
};
