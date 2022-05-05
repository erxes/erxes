module.exports = {
  chats: {
    name: 'chats',
    description: 'Chats',
    actions: [
      {
        name: 'chatsAll',
        description: 'All',
        use: ['showChats', 'manageChats'],
      },
      {
        name: 'showChats',
        description: 'Show chats',
      },
      {
        name: 'manageChats',
        description: 'Manage Chats',
      },
    ],
  },
};
