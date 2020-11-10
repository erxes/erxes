const commonParamsDef = `
  $erxesApiId: String!,
  $calendarId: String!,
  $title: String!,
  $description: String,
  $start: String,
  $end: String
`;

const commonParams = `
  erxesApiId: $erxesApiId,
  calendarId: $calendarId,
  title: $title,
  description: $description,
  start: $start,
  end: $end
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
    $erxesApiId: String!,
  ) {
    deleteCalendarEvent(
      _id: $_id,
      erxesApiId: $erxesApiId,
    )
  }
`;

export default {
  createEvent,
  editEvent,
  deleteEvent
};
