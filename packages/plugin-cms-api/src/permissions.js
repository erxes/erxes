module.exports = {
  topics: {
    name: 'topics',
    description: 'CMS Topics',
    actions: [
      {
        name: 'cmsTopicsAll',
        description: 'All CMS Topic actions',
        use: ['cmsTopicCreate', 'cmsTopicUpdate', 'cmsTopicDelete'],
      },
      {
        name: 'cmsTopicCreate',
        description: 'Create a CMS Topic',
      },
      {
        name: 'cmsTopicUpdate',
        description: 'Update a CMS Topic',
      },
      {
        name: 'cmsTopicDelete',
        description: 'Delete a CMS Topic',
      },
    ],
  },
};
