const commonParamDefs = `$name: String!, $type: String!, $status: String, $config: JSON`;
const commonParams = `name: $name, type: $type, status: $status, config: $config`;

const createInvoiceParamDefs = `$paymentConfigId: String!, $amount: Float!, $description: String!, $phone: String, $customerId: String, $companyId: String`;

const createInvoiceParams = `paymentConfigId: $paymentConfigId, amount: $amount, description: $description, phone: $phone, customerId: $customerId, companyId: $companyId`;

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

const createInvoice = `
mutation createInvoice(${createInvoiceParamDefs}) {
  createInvoice(${createInvoiceParams})
}
`;

export default {
  paymentConfigsAdd,
  paymentConfigsEdit,
  paymentConfigRemove,
  createInvoice
};
