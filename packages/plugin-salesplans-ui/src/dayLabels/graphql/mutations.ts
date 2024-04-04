import { dayLabelFields } from './queries';

const addParamDefs = `
  $dates: [String],
  $departmentIds: [String],
  $branchIds: [String],
  $labelIds: [String],
`;

const addParams = `
  dates: $dates,
  departmentIds: $departmentIds,
  branchIds: $branchIds,
  labelIds: $labelIds,
`;

const dayLabelsAdd = `
  mutation dayLabelsAdd (${addParamDefs}) {
    dayLabelsAdd(${addParams}) {
      ${dayLabelFields}
    }
  }
`;

const dayLabelEditParamDefs = `
  $labelIds: [String]
`;

const dayLabelEditParams = `
  labelIds: $labelIds,
`;

const dayLabelEdit = `
  mutation dayLabelEdit($_id: String!, ${dayLabelEditParamDefs}) {
    dayLabelEdit(_id: $_id, ${dayLabelEditParams}) {
      ${dayLabelFields}
    }
  }
`;

const dayLabelsRemove = `
  mutation dayLabelsRemove ($_ids: [String]) {
    dayLabelsRemove(_ids: $_ids)
  }
`;

export default {
  dayLabelsAdd,
  dayLabelEdit,
  dayLabelsRemove
};
