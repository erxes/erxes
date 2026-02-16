export const types = `
    type AdjustClosingEntry @key(fields: "_id") @cacheControl(maxAge: 3) {
      _id: String!
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
      createdAt: Date
      updatedAt: Date
      createdBy: String
      modifiedBy: String
    }

    type AdjustClosingPreviewItem {
        accountId: String!
        side: String!  
        amount: Float!
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

    adjustClosingEntryDetail(
        _id: String!
    ): AdjustClosingEntry

    adjustClosingEntries(
        ${adjustClosingEntryQueryParams}
    ): [AdjustClosingEntry]
    
      previewAdjustClosingEntries(
        beginDate: Date!
        date: Date!
        accountIds: [String!]!
    ): [AdjustClosingPreviewItem!]!

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
    `;
