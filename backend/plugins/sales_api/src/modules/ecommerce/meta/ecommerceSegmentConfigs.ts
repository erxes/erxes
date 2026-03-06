export const ecommerceSegmentConfigs = {
  contentTypes: [
    {
      moduleName: 'ecommerce',
      type: 'productReview',
      description: 'Product reviews',
      esIndex: 'ecommerce_productreviews',
    },
    {
      moduleName: 'ecommerce',
      type: 'wishlist',
      description: 'Wishlist items',
      esIndex: 'ecommerce_wishlists',
    },
    {
      moduleName: 'ecommerce',
      type: 'lastViewedItem',
      description: 'Last viewed items',
      esIndex: 'ecommerce_lastvieweditems',
    },
    {
      moduleName: 'ecommerce',
      type: 'address',
      description: 'Customer addresses',
      esIndex: 'ecommerce_addresses',
    },
  ],
};