const subscriptionOrderMutations = `
    forumCpCreateSubscriptionOrder(subscriptionProductId: ID!): ForumSubscriptionOrder
    forumCpCompleteSubscriptionOrder(subscriptionOrderId: ID!, invoiceId: ID!): Boolean
`;
export default subscriptionOrderMutations;
