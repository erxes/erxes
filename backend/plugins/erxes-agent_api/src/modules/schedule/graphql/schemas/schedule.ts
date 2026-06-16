export const types = `
  type MastraSchedule {
    _id: String
    name: String
    description: String
    agentId: String
    cron: String
    timezone: String
    prompt: String
    isEnabled: Boolean
    createdByUserId: String
    threadId: String
    lastRunAt: Date
    lastStatus: String
    lastError: String
    lastReply: String
    lastDurationMs: Int
    runCount: Int
    createdAt: Date
    updatedAt: Date
  }

  input MastraScheduleInput {
    name: String!
    description: String
    agentId: String!
    cron: String!
    timezone: String
    prompt: String!
    isEnabled: Boolean
  }

  input MastraScheduleUpdateInput {
    name: String
    description: String
    agentId: String
    cron: String
    timezone: String
    prompt: String
    isEnabled: Boolean
  }
`;

export const queries = `
  mastraSchedules: [MastraSchedule]
  mastraSchedule(_id: String!): MastraSchedule
`;

export const mutations = `
  mastraScheduleCreate(doc: MastraScheduleInput!): MastraSchedule
  mastraScheduleUpdate(_id: String!, doc: MastraScheduleUpdateInput!): MastraSchedule
  mastraScheduleRemove(_id: String!): JSON
  mastraScheduleSetEnabled(_id: String!, isEnabled: Boolean!): MastraSchedule
  mastraScheduleRunNow(_id: String!): MastraSchedule
`;
