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

const removeSafeRemainder = `
  mutation removeSafeRemainder($_id: String!) {
    removeSafeRemainder(_id: $_id)
  }
`;

export default {
  createSafeRemainder,
  removeSafeRemainder
};
