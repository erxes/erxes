module.exports = {
  webhooks: {
    name: 'webhooks',
    description: 'Webhooks',
    actions: [
      {
        name: 'webhooksAll',
        description: 'All',
        use: ['showWebhooks', 'manageWebhooks']
      },
      {
        name: 'showWebhooks',
        description: 'Show webhooks'
      },
      {
        name: 'manageWebhooks',
        description: 'Manage webhooks'
      }
    ]
  }
};
