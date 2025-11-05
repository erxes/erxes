export const types = `
  type EngageLog {
    _id: String
    createdAt: Date
    engageMessageId: String
    message: String
    type: String
  }
`;

export const queries = `
  engageLogs(engageMessageId: String!, page: Int, perPage: Int): [EngageLog]
`;
