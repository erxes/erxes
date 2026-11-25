export const queries = `
  taxReportData(
    kind: String!
    fromDate: Date!
    toDate: Date!
    branchId: String
    departmentId: String
    createdUserId: String
    modifiedUserId: String
    assignedUserId: String
  ): [JSON]
`;
