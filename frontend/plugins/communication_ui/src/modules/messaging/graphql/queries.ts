import { gql } from '~/gql';

export const MESSAGING_ADMIN_APPS = gql(`
  query communicationMessagingAdminAppList {
    communicationMessagingAdminApps {
      key
      tenant
      appId
      attachments
    }
  }
`);

export const MESSAGING_ADMIN_CONVERSATIONS = gql(`
  query communicationMessagingAdminConversationList(
    $appKey: String
    $kind: CommunicationMessagingKind
    $search: String
    $first: Int
    $after: String
  ) {
    communicationMessagingAdminConversations(
      appKey: $appKey
      kind: $kind
      search: $search
      first: $first
      after: $after
    ) {
      items {
        id
        appKey
        appId
        kind
        title
        lastActivityAt
        messageCount
        memberCount
        participants {
          id
          displayName
        }
      }
      nextCursor
    }
  }
`);

export const MESSAGING_ADMIN_CONVERSATION = gql(`
  query communicationMessagingAdminConversationDetail(
    $appKey: String!
    $id: ID!
  ) {
    communicationMessagingAdminConversation(appKey: $appKey, id: $id) {
      id
      appKey
      appId
      kind
      title
      lastActivityAt
      messageCount
      memberCount
    }
  }
`);

export const MESSAGING_ADMIN_MESSAGES = gql(`
  query communicationMessagingAdminMessageList(
    $appKey: String!
    $conversationId: ID!
    $first: Int
    $before: Int
  ) {
    communicationMessagingAdminMessages(
      appKey: $appKey
      conversationId: $conversationId
      first: $first
      before: $before
    ) {
      items {
        id
        sequence
        text
        createdAt
        sender {
          id
          displayName
          subject
          active
        }
        mentions {
          id
          displayName
        }
        attachments {
          id
          name
          mimeType
          size
          downloadPath
        }
      }
      nextCursor
    }
  }
`);

export const MESSAGING_ADMIN_PARTICIPANTS = gql(`
  query communicationMessagingAdminParticipantList(
    $appKey: String!
    $conversationId: ID!
  ) {
    communicationMessagingAdminParticipants(
      appKey: $appKey
      conversationId: $conversationId
    ) {
      member {
        id
        displayName
        subject
        active
      }
      role
      active
      joinedSequence
      lastReadSequence
      unreadCount
    }
  }
`);
