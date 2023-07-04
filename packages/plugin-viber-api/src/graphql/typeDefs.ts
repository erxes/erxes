import { gql } from 'apollo-server-express';
import { attachmentType } from '@erxes/api-utils/src/commonTypeDefs';
import { DocumentNode } from 'graphql';

const types: string = `
  ${attachmentType}

  input CreateInput {
    _id: String
    createdUserId: String
    createdDate: Date
    name: String
    key: String
  }

  type SentMessage {
    _id: String
    userId: String
    senderId: String
    sendDate: Date
    messageText: String
  }

  type ViberMessageDetail {
    _id: String
    userId: String
    customerId: String
    content: String
    createdAt: Date
    mailData: JSON
  }

  extend type Customer @key(fields: "_id") {
    _id: String! @external
  }

  extend type User @key(fields: "_id") {
    _id: String! @external
  }

  type ViberMessageResponse {
    _id: String!
    content: String
    conversationId: String
    attachments: [Attachment]
    fromBot: Boolean
    botData: JSON
    customerId: String
    userId: String
    createdAt: Date
    isCustomerRead: Boolean
    mid: String
    internal: Boolean
    customer: Customer
    user: User
  }

  type ViberIntegrationDetailResponse {
    _id: String
    inboxId: String
    token: String
  }

  input UpdateInput {
    _id: String
    inboxId: String
    token: String
  }
`;

const queries: string = `
  viberReadSentMessage: [SentMessage]
  viberConversationDetail(conversationId: String!): [ViberMessageDetail]
  viberConversationMessages(conversationId: String! getFirst: Boolean, skip: Int, limit: Int): [ViberMessageResponse]
  viberConversationMessagesCount(conversationId: String!): Int
  viberIntegrationDetail(integrationId: String!): ViberIntegrationDetailResponse
`;

const mutations: string = `
  viberCreate(create: CreateInput): JSON
  viberIntegrationUpdate(update: UpdateInput): JSON
`;

const typeDefs: DocumentNode = gql`
  scalar JSON
  scalar Date

  ${types}

  extend type Query {
    ${queries}
  }

  extend type Mutation {
    ${mutations}
  }
`;

export default typeDefs;
