export const types = `
  type FxaInstanceLog @key(fields: "_id") @cacheControl(maxAge: 3) {
    _id: String
    fxaInstanceId: String
    fixedAssetId: String
    eventType: String
    eventDate: Date
    description: String

    transactionId: String
    transactionDetailId: String

    fromBranchId: String
    toBranchId: String
    fromDepartmentId: String
    toDepartmentId: String
    fromResponsibleUserId: String
    toResponsibleUserId: String
    fromStatus: String
    toStatus: String

    createdAt: Date
    createdBy: String
  }
`;

export const queries = '';

export const mutations = '';
