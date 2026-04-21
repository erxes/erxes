export const types = `
  type AdjustClosingEntry {
    _id: String
    accountId: String
    code: String
    name: String
    description: String
    status: String
    date: Date
    beginDate: Date
    integrateAccountId: String
    periodGLAccountId: String
    earningAccountId: String
    taxPayableAccountId: String
    balance: Float
    percent: Float
    mainAccTrId: String
    integrateTrId: String
    createdAt: Date
    updatedAt: Date
    createdBy: String
    modifiedBy: String
  }

  type AdjustClosingDetail {
    _id: String!
    branchId: String
    departmentId: String
    entries: [AdjustClosingEntry]
    closeIntegrateTrId: String
    periodGLTrId: String
    createdAt: Date
    updatedAt: Date
  }
  type AdjustClosing @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String!
    status: String
    date: Date
    beginDate: Date
    description: String
    
    details: [AdjustClosingDetail]

    integrateAccountId: String
    periodGLAccountId: String
    earningAccountId: String
    taxPayableAccountId: String

    branchId: String
    departmentId: String
    closeIntegrateTrId: String
    periodGLTrId: String

    entries: [AdjustClosingEntry]
    
    taxImpactValue: Float

    closePeriodTrId: String
    earningTrId: String
    taxPayableTrId: String

    createdBy: String
    modifiedBy: String
    createdAt: Date
    updatedAt: Date
  }
`;

const adjustClosingQueryParams = `
  page: Int
  perPage: Int
  sortField: String
  sortDirection: Int
  status: String
`;

export const queries = `
  adjustClosings(${adjustClosingQueryParams}): [AdjustClosing]

  adjustClosingsCount(${adjustClosingQueryParams}): Int

  adjustClosingDetail(_id: String!): AdjustClosing

  adjustClosingEntriesCount(_id: String!): Int
`;

export const mutations = `
  adjustClosingAdd(
    date: Date!
    beginDate: Date
    description: String
    integrateAccountId: String!
    periodGLAccountId: String!
    earningAccountId: String!
    taxPayableAccountId: String!
  ): AdjustClosing

adjustClosingEdit(
  _id: String!
  description: String
  beginDate: Date
  integrateAccountId: String
  periodGLAccountId: String
  earningAccountId: String
  taxPayableaccountId: String
  accountId: String
  balance: Float
  percent: Float
  mainAccTrId: String
  integrateTrId: String
): AdjustClosing

  adjustClosingRemove(_id: String!): String

  adjustClosingRun(_id: String!): AdjustClosing
`;
