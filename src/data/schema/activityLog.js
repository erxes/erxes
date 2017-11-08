export const inputs = `
  input ActivityLogSortDoc {
    createdAt: String!
  }
`;

export const types = `
  type YearMonthDoc {
    year: Int
    month: Int
  }

  type ActivityContent {
    name: String
  }

  type ActivityLogForMonth {
    date: YearMonthDoc!
    list: [ActivityLog]
  }

  type ActivityLog {
    action: String!
    id: String!
    createdAt: Date!
    content: ActivityContent!
  }
`;
