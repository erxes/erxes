import { gql } from '@apollo/client';
import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_CURSOR_PARAMS,
  GQL_PAGE_INFO,
} from 'erxes-ui';

export const BROADCAST_MESSAGES = gql`
  query BroadcastMessages(
    $kind: String,
    $status: String,
    $method: String,
    $brandId: String,
    $fromUserId: String,
    $searchValue: String,
    ${GQL_CURSOR_PARAM_DEFS}
  ) {
    engageMessages(
      kind: $kind,
      status: $status,
      method: $method,
      brandId: $brandId,
      fromUserId: $fromUserId,
      searchValue: $searchValue,
      ${GQL_CURSOR_PARAMS}
    ) {
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

export const BROADCAST_MESSAGE = gql`
  query BroadcastMessage($_id: String) {
    engageMessageDetail(_id: $_id) {
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
      lastRunAt
      fromUserId
      stats
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
  }
`;

export const BROADCAST_MEMBERS = gql`
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

export const BROADCAST_CUSTOMERS_COUNT = gql`
  query BroadcastCustomersCount($types: [CUSTOMER_RELATION_TYPE]) {
    customersCount(types: $types)
  }
`;

export const BROADCAST_STATISTIC = gql`
  query BroadcastStatistic {
    engageEmailPercentages {
      avgBouncePercent
      avgClickPercent
      avgComplaintPercent
      avgDeliveryPercent
      avgOpenPercent
      avgRejectPercent
      avgRenderingFailurePercent
      avgSendPercent
      __typename
    }
  }
`;
