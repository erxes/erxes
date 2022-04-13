export default {
  chats: {
    name: 'pos',
    description: 'Pos',
    actions: [
      {
        name: 'posAll',
        description: 'All',
        use: ['showPos', 'Show POS'],
      },
      {
        name: 'showPos',
        description: 'Show POS',
      },
      {
        name: 'managePos',
        description: 'Manage POS',
      },
    ],
  },
};
