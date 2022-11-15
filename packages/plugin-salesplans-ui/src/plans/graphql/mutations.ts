import { yearPlanFields } from './queries';

const addParamDefs = `
  $year: Int,
  $departmentId: String,
  $branchId: String,
  $productCategoryId: String,
  $productId: String,
`;

const addParams = `
  year: $year,
  departmentId: $departmentId,
  branchId: $branchId,
  productCategoryId: $productCategoryId,
  productId: $productId,
`;

const yearPlansAdd = `
  mutation yearPlansAdd (${addParamDefs}) {
    yearPlansAdd(${addParams}) {
      ${yearPlanFields}
    }
  }
`;

const yearPlanEditParamDefs = `
  $uomId: String,
  $values: JSON
`;

const yearPlanEditParams = `
  uomId: $uomId,
  values: $values
`;

const yearPlanEdit = `
  mutation yearPlanEdit($_id: String!, ${yearPlanEditParamDefs}) {
    yearPlanEdit(_id: $_id, ${yearPlanEditParams}) {
      ${yearPlanFields}
    }
  }
`;

const yearPlansRemove = `
  mutation yearPlansRemove ($_ids: [String]) {
    yearPlansRemove(_ids: $_ids)
  }
`;

export default {
  yearPlansAdd,
  yearPlanEdit,
  yearPlansRemove
};
