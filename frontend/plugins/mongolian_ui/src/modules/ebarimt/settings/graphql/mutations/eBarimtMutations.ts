import { gql } from '@apollo/client';

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

export const EBARIMT_ADD = gql`
  mutation ebarimtAdd(${vatRowInputParamsDefs}) {
    ebarimtAdd(${vatRowInputParams}) {
      _id
      title
      number
      kind
      formula
      formulaText
      tabCount
      isBold
      status
      percent
    }
  }
`;

export const EBARIMT_EDIT = gql`
  mutation ebarimtEdit($_id: String!${vatRowInputParamsDefs}) {
    ebarimtEdit(_id: $_id, ${vatRowInputParams}) {
      _id
      title
      number
      kind
      formula
      formulaText
      tabCount
      isBold
      status
      percent
    }
  }
`;

export const EBARIMT_REMOVE = gql`
  mutation ebarimtRemove($vatRowIds: [String!]) {
    ebarimtRemove(vatRowIds: $vatRowIds)
  }
`;
