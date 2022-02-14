export const types = `
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
    createdUser: User
    createdAt: Date
    seenList: [SeenInfo]
  }

  type ChatUser {
    _id: String!
    createdAt: Date
    username: String
    email: String
    isActive: Boolean
    details: UserDetailsType
    links: JSON
    status: String
    emailSignatures: JSON
    getNotificationByEmail: Boolean
    groupIds: [String]
    brandIds: [String]
    isSubscribed: String
    isShowNotification: Boolean
    customFieldsData: JSON

    brands: [Brand]
    isOwner: Boolean
    permissionActions: JSON
    configs: JSON
    configsConstants: [JSON]
    onboardingHistory: OnboardingHistory
    department: Department
    score: Float
    isAdmin: Boolean
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
  }

  type ChatResponse {
    list: [Chat]
    totalCount: Int
  }

  type ChatMessageResponse {
    list: [ChatMessage]
    totalCount: Int
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
  chats(type: ChatType, ${paginationParams}): ChatResponse
  chatDetail(_id: String!): Chat
  
  chatMessages(chatId: String, isPinned: Boolean, ${paginationParams}): ChatMessageResponse

  getChatIdByUserIds(userIds: [String]): String
`;

export const mutations = `
  chatAdd(name: String, type: ChatType!, , description: String, visibility: ChatVisibilityType, participantIds: [String]): Chat
  chatEdit(_id: String!, name: String, description: String, visibility: ChatVisibilityType): Chat
  chatRemove(_id: String!): JSON
  chatAddOrRemoveMember(_id: String!, userIds: [String], type: ChatMemberModifyType): String
  
  chatMessageAdd(chatId: String!, relatedId: String, attachments: [JSON], content: String): ChatMessage
  chatMessageRemove(_id: String!): JSON
  chatMakeOrRemoveAdmin(_id: String!, userId: String!): String
  chatMessageToggleIsPinned(_id: String!): Boolean
`;

export const subscriptions = `
  chatMessageInserted(chatId: String!): ChatMessage
`;
