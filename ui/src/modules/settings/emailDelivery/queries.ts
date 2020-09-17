const transactionEmailDeliveries = `
  query transactionEmailDeliveries($status: String, $page: Int, $perPage: Int) {
    transactionEmailDeliveries(status: $status, page: $page, perPage: $perPage) {
      totalCount
      list {
        _id
        subject
        status
        createdAt
      }
    }
  }
`;

export default {
  transactionEmailDeliveries
};
