export const types = `
  type AutomationResponse {
    content: JSON
    responseId: String
    userId: String
    sessionCode: String
  }

  type PutResponse {
    _id: String
    number: String

    contentType: String
    contentId: String

    totalAmount: Float
    totalVAT: Float
    totalCityTax: Float
    districtCode: String
    branchNo: String
    merchantTin: String
    posNo: String
    customerTin: String
    customerName: String
    consumerNo: String
    type: String
    inactiveId: String
    invoiceId: String
    reportMonth: String
    data: JSON
    receipts: JSON
    payments: JSON

    easy: Boolean

    getInformation: String
    sendInfo: JSON
    state: String

    createdAt: Date
    modifiedAt: Date

    id: String
    posId: Float
    status: String
    message: String
    qrData: String
    lottery: String
    date: String
  }
`;

const queryParams = `
  page: Int
  perPage: Int
  sortField: String
  sortDirection: Int
  search: String
  contentType: String
  contentId: String
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
  putResponseReReturn(_id: String!): PutResponse
`;
