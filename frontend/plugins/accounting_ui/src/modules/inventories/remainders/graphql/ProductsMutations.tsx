import { gql } from '@apollo/client';

const safeRemInputParamDefs = `
  $branchId: String,
  $departmentId: String,
  $date: Date,
  $description: String,
  $productCategoryId: String,
  $attachment: AttachmentInput
  $filterField: String
`;

const safeRemInputParams = `
  branchId: $branchId,
  departmentId: $departmentId,
  date: $date,
  description: $description,
  productCategoryId: $productCategoryId,
  attachment: $attachment,
  filterField: $filterField,
`;

export const RE_CALC_REMAINDERS = gql`
  mutation ReCalcRemainders(${safeRemInputParamDefs}) {
    reCalcRemainders(${safeRemInputParams}) 
  }
`;
