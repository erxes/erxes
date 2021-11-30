export default [
  { name: 'showExms', description: 'Show exm' },
  { name: 'manageExms', description: 'Manage exm' },
  {
    name: 'exmsAll',
    description: 'All',
    use: ['showExms', 'manageExms']
  }
];
