const paymentConfigs = `
query paymentConfigs {
  paymentConfigs {
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

export default {
  paymentConfigs,
  paymentConfigsCountByType
};
