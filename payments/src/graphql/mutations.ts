const createInvoice = `mutation CreateInvoice($paymentId: String!, $amount: Float!, $description: String!, $phone: String, $customerId: String, $companyId: String, $contentType: String, $contentTypeId: String) {
  createInvoice(paymentId: $paymentId, amount: $amount, description: $description, phone: $phone, customerId: $customerId, companyId: $companyId, contentType: $contentType, contentTypeId: $contentTypeId)
}`;

const mutations = { createInvoice };

export default mutations;
