export const types = `
  type FxaOwnerRecord @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String
    fixedAssetId: String
    code: String
    sequence: Int
    count: Float
    action: String
    status: String

    ownerId: String

    transactionId: String
    transactionDetailId: String

    createdAt: Date
    updatedAt: Date
    createdBy: String
    modifiedBy: String
  }
`;

export const queries = `
  fxaOwnerRecords(
    searchValue: String
    ids: [String]
    fixedAssetIds: [String]
    fixedAssetId: String
    categoryId: String
    action: String
    status: String
    ownerId: String
    balanceOnly: Boolean
    createdFrom: Date
    createdTo: Date
    transactionId: String
    page: Int
    perPage: Int
    limit: Int
  ): [FxaOwnerRecord]

  fxaOwnerRecordsCount(
    searchValue: String
    ids: [String]
    fixedAssetIds: [String]
    fixedAssetId: String
    categoryId: String
    action: String
    status: String
    ownerId: String
    balanceOnly: Boolean
    createdFrom: Date
    createdTo: Date
    transactionId: String
  ): Int

`;

export const mutations = `
  fixedAssetOwnerRecordsAdd(
    fixedAssetId: String!
    code: String
    sequence: Int
    count: Float!
    action: String!
    status: String
    ownerId: String!
  ): FxaOwnerRecord

  fixedAssetOwnerRecordsTransfer(
    fixedAssetId: String!
    code: String
    sequence: Int
    count: Float!
    fromOwnerId: String!
    toOwnerId: String!
  ): [FxaOwnerRecord]

  fixedAssetOwnerRecordsRemove(_id: String!): JSON
`;
