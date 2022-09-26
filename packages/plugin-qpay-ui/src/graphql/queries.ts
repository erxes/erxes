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

const getSpCheckParams = `
  $invoiceNo: String!
  `;

const getSpCheckParamsValues = `
invoiceNo: $invoiceNo  
`;

const checkSPInvoice = `
  query checkSPInvoice(${getSpCheckParams}) {
    checkSPInvoice(${getSpCheckParamsValues})
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
  checkSPInvoice,
  configs
};
