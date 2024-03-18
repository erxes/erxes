export const types = `
  type AutomationResponse {
    content: JSON
    responseId: String
    userId: String
    sessionCode: String
  }
  type PutResponse {
    _id: String
    createdAt: Date
    modifiedAt: Date
    contentType: String
    contentId: String
    number: String
    success: String
    billId: String
    date: String
    macAddress: String
    internalCode: String
    billType: String
    lotteryWarningMsg: String
    errorCode: String
    message: String
    getInformation: String
    taxType: String
    qrData: String
    lottery: String
    amount: String
    cityTax: String
    vat: String
    cashAmount: String
    nonCashAmount: String
    returnBillId: String
    sendInfo: JSON
    stocks: JSON
    registerNo: String
    customerNo: String
    customerName: String
  }
`;

const queryParams = `
  page: Int
  perPage: Int
  sortField: String
  sortDirection: Int
  search: String
  contentType: String
  success: String
  billType: String
  billIdRule: String
  isLast: String
  orderNumber: String
  contractNumber: String
  transactionNumber: String
  dealName: String
  pipelineId: String
  stageId: String
  createdStartDate: Date
  createdEndDate: Date
  paidDate: String
`;

export const queries = `
  putResponses(${queryParams}): [PutResponse]
  putResponsesByDate(${queryParams}): JSON
  putResponsesDuplicated(startDate: Date, endDate: Date, billType: String, page: Int, perPage: Int): JSON
  putResponsesDuplicatedCount(startDate: Date, endDate: Date, billType: String, page: Int, perPage: Int): JSON
  putResponsesDuplicatedDetail(contentId: String, taxType: String): [PutResponse]
  putResponsesCount(${queryParams}): Int
  putResponsesAmount(${queryParams}): Float
  getDealLink(_id: String): String
  ebarimtGetCompany(companyRD: String!): JSON
`;

export const mutations = `
  putResponseReturnBill(_id: String!): PutResponse
`;
