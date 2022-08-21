const commonParamDefs = `$name: String!, $type: String!, $status: String, $config: JSON`;
const commonParams = `name: $name, type: $type, status: $status, config: $config`;

const paymentConfigsAdd = `
mutation paymentConfigsAdd(${commonParamDefs}) {
  paymentConfigsAdd(${commonParams}) {
    _id
  }
}
`;

export default {
  paymentConfigsAdd
};
