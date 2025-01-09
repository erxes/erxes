import { ctaxRowFields } from "./queries";

const ctaxRowInputParamsDefs = `
  $name: String
  $number: String
  $kind: String
  $formula: String
  $formulaText: String
  $status: String
  $percent: Float
`;

const ctaxRowInputParams = `
  name: $name
  number: $number
  kind: $kind
  formula: $formula
  formulaText: $formulaText
  status: $status
  percent: $percent
`;

const ctaxRowsAdd = `
  mutation ctaxRowsAdd(${ctaxRowInputParamsDefs}) {
    ctaxRowsAdd(${ctaxRowInputParams}) {
      ${ctaxRowFields}
    }
  }
`;

const ctaxRowsEdit = `
  mutation ctaxRowsEdit($_id: String!${ctaxRowInputParamsDefs}) {
    ctaxRowsEdit(_id: $_id, ${ctaxRowInputParams}) {
      ${ctaxRowFields}
    }
  }
`;

const ctaxRowsRemove = `
  mutation ctaxRowsRemove($ctaxRowIds: [String!]) {
    ctaxRowsRemove(ctaxRowIds: $ctaxRowIds)
  }
`;

export default {
  ctaxRowsAdd,
  ctaxRowsEdit,
  ctaxRowsRemove,
};
