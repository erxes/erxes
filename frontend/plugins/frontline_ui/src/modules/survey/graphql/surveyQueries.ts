import { gql } from '@apollo/client';

const SURVEY_FIELDS = gql`
  fragment SurveyFields on Survey {
    _id
    code
    title
    question
    channelId
    brandId
    options {
      _id
      text
      order
      ticketCreationEnabled
      ticketCreationThreshold
      ticketPipelineId
      ticketStatusId
      ticketCreated
      ticketId
    }
    steps {
      _id
      name
      description
      order
      question
      allowMultiselect
      options {
        _id
        text
        order
        ticketCreationEnabled
        ticketCreationThreshold
        ticketPipelineId
        ticketStatusId
        ticketCreated
        ticketId
      }
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

export const GET_SURVEY_LIST = gql`
  query surveyList(
    $searchValue: String
    $status: String
    $channelId: String
    $limit: Int
    $cursor: String
    $direction: CURSOR_DIRECTION
    $orderBy: JSON
  ) {
    surveyList(
      searchValue: $searchValue
      status: $status
      channelId: $channelId
      limit: $limit
      cursor: $cursor
      direction: $direction
      orderBy: $orderBy
    ) {
      list {
        ...SurveyFields
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
  ${SURVEY_FIELDS}
`;

export const GET_SURVEY_RESULTS_LIST = gql`
  query surveyResultsList(
    $searchValue: String
    $status: String
    $channelId: String
    $limit: Int
    $cursor: String
    $direction: CURSOR_DIRECTION
    $orderBy: JSON
  ) {
    surveyList(
      searchValue: $searchValue
      status: $status
      channelId: $channelId
      limit: $limit
      cursor: $cursor
      direction: $direction
      orderBy: $orderBy
    ) {
      list {
        ...SurveyFields
        results {
          totalVotes
          voterCount
          steps {
            _id
            name
            question
            totalVotes
            options {
              _id
              text
              count
              percent
            }
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
  ${SURVEY_FIELDS}
`;

export const GET_SURVEY_DETAIL = gql`
  query surveyDetail($_id: String!) {
    surveyDetail(_id: $_id) {
      ...SurveyFields
      results {
        totalVotes
        voterCount
        steps {
          _id
          name
          question
          totalVotes
          options {
            _id
            text
            count
            percent
          }
        }
      }
    }
  }
  ${SURVEY_FIELDS}
`;

export const GET_CHANNEL_SURVEY_CONVERSATION_COUNT = gql`
  query frontlineChannelSurveyConversationCount(
    $channelId: String
    $status: String
  ) {
    conversationsTotalCount(
      channelId: $channelId
      status: $status
      withSurvey: "true"
    )
  }
`;

export const GET_SURVEY_TOTAL_COUNT = gql`
  query surveyTotalCount(
    $searchValue: String
    $status: String
    $channelId: String
  ) {
    surveyTotalCount(
      searchValue: $searchValue
      status: $status
      channelId: $channelId
    ) {
      total
      byStatus
    }
  }
`;
