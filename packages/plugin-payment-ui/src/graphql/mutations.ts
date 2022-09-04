const commonParamDefs = `$name: String!, $type: String!, $status: String, $config: JSON`;
const commonParams = `name: $name, type: $type, status: $status, config: $config`;

const paymentConfigsAdd = `
mutation paymentConfigsAdd(${commonParamDefs}) {
  paymentConfigsAdd(${commonParams}) {
    _id
  }
}
`;

const paymentConfigsEdit = `
mutation PaymentConfigsEdit($id: String!, ${commonParamDefs}) {
  paymentConfigsEdit(id: $id, ${commonParams}) {
    _id
  }
}
`;

const paymentConfigRemove = `
mutation paymentConfigRemove($id: String!) {
  paymentConfigRemove(id: $id)
}`;

export default {
  paymentConfigsAdd,
  paymentConfigsEdit,
  paymentConfigRemove
};
