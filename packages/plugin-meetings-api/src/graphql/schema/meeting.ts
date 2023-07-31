export const queries = `
  meetings: [Meeting]
  meetingDetail(_id: String!): Meeting
`;
const params = `
  title: String
  description: String
  startDate: Date
  endDate: Date
  location: String
  createdBy: String
  status: String
  participantIds: [String]
`;

export const mutations = `
  meetingAdd(${params}): Meeting
  meetingEdit(_id: String!,${params}): Meeting
  meetingCancel(_id: String!): String
  meetingRemove(_id: String!): String
`;
