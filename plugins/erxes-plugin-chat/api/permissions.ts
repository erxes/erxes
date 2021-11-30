export default [
  { name: 'showChats', description: 'Show chats' },
  { name: 'manageChats', description: 'Manage chats' },
  {
    name: 'chatAll',
    description: 'All',
    use: ['showChats', 'manageChats']
  }
];
