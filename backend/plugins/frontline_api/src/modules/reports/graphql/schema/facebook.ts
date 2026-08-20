export const types = `
  input FacebookReportFilter {
    date: String
    fromDate: String
    toDate: String
    pageIds: [String]
    searchValue: String
    limit: Int
    page: Int
  }

  type ReportFacebookPage {
    _id: String
    name: String
  }

  type ReportFacebookSummary {
    posts: Int
    comments: Int
    conversations: Int
    messages: Int
    incomingMessages: Int
    botMessages: Int
    staffMessages: Int
    botConversations: Int
    botCoverage: Int
  }

  type ReportFacebookActivityPoint {
    date: String
    conversations: Int
    messages: Int
    comments: Int
  }

  type ReportFacebookPost {
    _id: String
    content: String
    permalink: String
    comments: Int
    replies: Int
    commenters: Int
    postedAt: Date
    lastActivityAt: Date
    metaCommentCount: Int
    metaReactionCount: Int
    metaShareCount: Int
    metaSyncedAt: Date
  }

  type ReportFacebookPostResult {
    list: [ReportFacebookPost]
    totalCount: Int
    page: Int
    totalPages: Int
  }

  type ReportFacebookSyncError {
    pageId: String
    message: String
  }

  type ReportFacebookSyncResult {
    pages: Int
    fetched: Int
    updated: Int
    missingInErxes: Int
    syncedAt: Date
    errors: [ReportFacebookSyncError]
  }

  type ReportFacebookBot {
    _id: String
    name: String
    pageId: String
    count: Int
    messages: Int
    percentage: Int
  }
`;

export const queries = `
  reportFacebookPages: [ReportFacebookPage]
  reportFacebookSummary(filters: FacebookReportFilter): ReportFacebookSummary
  reportFacebookActivity(filters: FacebookReportFilter): [ReportFacebookActivityPoint]
  reportFacebookPosts(filters: FacebookReportFilter): ReportFacebookPostResult
  reportFacebookBots(filters: FacebookReportFilter): [ReportFacebookBot]
`;

export const mutations = `
  reportFacebookSyncPostStats(pageIds: [String], limit: Int): ReportFacebookSyncResult
`;
