import { gql } from '@apollo/client';
import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_CURSOR_PARAMS,
  GQL_PAGE_INFO,
} from 'erxes-ui';

export const BROADCAST_MESSAGES = gql`
  query BroadcastMessages($kind: String, $status: String, ${GQL_CURSOR_PARAM_DEFS}) {
    engageMessages(kind: $kind, status: $status, ${GQL_CURSOR_PARAMS}) {
      list {
        _id
        title
        kind
        isDraft
        isLive
        createdAt
        method
        tagIds
        customerTagIds
        brandIds
        segmentIds
        messenger
        notification
        email
        brandId
        totalCustomersCount
        validCustomersCount
        runCount
        fromUserId
        shortMessage {
          from
          content
          fromIntegrationId
        }
        scheduleDate {
          type
          dateTime
        }
        brands {
          _id
          name
        }
        segments {
          _id
          name
        }
        getTags {
          _id
          name
          colorCode
        }
        customerTags {
          _id
          name
          colorCode
        }
        cpId
      }
      ${GQL_PAGE_INFO}
    }
  }
`;

export const GET_BROADCAST_MEMBERS = gql`
  query BroadcastMembers($isVerified: Boolean, ${GQL_CURSOR_PARAM_DEFS}) {
    engageMembers(isVerified: $isVerified, ${GQL_CURSOR_PARAMS}) {
      list {
        _id
        email
        details {
          avatar
          fullName
        }
      }
      ${GQL_PAGE_INFO}
    }
  }
`;
