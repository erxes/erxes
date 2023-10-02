import {
  attachmentType,
  attachmentInput
} from '@erxes/api-utils/src/commonTypeDefs';

export const types = () => `

  ${attachmentType}
  ${attachmentInput}

  extend type User @key(fields: "_id") {
    _id: String! @external
  }

  extend type Branch @key(fields: "_id") {
    _id: String! @external
  }

  extend type Department @key(fields: "_id") {
    _id: String! @external
  }

  type SeenInfo {
    user: User
    lastSeenMessageId: String
    seenDate: Date
  }
  
  type ChatMessage {
    _id: String!
    content: String
    isPinned: Boolean
    relatedMessage: ChatMessage
    attachments: JSON
    mentionedUserIds: [String]
    createdUser: User
    createdAt: Date
    seenList: [SeenInfo]
  }

  type ChatUserDetails {
    avatar: String
    description: String
    fullName: String
    operatorPhone: String
    position: String
  }

  type ChatUser {
    _id: String!
    username: String
    email: String
    employeeId: String
    details: ChatUserDetails
    isAdmin: Boolean
    departments: [Department]
    branches: [Branch]
  }

  type ChatTypingStatusChangedResponse {
    chatId: String!
    userId: String
  }

  type Chat {
    _id: String!
    name: String
    type: String
    description: String
    visibility: String
    isSeen: Boolean
    lastMessage: ChatMessage
    participantUsers: [ChatUser]
    createdUser: User
    createdAt: Date
    isPinned: Boolean
    isPinnedUserIds: [String]
    isWithNotification: Boolean
    muteUserIds: [String]
    featuredImage: JSON
  }

  type ChatResponse {
    list: [Chat]
    totalCount: Int
  }

  type ChatMessageResponse {
    list: [ChatMessage]
    totalCount: Int
  }
  type UserStatus {
    _id: String!
    onlineDate: Date
    userId: String
  }
  enum ChatType {
    direct
    group
  }

  enum ChatMemberModifyType {
    add
    remove
  }

  enum ChatVisibilityType {
    public
    private
  }
`;

const paginationParams = `
  limit: Int
  skip: Int
`;

export const queries = `
  chats(type: ChatType, position: String, searchValue: String, ${paginationParams}): ChatResponse
  chatsPinned: ChatResponse
  chatDetail(_id: String!): Chat
  getUnreadChatCount: Int
  chatMessages(chatId: String, isPinned: Boolean, ${paginationParams}): ChatMessageResponse
  chatMessageDetail(_id : String) : ChatMessage
  getChatIdByUserIds(userIds: [String]): String
  isChatUserOnline(userIds:[String]): [UserStatus]
  activeMe(userId:String!):UserStatus
`;

export const mutations = `
  chatAdd(name: String, type: ChatType!, description: String, visibility: ChatVisibilityType, participantIds: [String], featuredImage: JSON): Chat
  chatEdit(_id: String!, name: String, description: String, visibility: ChatVisibilityType, featuredImage: JSON): Chat
  chatRemove(_id: String!): JSON
  chatAddOrRemoveMember(_id: String!, userIds: [String], type: ChatMemberModifyType): String
  chatMarkAsRead(_id : String!) : String
  chatToggleIsPinned(_id: String!): Boolean
  chatToggleIsWithNotification(_id: String!): Boolean
  
  chatMessageAdd(chatId: String!, relatedId: String, attachments: [JSON], content: String, mentionedUserIds: [String]): ChatMessage
  chatMessageRemove(_id: String!): JSON
  chatMakeOrRemoveAdmin(_id: String!, userId: String!): String
  chatMessageToggleIsPinned(_id: String!): Boolean
  chatForward(chatId: String, userIds:[String], content: String, attachments: [JSON]): ChatMessage

  chatTypingInfo(chatId: String!, userId : String!): String
`;
