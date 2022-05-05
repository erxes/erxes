module.exports = {
  automations: {
    name: 'automations',
    description: 'Automations',
    actions: [
      {
        name: 'automationAll',
        description: 'All',
        use: [
          'showAutomations',
          'automationsAdd',
          'automationsEdit',
          'automationsRemove'
        ]
      },
      {
        name: 'showAutomations',
        description: 'Show automations'
      },
      {
        name: 'automationsAdd',
        description: 'Add automations'
      },
      {
        name: 'automationsEdit',
        description: 'Edit automations'
      },
      {
        name: 'automationsRemove',
        description: 'Remove automations'
      }
    ]
  }
};
