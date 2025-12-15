export default {
  customer({ customerId }) {
    return customerId && { __typename: 'Customer', _id: customerId };
  },
};
