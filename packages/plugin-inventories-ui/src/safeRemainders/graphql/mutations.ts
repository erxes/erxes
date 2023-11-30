import { safeRemainderFields } from './queries';

const addSafeRemainderFields = `
  $branchId: String,
  $departmentId: String,
  $date: Date,
  $description: String,
  $productCategoryId: String,
  $attachment: AttachmentInput
  $filterField: String
`;

const addSafeRemainderVariables = `
  branchId: $branchId,
  departmentId: $departmentId,
  date: $date,
  description: $description,
  productCategoryId: $productCategoryId,
  attachment: $attachment,
  filterField: $filterField,
`;

const safeRemainderAdd = `
  mutation safeRemainderAdd(${addSafeRemainderFields}) {
    safeRemainderAdd(${addSafeRemainderVariables}) {
      ${safeRemainderFields}
    }
  }
`;

const safeRemainderRemove = `
  mutation safeRemainderRemove($_id: String!) {
    safeRemainderRemove(_id: $_id)
  }
`;

export default {
  safeRemainderAdd,
  safeRemainderRemove
};
