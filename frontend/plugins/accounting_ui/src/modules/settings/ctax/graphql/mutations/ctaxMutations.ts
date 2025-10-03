import { gql } from '@apollo/client';
import { ctaxRowFields } from '../queries/getCtaxs';

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

export const CTAX_ROWS_ADD = gql`
  mutation ctaxRowsAdd(${ctaxRowInputParamsDefs}) {
    ctaxRowsAdd(${ctaxRowInputParams}) {
      ${ctaxRowFields}
    }
  }
`;

export const CTAX_ROWS_EDIT = gql`
  mutation ctaxRowsEdit($_id: String!${ctaxRowInputParamsDefs}) {
    ctaxRowsEdit(_id: $_id, ${ctaxRowInputParams}) {
      ${ctaxRowFields}
    }
  }
`;

export const CTAX_ROWS_REMOVE = gql`
  mutation ctaxRowsRemove($ctaxRowIds: [String!]) {
    ctaxRowsRemove(ctaxRowIds: $ctaxRowIds)
  }
`;
