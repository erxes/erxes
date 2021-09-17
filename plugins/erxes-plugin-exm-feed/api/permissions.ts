export default [
  { name: 'showExm', description: 'Show activity feed' },
  { name: 'manageExm', description: 'Manage activity feed' },
  {
    name: 'all',
    description: 'All',
    use: ['showExm', 'manageExm']
  }
];
