export const types = `
	type Wishlist {
		_id: String!
		productId: String
		customerId: String
	}
`;
const params = `
    productId: String,
		customerId: String
`;
export const queries = `
	wishlist(productId: String!): [Wishlist]
	allWishlists(customerId: String): [Wishlist]
`;
export const mutations = `
	wishlistAdd(${params}): Wishlist
	wishlistUpdate(_id: String!, ${params}): Wishlist
	wishlistRemove(_id: String!): Wishlist
`;
