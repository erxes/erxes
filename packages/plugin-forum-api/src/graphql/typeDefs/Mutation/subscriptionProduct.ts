const subscriptionProduct = `
    forumCreateSubscriptionProduct(
        name: String
        description: String
        unit: ForumTimeDurationUnit!
        multiplier: Float!
        price: Float!
        listOrder: Float
        userType: String
    ): ForumSubscriptionProduct

    forumPatchSubscriptionProduct(
        _id: ID!
        name: String
        description: String
        unit: ForumTimeDurationUnit
        multiplier: Float
        price: Float
        listOrder: Float
        userType: String
    ): ForumSubscriptionProduct

    forumDeleteSubscriptionProduct(_id: ID!): ForumSubscriptionProduct
`;

export default subscriptionProduct;
