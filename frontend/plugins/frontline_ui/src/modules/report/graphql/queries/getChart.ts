import { gql } from '@apollo/client';

export const GET_CONVERSATION_OPEN = gql`
  query ReportConversationOpen($filters: ConversationReportFilter) {
    reportConversationOpen(filters: $filters) {
      count
      percentage
    }
  }
`;

export const GET_CONVERSATION_CLOSE = gql`
  query ReportConversationClosed($filters: ConversationReportFilter) {
    reportConversationClosed(filters: $filters) {
      count
      percentage
    }
  }
`;

export const GET_CONVERSATION_RESOLVED = gql`
  query ReportConversationResolved($filters: ConversationReportFilter) {
    reportConversationResolved(filters: $filters) {
      count
      percentage
    }
  }
`;

export const GET_CONVERSATION_TAG = gql`
  query ReportConversationTags($filters: ConversationReportFilter) {
    reportConversationTags(filters: $filters) {
      _id
      name
      count
      percentage
    }
  }
`;

export const GET_CONVERSATION_SOURCE = gql`
  query ReportConversationSources($filters: ConversationReportFilter) {
    reportConversationSources(filters: $filters) {
      _id
      name
      count
      percentage
    }
  }
`;

export const GET_CONVERSATION_RESPONSES = gql`
  query ReportConversationResponses($filters: ConversationReportFilter) {
    reportConversationResponses(filters: $filters) {
      user {
        _id
        username
        details {
          avatar
          fullName
          position
        }
      }
      messageCount
    }
  }
`;

export const GET_CONVERSATION_LIST = gql`
  query ReportConversationList($filters: ConversationReportFilter) {
    reportConversationList(filters: $filters) {
      list {
        _id
        content
        messages {
          _id
          content
          userId
          customerId
        }
        createdAt
        customerId
        userId
        assignedUserId
        status
        readUsers {
          _id
          details {
            avatar
            fullName
            position
          }
        }
      }
      page
      totalCount
      totalPages
    }
  }
`;

export const GET_OPEN_CONVERSATIONS_BY_DATE = gql`
  query ReportConversationOpenDate($filters: ConversationReportFilter) {
    reportConversationOpenDate(filters: $filters) {
      count
      date
    }
  }
`;

export const GET_RESOLVED_CONVERSATIONS_BY_DATE = gql`
  query ReportConversationResolvedDate($filters: ConversationReportFilter) {
    reportConversationResolvedDate(filters: $filters) {
      count
      date
    }
  }
`;
