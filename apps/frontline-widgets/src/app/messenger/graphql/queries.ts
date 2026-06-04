import { gql } from '@apollo/client';

const userDetailFields = `
  avatar
  fullName
`;

const userFields = `
  _id
  isActive
  details {
    ${userDetailFields}
    description
    location
    position
    shortName
  }
  isOnline
`;

const GET_CONVERSATION_DETAIL = gql`
  query ($_id: String, $integrationId: String!) {
    widgetsConversationDetail(_id: $_id, integrationId: $integrationId) {
      _id
      messages {
        _id
        conversationId
        customerId
        attachments {
          name
          url
        }
        user {
          _id
          details {
            avatar
            fullName
          }
        }
        content
        createdAt
        fromBot
        contentType
        internal
      }
      operatorStatus
      isOnline
      supporters {
        _id
        details {
          avatar
          fullName
        }
      }
      participatedUsers {
        _id
        details {
          avatar
          fullName
          shortName
        }
        links
      }
    }
  }
`;

const messengerSupportersQuery = gql`
  query widgetsMessengerSupporters($integrationId: String!) {
    widgetsMessengerSupporters(integrationId: $integrationId) {
      supporters {
        ${userFields}
      }
      isOnline
    }
  }
`;

const GET_WIDGETS_CONVERSATIONS = gql`
  query widgetsConversations($integrationId: String!, $customerId: String, $visitorId: String) {
    widgetsConversations(integrationId: $integrationId, customerId: $customerId, visitorId: $visitorId) {
      _id
      content
      createdAt
      idleTime
      participatedUsers {
        _id
        details {
          ${userDetailFields}
          description
          location
          position
          shortName
        }
      }
      messages {
        _id
        createdAt
        content
        fromBot
        customerId
        isCustomerRead
        userId
        user {
          _id
          isOnline
          details {
            avatar
            fullName
            firstName
            shortName
          }
        }
      }
    }
  }
`;

const GET_KNOWLEDGE_BASE_TOPIC_DETAILS = gql`
  query knowledgeBaseTopicDetail($_id: String!) {
    knowledgeBaseTopicDetail(_id: $_id) {
      _id
      title
      description
      color
      code
      categories {
        _id
        title
        description
        numOfArticles(status: "publish")
        countArticles
        parentCategoryId
        icon
        articles(status: "publish") {
          viewCount
          topicId
          title
          summary
          status
          reactionCounts
          reactionChoices
          publishedAt
          modifiedDate
          isPrivate
          image {
            url
            name
            type
            size
            duration
          }
          content
          code
          categoryId
          attachments {
            url
            name
            type
            size
            duration
          }
          _id
        }
      }
      parentCategories {
        _id
        title
        description
        numOfArticles(status: "publish")
        parentCategoryId
        icon
        childrens {
          _id
        }
        articles {
          viewCount
          topicId
          title
          summary
          status
          reactionCounts
          reactionChoices
          publishedAt
          modifiedDate
          isPrivate
          image {
            url
            name
            type
            size
            duration
          }
          content
          code
          categoryId
          attachments {
            url
            name
            type
            size
            duration
          }
          _id
        }
      }
    }
  }
`;

export {
  GET_CONVERSATION_DETAIL,
  GET_WIDGETS_CONVERSATIONS,
  messengerSupportersQuery,
  GET_KNOWLEDGE_BASE_TOPIC_DETAILS,
};
