const transactions = `
  query Transactions(
    $branchId: String,
    $departmentId: String,
    $contentId: String,
    $contentType: String,
    $status: String,
    $createdAt: Date
  ) {
    transactions(
      branchId: $branchId,
      departmentId: $departmentId,
      contentId: $contentId,
      contentType: $contentType,
      status: $status,
      createdAt: $createdAt
    ) {
      _id
      branch {
        _id
        title
      }
      branchId
      department {
        _id
        title
      }
      departmentId
      contentId
      contentType
      status
      createdAt
    }
  }
`;

const transactionDetail = `
  query TransactionDetail($id: String) {
    transactionDetail(_id: $id) {
      _id
      branchId
      contentId
      contentType
      createdAt
      departmentId
      status
      transactionItems {
        count
        isDebit
        modifiedAt
        productId
        product {
          _id
          name
        }
        transactionId
        uomId
      }
    }
  }
`;

export default {
  transactions,
  transactionDetail
};
