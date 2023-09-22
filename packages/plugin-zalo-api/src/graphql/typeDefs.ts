import gql from 'graphql-tag';

const zlac = `{
  _id: String
    name: String
    avatar: String
    oa_id: String
}`;

const types = `
  type Zalo {
    _id: String!
    title: String
    mailData: JSON
  }

  extend type Customer @key(fields: "_id") {
    _id: String! @external
  }

  extend type User @key(fields: "_id") {
    _id: String! @external
  }

  type ZaloAccount {
    _id: String
    username: String
    details: JSON
    
  }

  type ZaloAttachmentPayload {
    id: String
    thumbnail: String
    url: String
    title: String
    description: String
    coordinates: JSON
  }

  type ZaloAttachments {
    id: String
    thumbnail: String
    type: String
    url: String
    name: String
    description: String
    duration: String
    coordinates: JSON
  }

  type ZaloConversationMessage {
    _id: String!
    content: String
    conversationId: String
    fromBot: Boolean
    botData: JSON
    customerId: String
    userId: String
    createdAt: Date
    isCustomerRead: Boolean
    mid: String
    attachments: [ZaloAttachments]
    
    user: User
    customer: Customer
  }
`;

const queries = `
  zaloGetConfigs: JSON
  zaloAccounts: JSON
  zaloGetAccounts: JSON
  zaloConversationMessages(conversationId: String! skip: Int limit: Int getFirst: Boolean): [ZaloConversationMessage]
  zaloConversationMessagesCount(conversationId: String!): Int
  zaloConversationDetail(conversationId: String!): [Zalo]
`;

const mutations = `
  zaloUpdateConfigs(configsMap: JSON!): JSON
  zaloRemoveAccount(_id: String!): String
`;

const typeDefs = async _serviceDiscovery => {
  return gql`
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
};

export default typeDefs;
