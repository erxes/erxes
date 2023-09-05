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
  status: String
  participantIds: [String]
  companyId: String
  method: String
`;
export const meetingFilters = `
    companyId:String,
    createdAtFrom:String,
    createdAtTo:String,
    searchValue:String
    userId:String,
    participantIds: [String]
    isPreviousSession: Boolean
    perPage: Int
    page: Int
`;

export const queries = `
  meetings(${commonParams}, ${meetingFilters}): [Meeting]
  meetingDetail(_id: String!): Meeting
`;

export const mutations = `
  meetingAdd(${params}, createdBy: String): Meeting
  meetingEdit(_id: String!,${params}): Meeting
  meetingCancel(_id: String!): String
  meetingRemove(_id: String!): String
`;
