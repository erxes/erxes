import { safeRemainderFields, safeRemItemFields } from './queries';

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

const updateSafeRemItem = `
  mutation updateSafeRemItem(
    $_id: String,
    $status: String,
    $remainder: Float,
  ) {
    updateSafeRemItem(
      _id: $_id,
      status: $status,
      remainder: $remainder,
    ) {
      ${safeRemItemFields}
    }
  }
`;

export default {
  createSafeRemainder,
  removeSafeRemainder,

  updateSafeRemItem
};
