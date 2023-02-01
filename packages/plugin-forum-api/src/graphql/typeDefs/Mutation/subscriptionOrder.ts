const subscriptionOrderMutations = `
    forumCpCreateSubscriptionOrder(subscriptionProductId: ID!): ForumSubscriptionOrder
    forumCpCompleteSubscriptionOrder(subscriptionOrderId: ID!, invoiceId: ID!): Boolean
    forumCpFailSubscriptionOrder(subscriptionOrderId: ID!): Boolean
    forumManuallyExtendSubscription(
        unit: ForumTimeDurationUnit!
        multiplier: Float!
        price: Float!
        userType: ForumCpUserType!
        cpUserId: ID!
    ): ForumSubscriptionOrder!
    
`;
export default subscriptionOrderMutations;
