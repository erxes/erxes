const commonParams = `
  status:String
  sortField:String
  sortDirection:Int
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
  companyId: String
`;

export const queries = `
  meetings(${commonParams}, participantIds: [String], companyId: String): [Meeting]
  meetingDetail(_id: String!): Meeting
`;

export const mutations = `
  meetingAdd(${params}): Meeting
  meetingEdit(_id: String!,${params}): Meeting
  meetingCancel(_id: String!): String
  meetingRemove(_id: String!): String
`;
