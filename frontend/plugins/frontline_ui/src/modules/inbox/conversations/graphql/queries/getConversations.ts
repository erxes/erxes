import { gql } from '~/gql';

export const GET_CONVERSATIONS = gql(`
  query Conversations($channelId: String, $integrationId: String, $status: String, $unassigned: String, $tag: String, $integrationType: String, $starred: String, $startDate: String, $endDate: String, $segment: String, $awaitingResponse: String, $withSurvey: String, $automationStatus: String, $participating: String, $mentioned: String, $unread: String, $customerId: String, $brandId: String, $searchValue: String, $cursor: String, $cursorMode: CURSOR_MODE, $direction: CURSOR_DIRECTION, $limit: Int) {
    conversations(
      channelId: $channelId
      integrationId: $integrationId
      status: $status
      unassigned: $unassigned
      tag: $tag
      integrationType: $integrationType
      starred: $starred
      startDate: $startDate
      endDate: $endDate
      segment: $segment
      awaitingResponse: $awaitingResponse
      withSurvey: $withSurvey
      automationStatus: $automationStatus
      participating: $participating
      mentioned: $mentioned
      unread: $unread
      customerId: $customerId
      brandId: $brandId
      searchValue: $searchValue
      cursor: $cursor
      cursorMode: $cursorMode
      direction: $direction
      limit: $limit
    ) {
      list {
        _id
        content
        lastMessage {
          _id
          content
          createdAt
          contentType
          messageKind
          providerData {
            messageId
            attachmentType
            fallbackReason
            previewText
            previewUrl
            shareType
            storyUrl
          }
          extraData
          attachments {
            name
            type
            url
          }
        }
        createdAt
        updatedAt
        status
        integrationId
        customer {
          _id
          firstName
          middleName
          lastName
          primaryEmail
          avatar
          primaryPhone
          __typename
        }
        readUserIds
        tagIds
        __typename
        assignedUserId
        assignedUserIds
        assignedUsers {
          _id
          email
          username
          isActive
          isOnboarded
          details {
            firstName
            lastName
            fullName
            avatar
          }
        }
        assignedUser {
          _id
          email
          username
          isActive
          isOnboarded
          details {
            firstName
            lastName
            fullName
            avatar
          }
        }
        integration {
          _id
          channelId
          kind
          name
          channel {
            updatedAt
            name
            memberCount
            icon
            description
            createdAt
            _id
          }
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
`);
