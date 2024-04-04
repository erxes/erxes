const SubscriptionProduct = `
type ForumSubscriptionProduct {
    _id: ID!
    name: String
    description: String
    unit: ForumTimeDurationUnit!
    multiplier: Float!
    price: Float!
    listOrder: Float!
    userType: String
}
`;

export default SubscriptionProduct;
