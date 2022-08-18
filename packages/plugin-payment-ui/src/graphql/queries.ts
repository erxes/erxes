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
query Query($type: String) {
  paymentConfigsCountByType(type: $type)
}
`;

export default {
  paymentConfigs,
  paymentConfigsCountByType
};
