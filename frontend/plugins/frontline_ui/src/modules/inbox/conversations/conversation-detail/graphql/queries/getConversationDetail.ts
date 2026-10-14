import { gql } from '@apollo/client';

export const GET_CONVERSATION_DETAIL = gql`
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
        username
        email
        isActive
        details {
          avatar
          fullName
        }
      }
      readUserIds
      customerId
      updatedAt
      status
      automatedReplyControl
      callProAudio
      callProPotentialCustomerIds
      callProPhone
      propertiesData
      customer {
        _id
        firstName
        lastName
        primaryEmail
        primaryPhone
        avatar
      }
      integration {
        _id
        channelId
      }
    }
  }
`;
