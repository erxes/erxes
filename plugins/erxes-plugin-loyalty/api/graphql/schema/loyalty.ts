export const types = `
  type CustomerLoyalty {
    customerId: String
    loyalty: Float
  }
`;

export const queries = `
  customerLoyalty(
    customerId: String!
  ): CustomerLoyalty
`;
