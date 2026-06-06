export const types = `
  type Wish {
    _id: String!
    productId: String!
    customerId: String!
    product: Product
  }
`;

export const queries = `
  wish(productId: String!, customerId: String!): Wish
  wishlist(customerId: String!): [Wish]

  cpWishlist(customerId: String!): [Wish]
`;

export const mutations = `
  wishlistAdd(productId: String!, customerId: String!): Wish
  wishlistUpdate(_id: String!, productId: String, customerId: String): Wish
  wishlistRemove(_id: String!): Wish

  cpWishlistAdd(productId: String!, customerId: String!): Wish
  cpWishlistUpdate(_id: String!, productId: String, customerId: String): Wish
  cpWishlistRemove(_id: String!): Wish
`;
