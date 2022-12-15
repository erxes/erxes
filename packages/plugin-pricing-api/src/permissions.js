module.exports = {
  pricing: {
    name: 'pricing',
    description: 'Pricing',
    actions: [
      {
        name: 'allPricing',
        description: 'All Pricing',
        use: ['showPricing', 'managePricing']
      },
      {
        name: 'managePricing',
        description: 'Manage Pricing',
        use: ['showPricing']
      },
      {
        name: 'showPricing',
        description: 'Show Pricing'
      },
    ]
  }
};
