import { remainderProductFields } from './queries';

const updateRemaindersFields = `
  $productCategoryId: String,
  $productIds: [String],
  $departmentId: String,
  $branchId: String
`;

const updateRemaindersVariables = `
  productCategoryId: $productCategoryId,
  productIds: $productIds,
  departmentId: $departmentId,
  branchId: $branchId,
`;

const updateRemainders = `
  mutation updateRemainders(${updateRemaindersFields}) {
    updateRemainders(${updateRemaindersVariables}) {
      ${remainderProductFields}
    }
  }
`;

export default { updateRemainders };
