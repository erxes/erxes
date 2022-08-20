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

export const subscriptions = `automationResponded(userId: String, sessionCode: String): AutomationResponse`;

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
  dealName: String
  pipelineId: String
  stageId: String
  createdStartDate: Date
  createdEndDate: Date
  paidDate: String
`;

export const queries = `
  putResponses(${queryParams}): [PutResponse]
  putResponsesCount(${queryParams}): Int
  putResponsesAmount(${queryParams}): Float
  getDealLink(_id: String): String
`;
