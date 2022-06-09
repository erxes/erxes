import { safeRemainderFields } from './queries';

const createSafeRemainderFields = `
  $branchId: String,
  $departmentId: String,
  $date: Date,
  $description: String,
  $productCategoryId: String
`;

const createSafeRemainderVariables = `
  branchId: $branchId,
  departmentId: $departmentId,
  date: $date,
  description: $description,
  productCategoryId: $productCategoryId
`;

const createSafeRemainder = `
  mutation createSafeRemainder(${createSafeRemainderFields}) {
    createSafeRemainder(${createSafeRemainderVariables}) {
      ${safeRemainderFields}
    }
  }
`;

export default { createSafeRemainder };
