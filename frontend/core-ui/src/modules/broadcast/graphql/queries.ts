import { gql } from '@apollo/client';
import {
  GQL_CURSOR_PARAM_DEFS,
  GQL_CURSOR_PARAMS,
  GQL_PAGE_INFO,
} from 'erxes-ui';

export const BROADCAST_MESSAGES = gql`
  query BroadcastMessages(
    $kind: String,
    $trigger: String,
    $status: String,
    $method: String,
    $brandId: String,
    $fromUserId: String,
    $searchValue: String,
    ${GQL_CURSOR_PARAM_DEFS}
  ) {
    engageMessages(
      kind: $kind,
      trigger: $trigger,
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
        targetCount
        totalCustomersCount
        validCustomersCount
        runCount
        nextRunAt
        approvalLockState {
          locked
          hasAccess
          reason
          lock {
            _id
            lockedBy
          }
          pendingRequest {
            _id
            status
          }
        }
        fromUserId
        fromEmail
        status
        progress
        shortMessage {
          from
          content
          fromIntegrationId
        }
        scheduleDate {
          type
          dateTime
          every
          hour
          minute
          weekDay
          monthDay
          monthOfYear
          startDate
          endDate
          timeZone
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
      status
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
      targetType
      targetIds
      targetCount
      totalCustomersCount
      validCustomersCount
      runCount
      lastRunAt
      nextRunAt
      approvalLockState {
        locked
        hasAccess
        reason
        lock {
          _id
          lockedBy
        }
        pendingRequest {
          _id
          status
        }
      }
      fromUserId
      fromEmail
      workflowAutomationId
      stats
      shortMessage {
        from
        content
        fromIntegrationId
      }
      scheduleDate {
        type
        dateTime
        every
        hour
        minute
        weekDay
        monthDay
        monthOfYear
        startDate
        endDate
        timeZone
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

export const BROADCAST_TRACES = gql`
  query BroadcastTraces($engageMessageId: String!) {
    engageBroadcastTraces(engageMessageId: $engageMessageId) {
      _id
      type
      message
      createdAt
    }
  }
`;

export const BROADCAST_RUNS = gql`
  query BroadcastRuns($engageMessageId: String!) {
    engageBroadcastRuns(engageMessageId: $engageMessageId) {
      _id
      runCount
      status
      totalCount
      startedAt
      finishedAt
      counts
    }
  }
`;

export const BROADCAST_RECIPIENTS = gql`
  query BroadcastRecipients(
    $runId: String!
    $status: String
    $searchValue: String
    $beginDate: Date
    $endDate: Date
    $cursor: String
    $limit: Int
    $direction: CURSOR_DIRECTION
  ) {
    engageBroadcastRecipients(
      runId: $runId
      status: $status
      searchValue: $searchValue
      beginDate: $beginDate
      endDate: $endDate
      cursor: $cursor
      limit: $limit
      direction: $direction
    ) {
      list {
        _id
        status
        reason
        attempts
        finishedAt
        createdAt
        updatedAt
        customerId
        customer {
          _id
          firstName
          lastName
          primaryEmail
          primaryPhone
        }
        execution {
          _id
          status
          failedActionType
        }
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const BROADCAST_VERIFIED_EMAILS = gql`
  query BroadcastVerifiedEmails {
    engageVerifiedEmails
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

export const BROADCAST_CALENDAR = gql`
  query BroadcastCalendar(
    $from: Date!
    $to: Date!
    $kind: String
    $trigger: String
    $status: String
    $method: String
    $brandId: String
    $fromUserId: String
    $searchValue: String
  ) {
    engageScheduleCalendar(
      from: $from
      to: $to
      kind: $kind
      trigger: $trigger
      status: $status
      method: $method
      brandId: $brandId
      fromUserId: $fromUserId
      searchValue: $searchValue
    ) {
      engageMessageId
      title
      method
      at
      state
      runId
      runCount
      totalCount
    }
  }
`;

export const BROADCAST_SCHEDULE_PREVIEW = gql`
  query BroadcastSchedulePreview($recurrence: EngageRecurrenceInput!) {
    engageSchedulePreview(recurrence: $recurrence)
  }
`;
