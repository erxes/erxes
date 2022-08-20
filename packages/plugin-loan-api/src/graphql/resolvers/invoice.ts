const Invoices = {
  company(invoice) {
    return (
      invoice.companyId && {
        __typename: 'User',
        _id: invoice.companyId
      }
    );
  },

  customer(invoice) {
    return (
      invoice.customerId && {
        __typename: 'User',
        _id: invoice.customerId
      }
    );
  },

  contract(invoice) {
    return (
      invoice.contractId && {
        __typename: 'User',
        _id: invoice.contractId
      }
    );
  },

  transaction(invoice) {
    return (
      invoice._id && {
        __typename: 'User',
        _id: invoice._id
      }
    );
  }
};

export default Invoices;
