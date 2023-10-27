const transactionAdd = `
  mutation TransactionAdd(
    $branchId: String,
    $departmentId: String,
    $contentType: String,
    $contentId: String,
    $products: [TransactionProductInput],
    $status: String
  ) {
    transactionAdd(
      branchId: $branchId,
      departmentId: $departmentId,
      contentType: $contentType,
      contentId: $contentId,
      products: $products,
      status: $status
    )
  }
`;

export default {
  transactionAdd
};
