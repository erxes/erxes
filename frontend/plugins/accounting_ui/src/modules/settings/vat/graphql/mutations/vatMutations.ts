import { gql } from '@apollo/client';
import { vatRowFields } from '../queries/getVats';

const vatRowInputParamsDefs = `
  $name: String
  $number: String
  $kind: String
  $formula: String
  $formulaText: String
  $tabCount: Float
  $isBold: Boolean
  $status: String
  $percent: Float
`;

const vatRowInputParams = `
  name: $name
  number: $number
  kind: $kind
  formula: $formula
  formulaText: $formulaText
  tabCount: $tabCount
  isBold: $isBold
  status: $status
  percent: $percent
`;

export const VAT_ROWS_ADD = gql`
  mutation vatRowsAdd(${vatRowInputParamsDefs}) {
    vatRowsAdd(${vatRowInputParams}) {
      ${vatRowFields}
    }
  }
`;

export const VAT_ROWS_EDIT = gql`
  mutation vatRowsEdit($_id: String!${vatRowInputParamsDefs}) {
    vatRowsEdit(_id: $_id, ${vatRowInputParams}) {
      ${vatRowFields}
    }
  }
`;

export const VAT_ROWS_REMOVE = gql`
  mutation vatRowsRemove($vatRowIds: [String!]) {
    vatRowsRemove(vatRowIds: $vatRowIds)
  }
`;
