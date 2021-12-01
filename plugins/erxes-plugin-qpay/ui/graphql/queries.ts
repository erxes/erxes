const getQpayDetailParams = `
  $invoiceId: String!
  `;

const getQpayDetailParamsValues = `
invoiceId: $invoiceId  
`;

const getQpayInvoiceDetails = `
  query getQpayInvoiceDetails(${getQpayDetailParams}) {
    getQpayInvoiceDetails(${getQpayDetailParamsValues})
  }
`;

const configs = `
  query configs {
    configs {
      _id
      code
      value
    }
  }
`;

export default {
  getQpayInvoiceDetails,
  configs  
};
