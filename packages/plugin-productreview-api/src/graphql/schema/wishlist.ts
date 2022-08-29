export const types = `
	type Wishlist {
		_id: String!
		productId: String
		customerId: String
	}
	type ProductResponse {
		_id: String!
		name: String
		code: String
		type: String
		description: String
		sku: String
		unitPrice: Float
		categoryId: String
		customFieldsData: JSON
		createdAt: Date
		tagIds: [String]
		productCount: Int
		minimiumCount: Int
		uomId: String
		subUoms: JSON
		vendorId: String
		supply: String
	}
`;
const params = `
    productId: String,
	customerId: String
`;
export const queries = `
	wishlist(productId: String!): [Wishlist]
	allWishlists(${params}): [ProductResponse]
`;
export const mutations = `
	wishlistAdd(${params}): Wishlist
	wishlistUpdate(_id: String!, ${params}): Wishlist
	wishlistRemove(_id: String!): Wishlist
`;
