import { gql } from '~/gql';

export const RE_CALC_REMAINDERS = gql(`
mutation accountingReCalcRemainders($branchId: String, $departmentId: String, $productCategoryId: String, $productIds: [String]) {
  reCalcRemainders(
    branchId: $branchId
    departmentId: $departmentId
    productCategoryId: $productCategoryId
    productIds: $productIds
  )
}
`);
