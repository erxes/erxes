const transactionEmailDeliveries = `
  query transactionEmailDeliveries($page: Int, $perPage: Int) {
    transactionEmailDeliveries(page: $page, perPage: $perPage) {
      totalCount
      list {
        _id
        subject
        to
        cc
        from
        status
        createdAt
      }
    }
  }
`;

const engageReportsList = `
  query engageReportsList($page: Int, $perPage: Int) {
    engageReportsList(page: $page, perPage: $perPage) {
      totalCount
      list {
        _id
        status
        createdAt
        customerId
        engage {
          title
        }
      }
    }
  }
`;

export default {
  engageReportsList,
  transactionEmailDeliveries
};
