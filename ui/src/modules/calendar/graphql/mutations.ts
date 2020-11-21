const commonParamsDef = `
  $accountId: String!,
  $calendarId: String!,
  $title: String!,
  $description: String,
  $start: String,
  $end: String

  $participants: [Participant]
  $memberIds: [String]
`;

const commonParams = `
  accountId: $accountId,
  calendarId: $calendarId,
  title: $title,
  description: $description,
  start: $start,
  end: $end,

  participants: $participants
  memberIds: $memberIds
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
