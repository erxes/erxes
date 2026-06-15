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
      processId:String,
      contentType:String,
      name:String,

      user:User
      prevObject:JSON
    }

    type MainLogsList {
        list:[Log]
        totalCount: Int
        pageInfo: PageInfo
    }

    type LogContentType {
      value: String!
      pluginName: String!
      moduleName: String!
      collectionName: String!
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

    type LogRevertField {
        field: String!
        revertValue: JSON
        currentValue: JSON
    }

    type LogRevertConflict {
        contentType: String!
        docId: String!
        mongooseName: String!
        fields: [LogRevertField!]!
    }

    type LogRevertApplied {
        contentType: String!
        docId: String!
        kind: String!
    }

    type LogRevertUnrevertable {
        contentType: String
        docId: String
        action: String!
        reason: String!
    }

    type LogRevertResult {
        processId: String!
        requestProcessId: String!
        dryRun: Boolean!
        alreadyReverted: Boolean!
        reverted: [LogRevertApplied!]!
        conflicts: [LogRevertConflict!]!
        unrevertable: [LogRevertUnrevertable!]!
    }

    input LogRevertFieldResolutionInput {
        field: String!
        mode: String!
        value: JSON
    }

    input LogRevertDocResolutionInput {
        contentType: String!
        docId: String!
        fields: [LogRevertFieldResolutionInput!]!
    }
`;

const cursorParams = `
  limit: Int
  cursor: String
  direction: CURSOR_DIRECTION
  cursorMode: CURSOR_MODE
`;

export const commonListQueryParams = `
    page:Int,
    perPage:Int,
    ids:[String]
    excludeIds:[String]
`;

const commonQueryParams = `
    ${commonListQueryParams},
    ${cursorParams},
    status: String
    source: String
    action: String
    userIds: [String]
    contentType: String
    documentId: String
    createdAtFrom: Date
    createdAtTo: Date
    filters:JSON
`;

const activityLogQueryParams = `
    ${cursorParams},
    targetType: String
    targetId: String!
    action: String
    variant: String
`;

export const queries = `
    activityLogs(${activityLogQueryParams}):ActivityLogsList
    logsMainList(${commonQueryParams}):MainLogsList
    logsGetContentTypes: [LogContentType!]!
    logDetail(_id:String!):Log
`;

export const mutations = `
    logsRevertProcess(
      processId: String!
      dryRun: Boolean
      force: Boolean
      skipConflicts: Boolean
      resolutions: [LogRevertDocResolutionInput!]
    ): LogRevertResult
`;

export default { types, queries, mutations };
