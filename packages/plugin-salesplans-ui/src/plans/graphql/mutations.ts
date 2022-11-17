import { dayPlanFields, yearPlanFields } from './queries';

const addParamDefs = `
  $departmentId: String,
  $branchId: String,
  $productCategoryId: String,
  $productId: String,
`;

const addParams = `
  departmentId: $departmentId,
  branchId: $branchId,
  productCategoryId: $productCategoryId,
  productId: $productId,
`;

const yearPlansAdd = `
  mutation yearPlansAdd ($year: Int, ${addParamDefs}) {
    yearPlansAdd(year: $year, ${addParams}) {
      ${yearPlanFields}
    }
  }
`;

const planEditParamDefs = `
  $uomId: String,
  $values: JSON
`;

const planEditParams = `
  uomId: $uomId,
  values: $values
`;

const yearPlanEdit = `
  mutation yearPlanEdit($_id: String!, ${planEditParamDefs}) {
    yearPlanEdit(_id: $_id, ${planEditParams}) {
      ${yearPlanFields}
    }
  }
`;

const yearPlansRemove = `
  mutation yearPlansRemove ($_ids: [String]) {
    yearPlansRemove(_ids: $_ids)
  }
`;

const dayPlansAdd = `
  mutation dayPlansAdd($date: Date, ${addParamDefs}) {
    dayPlansAdd(date: $date, ${addParams}) {
      ${dayPlanFields}
    }
  }
`;

const dayPlanEdit = `
  mutation dayPlanEdit($_id: String!, ${planEditParamDefs}) {
    dayPlanEdit(_id: $_id, ${planEditParams}) {
      ${dayPlanFields}
    }
  }
`;

const dayPlansRemove = `
  mutation dayPlansRemove ($_ids: [String]) {
    dayPlansRemove(_ids: $_ids)
  }
`;

export default {
  yearPlansAdd,
  yearPlanEdit,
  yearPlansRemove,

  dayPlansAdd,
  dayPlanEdit,
  dayPlansRemove
};
