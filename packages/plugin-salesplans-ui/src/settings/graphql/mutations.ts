import { spLabelFields, timeProportionFields } from './queries';

const paramDefs = `
  $title: String,
  $description: String,
  $effect: String,
  $status: String,
  $color: String,
  $rules: [LabelRuleInput]
`;

const params = `
  title: $title
  description: $description
  effect: $effect
  status: $status
  color: $color
  rules: $rules
`;

const spLabelsAdd = `
  mutation spLabelsAdd(${paramDefs}) {
    spLabelsAdd(${params}) {
      ${spLabelFields}
    }
  }
`;

const spLabelsEdit = `
  mutation spLabelsEdit($_id: String!, ${paramDefs}) {
    spLabelsEdit(_id: $_id, ${params}) {
      ${spLabelFields}
    }
  }
`;

const spLabelsRemove = `
  mutation spLabelsRemove($_ids: [String]) {
    spLabelsRemove(_ids: $_ids)
  }
`;

const timeframesEdit = `
  mutation timeframesEdit($docs: [JSON]) {
    timeframesEdit(docs: $docs){
      _id
    }
  }
`;

const addParamDefs = `
  $departmentIds: [String],
  $branchIds: [String],
  $productCategoryId: String,
  $percents: JSON,
`;

const addParams = `
  departmentIds: $departmentIds,
  branchIds: $branchIds,
  productCategoryId: $productCategoryId,
  percents: $percents,
`;

const timeProportionsAdd = `
  mutation timeProportionsAdd(${addParamDefs}) {
    timeProportionsAdd(${addParams}) {
      ${timeProportionFields}
    }
  }
`;

const timeEditParamDefs = `
  $percents: JSON,
`;

const timeEditParams = `
  percents: $percents
`;

const timeProportionEdit = `
  mutation timeProportionEdit($_id: String!, ${timeEditParamDefs}) {
    timeProportionEdit(_id: $_id, ${timeEditParams}) {
      ${timeProportionFields}
    }
  }
`;

const timeProportionsRemove = `
  mutation timeProportionsRemove ($_ids: [String]) {
    timeProportionsRemove(_ids: $_ids)
  }
`;

export default {
  spLabelsAdd,
  spLabelsEdit,
  spLabelsRemove,
  timeframesEdit,
  timeProportionsAdd,
  timeProportionEdit,
  timeProportionsRemove
};
