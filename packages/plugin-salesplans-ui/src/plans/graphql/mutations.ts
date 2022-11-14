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

const editParamDefs = `
  $uomId: String,
  $values: YearPlanInput,
`;

const editParams = `
  uomId: $uomId,
  values: $values,
`;

const yearPlansAdd = `
  mutation yearPlansAdd (${addParamDefs}) {
    yearPlansAdd(${addParams}) {
      ${yearPlanFields}
    }
  }
`;

const yearPlanEdit = `
mutation yearPlanEdit ($_id: String!, ${editParamDefs}) {
  yearPlanEdit($_id: String!, ${editParams}) {
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
