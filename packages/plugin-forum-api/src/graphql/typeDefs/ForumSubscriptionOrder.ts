const ForumSubscriptionOrder = `
type ForumSubscriptionOrder {
    _id: ID!
  
    invoiceId: String
  
    unit: ForumTimeDurationUnit!
    multiplier: Float!
  
    price: Float!
  
    cpUserId: String!
    createdAt: String!

    contentType: String!

    state: ForumSubscriptionOrderState!
}
`;

export default ForumSubscriptionOrder;

/*
  _id: any;

  invoiceId?: string | null;

  unit: TimeDurationUnit;
  multiplier: number;

  price: number;

  cpUserId: string;
  createdAt: Date;

  state: SubscriptionOrderState;
  */
