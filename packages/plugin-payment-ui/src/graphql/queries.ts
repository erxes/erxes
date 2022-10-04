const paymentConfigs = `
query paymentConfigs($paymentConfigIds: [String]!) {
  paymentConfigs(paymentConfigIds: $paymentConfigIds) {
    _id
    name
    type
    status
    config
  }
}
`;

const paymentConfigsCountByType = `
query PaymentConfigsCountByType {
  paymentConfigsCountByType {
    qpay
    socialPay
    total
  }
}
`;

const checkInvoice = `
query checkInvoice($paymentConfigId: String!, $invoiceId: String!) {
  checkInvoice(paymentConfigId: $paymentConfigId, invoiceId: $invoiceId)
}`;

const invoicesResponse = `
    _id
    amount
    contentType
    contentTypeId
    createdAt
    customerId
    description
    email
    paymentConfig {
      name
      type
    }
    phone
    resolvedAt
    status
    company {
      _id
      primaryName
    }
    customer {
      _id
      firstName
      lastName
      middleName
      primaryEmail
      primaryPhone
    }
    pluginData
`;

const invoices = `
query invoices($page: Int, $perPage: Int) {
  invoices(page: $page, perPage: $perPage) {
    ${invoicesResponse}
  }
}
`;

const invoicesTotalCount = `
query invoicesTotalCount($searchValue: String) {
  invoicesTotalCount(searchValue: $searchValue)
}
`;

export default {
  paymentConfigs,
  paymentConfigsCountByType,
  checkInvoice,
  invoices,
  invoicesTotalCount
};
