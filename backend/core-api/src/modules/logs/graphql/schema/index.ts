export const types = `
    type Log {
      _id: String
      createdAt: Date
      payload:JSON,
      source:String,
      action:String,
      status:String,
      userId:String,
      cursor:String,

      user:User
      prevObject:JSON
    }

    type MainLogsList {
        list:[Log]
        totalCount: Int
        pageInfo: PageInfo
    }

    type ActivityLogsList {
        list:[ActivityLog]
        totalCount: Int
        pageInfo: PageInfo
    }

    type ActivityLog {
        _id: String
        createdAt: Date
        activityType: String
        actorType: String
        actor: JSON
        targetType: String
        target: JSON
        action: JSON
        context: JSON
        contextType: String
        changes: JSON
        metadata: JSON
    }

`;

const cursorParams = `
  limit: Int
  cursor: String
  direction: CURSOR_DIRECTION
  cursorMode: CURSOR_MODE
`;

export const commonListQueryParams = `
    searchValue:String,
    page:Int,
    perPage:Int,
    ids:[String]
    excludeIds:[String]
`;

const commonQueryParams = `
    ${commonListQueryParams},
    ${cursorParams},
    filters:JSON
`;

const activityLogQueryParams = `
    ${cursorParams},
    targetType: String!
    targetId: String!
    action: String
`;

export const queries = `
    logsMainList(${commonQueryParams}):MainLogsList
    logDetail(_id:String!):Log
    activityLogs(${activityLogQueryParams}):ActivityLogsList
`;
export default { types, queries };
