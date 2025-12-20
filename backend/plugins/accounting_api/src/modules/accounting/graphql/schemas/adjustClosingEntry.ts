export const types = `
    type AdjustClosingEntry @key(fields: "_id") @cacheControl(maxAge: 3) {
        _id: String!
        code: String
        name: String
        description: String
        status: String
        createdAt: Date
        updatedAt: Date
    }

    type AdjustClosingEntriesListResponse {
        list: [AdjustClosingEntry]
        pageInfo: PageInfo
        totalCount: Int
    }
    `;

const adjustClosingEntryQueryParams = `
    page: Int
    perPage: Int
    sortField: String
    sortDirection: Int
    `;

export const queries = `
    adjustClosingEntires(
        ${adjustClosingEntryQueryParams}
    ): AdjustClosingEntriesListResponse

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
