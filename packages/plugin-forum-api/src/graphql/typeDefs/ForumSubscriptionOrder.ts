const ForumSubscriptionOrder = `
type ForumSubscriptionOrder {
    _id: ID!
  
    invoiceId: String
    invoiceAt: Date
  
    paymentConfirmed: Boolean
    paymentConfirmedAt: Date
  
    unit: ForumTimeDurationUnit!
    multiplier: Float!
  
    price: Float!
  
    cpUserId: String!
    createdAt: String!

    contentType: String!
}
`;

export default ForumSubscriptionOrder;
