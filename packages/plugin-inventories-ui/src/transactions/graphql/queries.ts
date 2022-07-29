const transactions = `
  query Transactions {
    transactions {
      _id,
      branchId,
      departmentId,
      contentId,
      contentType,
      status,
      createdAt,
      createdBy
    }
  }
`;

export default {
  transactions
};
