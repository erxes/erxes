export const types = `
    type AdjustClosingEntry @key(fields: "_id") @cacheControl(maxAge: 3) {
        _id: String!
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

    type AdjustClosing @key(fields: "_id") @cacheControl(maxAge: 3) {
        _id: String!
        branchId: String
        departmentId: String
        beginDate: Date
        date: Date
        status: String

        entries: [AdjustClosingEntry]  
        closeIntegrateTrId: String
        periodGLTrId: String

        createdAt: Date
        updatedAt: Date
    }
    `;

const adjustClosingEntryQueryParams = `
    page: Int
    perPage: Int
    sortField: String
    sortDirection: Int
    `;

export const queries = `
    adjustClosingEntry(
        ${adjustClosingEntryQueryParams}
    ): AdjustClosingEntry

    adjustClosingEntriesCount(
        ${adjustClosingEntryQueryParams}
    ): Int

    adjustClosingDetail(
      _id: String!
    ): AdjustClosing

    adjustClosingDetails(_id: String!): [AdjustClosing]

    adjustClosingEntries(
        ${adjustClosingEntryQueryParams}
    ): [AdjustClosingEntry]

    `;

export const mutations = `
  adjustClosingEntriesAdd(
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
  ): AdjustClosingEntry

    adjustClosingEntriesEdit(
        _id: String!
        code: String
        name: String
        description: String
    ): AdjustClosingEntry

    adjustClosingEntriesRemove(
        _id: String!
    ): String

    adjustClosingRun(_id: String!): AdjustClosing
    `;
