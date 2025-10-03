export const types = `
  type AccountingInvCostSubInfo {
    remainder: Float
    cost: Float
  }

  type AccCurrentCost {
    productId: Float
  }
`;

export const queries = `
  getAccCurrentCost(productIds: [String], accountId: String, branchId: String, departmentId: String): JSON
`;

export const mutations = `
  
`;
