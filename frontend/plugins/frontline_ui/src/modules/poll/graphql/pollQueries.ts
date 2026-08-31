import { gql } from '@apollo/client';

const POLL_FIELDS = gql`
  fragment PollFields on Poll {
    _id
    code
    title
    question
    channelId
    options {
      _id
      text
      order
    }
    allowMultiselect
    durationHours
    status
    sentCount
    createdAt
    createdUserId
    createdUser {
      _id
      details {
        fullName
        avatar
      }
    }
  }
`;

export const GET_POLL_LIST = gql`
  query pollList(
    $searchValue: String
    $status: String
    $channelId: String
    $limit: Int
    $cursor: String
    $direction: CURSOR_DIRECTION
    $orderBy: JSON
  ) {
    pollList(
      searchValue: $searchValue
      status: $status
      channelId: $channelId
      limit: $limit
      cursor: $cursor
      direction: $direction
      orderBy: $orderBy
    ) {
      list {
        ...PollFields
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
  ${POLL_FIELDS}
`;

export const GET_POLL_RESULTS_LIST = gql`
  query pollResultsList(
    $searchValue: String
    $status: String
    $channelId: String
    $limit: Int
    $cursor: String
    $direction: CURSOR_DIRECTION
    $orderBy: JSON
  ) {
    pollList(
      searchValue: $searchValue
      status: $status
      channelId: $channelId
      limit: $limit
      cursor: $cursor
      direction: $direction
      orderBy: $orderBy
    ) {
      list {
        ...PollFields
        results {
          totalVotes
          voterCount
          options {
            _id
            text
            count
            percent
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
  ${POLL_FIELDS}
`;

export const GET_POLL_DETAIL = gql`
  query pollDetail($_id: String!) {
    pollDetail(_id: $_id) {
      ...PollFields
      results {
        totalVotes
        voterCount
        options {
          _id
          text
          count
          percent
        }
      }
    }
  }
  ${POLL_FIELDS}
`;

export const GET_CHANNEL_POLL_CONVERSATION_COUNT = gql`
  query frontlineChannelPollConversationCount(
    $channelId: String
    $status: String
  ) {
    conversationsTotalCount(
      channelId: $channelId
      status: $status
      withPoll: "true"
    )
  }
`;

export const GET_POLL_TOTAL_COUNT = gql`
  query pollTotalCount(
    $searchValue: String
    $status: String
    $channelId: String
  ) {
    pollTotalCount(
      searchValue: $searchValue
      status: $status
      channelId: $channelId
    ) {
      total
      byStatus
    }
  }
`;
