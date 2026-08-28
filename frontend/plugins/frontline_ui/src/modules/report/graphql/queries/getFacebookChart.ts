import { gql } from '@apollo/client';

export const GET_FACEBOOK_PAGES = gql`
  query ReportFacebookPages {
    reportFacebookPages {
      _id
      name
    }
  }
`;

export const GET_FACEBOOK_SUMMARY = gql`
  query ReportFacebookSummary($filters: FacebookReportFilter) {
    reportFacebookSummary(filters: $filters) {
      posts
      comments
      conversations
      messages
      incomingMessages
      botMessages
      staffMessages
      botConversations
      botCoverage
      sentMessages
      deliveredMessages
      readMessages
      deliveryRate
      readRate
    }
  }
`;

export const GET_FACEBOOK_ACTIVITY = gql`
  query ReportFacebookActivity($filters: FacebookReportFilter) {
    reportFacebookActivity(filters: $filters) {
      date
      conversations
      messages
      comments
    }
  }
`;

export const GET_FACEBOOK_POSTS = gql`
  query ReportFacebookPosts($filters: FacebookReportFilter) {
    reportFacebookPosts(filters: $filters) {
      list {
        _id
        content
        permalink
        comments
        replies
        commenters
        postedAt
        lastActivityAt
        metaCommentCount
        metaReactionCount
        metaShareCount
        metaSyncedAt
      }
      totalCount
      page
      totalPages
    }
  }
`;

export const GET_FACEBOOK_BOTS = gql`
  query ReportFacebookBots($filters: FacebookReportFilter) {
    reportFacebookBots(filters: $filters) {
      _id
      name
      pageId
      count
      messages
      percentage
    }
  }
`;
