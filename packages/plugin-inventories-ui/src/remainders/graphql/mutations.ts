import { remainderProductFields } from './queries';

const remaindersUpdateFields = `
  $productCategoryId: String,
  $productIds: [String],
  $departmentId: String,
  $branchId: String
`;

const remaindersUpdateVariables = `
  productCategoryId: $productCategoryId,
  productIds: $productIds,
  departmentId: $departmentId,
  branchId: $branchId,
`;

const remaindersUpdate = `
  mutation remaindersUpdate(${remaindersUpdateFields}) {
    remaindersUpdate(${remaindersUpdateVariables}) {
      ${remainderProductFields}
    }
  }
`;

export default { remaindersUpdate };
