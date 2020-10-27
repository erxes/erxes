const commonMutationParams = `
  erxesApiId: String!,
  calendarId: String!,
`;

const params = `
  title: String!,
  description: String,
  start: String,
  end: String
`;

export const mutations = `
  createCalendarEvent(${commonMutationParams}${params}): JSON
`;
