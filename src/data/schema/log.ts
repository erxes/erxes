export const types = `
  type Log {
    _id: String
    createdAt: Date
    createdBy: String
    type: String
    action: String
    oldData: String
    newData: String
    objectId: String
    unicode: String
    description: String
  }

  type LogList {
    logs: [Log]
    totalCount: Int
  }
`;

export const queries = `
  logs(
    start: String,
    end: String,
    userId: String,
    action: String,
    page: Int,
    perPage: Int
  ): LogList
`;
