import { gql } from '@apollo/client';

export const GET_ACC_CURRENT_COST_QUERY = gql`
  query GetAccCurrentCost($productIds: [String], $accountId: String, $branchId: String, $departmentId: String) {
    getAccCurrentCost(productIds: $productIds, accountId: $accountId, branchId: $branchId, departmentId: $departmentId)
  }
`;