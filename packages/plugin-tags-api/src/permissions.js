module.exports = {
  tags: {
    name: 'tags',
    description: 'Tags',
    actions: [
      {
        name: 'tagsAll',
        description: 'All',
        use: ['showTags', 'manageTags']
      },
      {
        name: 'manageTags',
        description: 'Manage tags'
      },
      {
        name: 'showTags',
        description: 'Show tags'
      }
    ]
  }
};
