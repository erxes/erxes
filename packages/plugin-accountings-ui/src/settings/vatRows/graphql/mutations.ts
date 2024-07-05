import { vatRowFields } from "./queries";

const vatRowInputParamsDefs = `
  $name: String
  $number: String
  $kind: String
  $formula: String
  $formula_text: String
  $tab_count: Float
  $is_bold: Boolean
  $status: String
  $percent: Float
`;

const vatRowInputParams = `
  name: $name
  number: $number
  kind: $kind
  formula: $formula
  formula_text: $formula_text
  tab_count: $tab_count
  is_bold: $is_bold
  status: $status
  percent: $percent
`;

const vatRowsAdd = `
  mutation vatRowsAdd(${vatRowInputParamsDefs}) {
    vatRowsAdd(${vatRowInputParams}) {
      ${vatRowFields}
    }
  }
`;

const vatRowsEdit = `
  mutation vatRowsEdit($_id: String!${vatRowInputParamsDefs}) {
    vatRowsEdit(_id: $_id, ${vatRowInputParams}) {
      ${vatRowFields}
    }
  }
`;

const vatRowsRemove = `
  mutation vatRowsRemove($vatRowIds: [String!]) {
    vatRowsRemove(vatRowIds: $vatRowIds)
  }
`;

export default {
  vatRowsAdd,
  vatRowsEdit,
  vatRowsRemove,
};
