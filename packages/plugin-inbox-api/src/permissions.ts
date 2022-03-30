
const permissions = {
  inbox: {
    name: 'inbox',
    description: 'Inbox',
    actions: [
      {
        name: 'inboxAll',
        description: 'All',
        use: [
          'showConversations',
          'changeConversationStatus',
          'assignConversation',
          'conversationMessageAdd',
          'conversationResolveAll'
        ]
      },
      {
        name: 'showConversations',
        description: 'Show conversations'
      },
      {
        name: 'changeConversationStatus',
        description: 'Change conversation status'
      },
      {
        name: 'assignConversation',
        description: 'Assign conversation'
      },
      {
        name: 'conversationMessageAdd',
        description: 'Add conversation message'
      },
      {
        name: 'conversationResolveAll',
        description: 'Resolve all converstaion'
      }
    ]
  },
}

export default permissions;