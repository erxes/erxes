import { spLabelFields } from './queries';

const paramDefs = `
  $title: String,
  $description: String,
  $effect: String,
  $status: String,
  $color: String,
  $multiplier: Float
`;

const params = `
  title: $title
  description: $description
  effect: $effect
  status: $status
  color: $color
  multiplier: $multiplier
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
  mutation timeframesEdit($update: [TimeframeInput], $add: [AddTimeframeInput]) {
    timeframesEdit(update: $update, add: $add){
      _id
    }
  }
`;

const timeframesRemove = `
  mutation timeframesRemove($_id: String) {
    timeframesRemove(_id: $_id)
  }
`;

export default {
  spLabelsAdd,
  spLabelsEdit,
  spLabelsRemove,
  timeframesEdit,
  timeframesRemove
};
