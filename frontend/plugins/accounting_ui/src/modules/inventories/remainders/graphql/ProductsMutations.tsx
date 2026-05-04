import { gql } from '@apollo/client';

const safeRemInputParamDefs = `
  $branchId: String,
  $departmentId: String,
  $productCategoryId: String,
  $productIds: [String],
`;

const safeRemInputParams = `
  branchId: $branchId,
  departmentId: $departmentId,
  productCategoryId: $productCategoryId,
  productIds: $productIds
`;

export const RE_CALC_REMAINDERS = gql`
  mutation ReCalcRemainders(${safeRemInputParamDefs}) {
    reCalcRemainders(${safeRemInputParams}) 
  }
`;
