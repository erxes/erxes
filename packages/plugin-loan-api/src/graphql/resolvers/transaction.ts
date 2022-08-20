const Transactions = {
  company(transaction) {
    return (
      transaction.companyId && {
        __typename: 'User',
        _id: transaction.companyId
      }
    );
  },
  customer(transaction) {
    return (
      transaction.customerId && {
        __typename: 'User',
        _id: transaction.customerId
      }
    );
  },
  contract(transaction) {
    return (
      transaction.contractId && {
        __typename: 'User',
        _id: transaction.contractId
      }
    );
  },
  invoice(transaction) {
    return (
      transaction.invoiceId && {
        __typename: 'User',
        _id: transaction.invoiceId
      }
    );
  }
};

export default Transactions;
