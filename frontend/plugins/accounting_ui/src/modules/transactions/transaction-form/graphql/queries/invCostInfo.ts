import { gql } from '@apollo/client';

export const GET_ACC_CURRENT_COST_QUERY = gql`
  query accountingGetAccCurrentCost(
    $productIds: [String]
    $accountId: String
    $branchId: String
    $departmentId: String
  ) {
    getAccCurrentCost(
      productIds: $productIds
      accountId: $accountId
      branchId: $branchId
      departmentId: $departmentId
    )
  }
`;

export const GET_ACC_LAST_INCOME_PRICE_QUERY = gql`
  query accountingGetAccLastIncomePrice($productIds: [String]) {
    getAccLastIncomePrice(productIds: $productIds)
  }
`;

export const GET_ACCOUNTING_PRODUCT_UNIT_PRICE_QUERY = gql`
  query accountingProductUnitPrice($_id: String) {
    productDetail(_id: $_id) {
      _id
      unitPrice
    }
  }
`;
