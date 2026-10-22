import { gql } from '~/gql';

export const GET_CONVERSATION_DETAIL = gql(`
  query ConversationDetail($_id: String!) {
    conversationDetail(_id: $_id) {
      _id
      createdAt
      tagIds
      content
      integrationId
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
      readUserIds
      customerId
      updatedAt
      status
      automatedReplyControl {
        status
        pausedUntil
        reason
        updatedAt
        updatedBy
      }
      callProAudio
      callProPotentialCustomerIds
      callProPhone
      propertiesData
      customer {
        _id
        firstName
        lastName
        primaryEmail
        emails
        primaryPhone
        avatar
      }
      integration {
        _id
        channelId
      }
    }
  }
`);
