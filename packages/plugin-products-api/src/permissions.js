module.exports = {
  products: {
    name: 'products',
    description: 'Products',
    actions: [
      {
        name: 'productsAll',
        description: 'All',
        use: ['showProducts', 'manageProducts', 'productsMerge']
      },
      {
        name: 'manageProducts',
        description: 'Manage products',
        use: ['showProducts']
      },
      {
        name: 'showProducts',
        description: 'Show products'
      },
      {
        name: 'productsMerge',
        description: 'Merge products'
      }
    ]
  },
}