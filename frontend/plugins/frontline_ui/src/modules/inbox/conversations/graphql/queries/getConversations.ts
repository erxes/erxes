import { gql } from '@apollo/client';
import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_CURSOR_PARAMS,
  GQL_PAGE_INFO,
} from 'erxes-ui';

export const GET_CONVERSATIONS = gql`
  query Conversations(
    $channelId: String
    $status: String
    $unassigned: String
    $tag: String
    $integrationType: String
    $starred: String
    $startDate: String
    $endDate: String
    $segment: String
    $awaitingResponse: String
    $participating: String
    ${GQL_CURSOR_PARAM_DEFS}
  ) {
    conversations(
      channelId: $channelId
      status: $status
      unassigned: $unassigned
      tag: $tag
      integrationType: $integrationType
      starred: $starred
      startDate: $startDate
      endDate: $endDate
      segment: $segment
      awaitingResponse: $awaitingResponse
      participating: $participating
      ${GQL_CURSOR_PARAMS}
    ) {
      list {
        _id
        content
        createdAt
        updatedAt
        integrationId
        customer {
          _id
          firstName
          middleName
          lastName
          primaryEmail
          avatar
          primaryPhone
        }
        readUserIds
        tagIds
      }
      ${GQL_PAGE_INFO}
    }
  }
`;
