const transactionEmailDeliveries = `
  query transactionEmailDeliveries($searchValue: String, $page: Int, $perPage: Int) {
    transactionEmailDeliveries(searchValue: $searchValue, page: $page, perPage: $perPage) {
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
