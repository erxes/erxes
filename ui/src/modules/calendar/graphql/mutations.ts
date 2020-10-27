const createEvent = `
  mutation createCalendarEvent(
    $erxesApiId: String!,
    $calendarId: String!,
    $title: String!, 
    $description: String, 
    $start: String, 
    $end: String
  ) {
    createCalendarEvent(
      erxesApiId: $erxesApiId,
      calendarId: $calendarId,
      title: $title, 
      description: $description, 
      start: $start,
      end: $end
    )
  }
`;

export default {
  createEvent
};
