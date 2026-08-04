import { gql } from '@apollo/client';
import { safeRemainderFields } from './safeRemainderQueries';

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

export const SAFE_REMAINDER_ADD = gql`
  mutation SafeRemainderAdd(${safeRemInputParamDefs}) {
    safeRemainderAdd(${safeRemInputParams}) {
      ${safeRemainderFields}
    }
  }
`;
