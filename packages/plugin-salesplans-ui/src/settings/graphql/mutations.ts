import { spLabelFields } from './queries';

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

export default {
  spLabelsAdd,
  spLabelsEdit,
  spLabelsRemove,
  timeframesEdit
};
