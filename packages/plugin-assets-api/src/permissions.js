module.exports = {
  products: {
    name: 'assets',
    description: 'Assets',
    actions: [
      {
        name: 'assetsAll',
        description: 'All',
        use: ['showAssets', 'manageAssets', 'assetsMerge']
      },
      {
        name: 'manageAssets',
        description: 'Manage assets',
        use: ['showAssets']
      },
      {
        name: 'showAssets',
        description: 'Show assets'
      },
      {
        name: 'assetsMerge',
        description: 'Merge assets'
      },
      {
        name: 'assetsAssignKbArticles',
        description: 'Assign knowledgebase articles'
      }
    ]
  }
};
