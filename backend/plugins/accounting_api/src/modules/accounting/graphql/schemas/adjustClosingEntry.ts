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

  
    `;

const adjustClosingEntryQueryParams = `
    page: Int
    perPage: Int
    sortField: String
    sortDirection: Int
    `;

export const queries = `
    adjustClosingEntries(
        ${adjustClosingEntryQueryParams}
    ): [AdjustClosingEntry]

    adjustClosingEntriesCount(
        ${adjustClosingEntryQueryParams}
    ): Int

    adjustClosingEntryDetail(
        _id: String!
    ): AdjustClosingEntry
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
