const list = `
  query paymentsQuery {
    payments {
      _id
      name
    }
  }
`;

const totalCount = `
  query paymentsTotalCountQuery {
    paymentsTotalCount
  }
`;

export default {
  list,
  totalCount
};
