import { gql } from '~/gql';

export const CTAX_ROWS_ADD = gql(`
mutation accountingCtaxRowsAdd($name: String, $number: String, $kind: String, $formula: String, $formulaText: String, $status: String, $percent: Float) {
  ctaxRowsAdd(
    name: $name
    number: $number
    kind: $kind
    formula: $formula
    formulaText: $formulaText
    status: $status
    percent: $percent
  ) {
    _id
    name
    number
    kind
    formula
    formulaText
    status
    percent
  }
}
`);

export const CTAX_ROWS_EDIT = gql(`
mutation accountingCtaxRowsEdit($_id: String!, $name: String, $number: String, $kind: String, $formula: String, $formulaText: String, $status: String, $percent: Float) {
  ctaxRowsEdit(
    _id: $_id
    name: $name
    number: $number
    kind: $kind
    formula: $formula
    formulaText: $formulaText
    status: $status
    percent: $percent
  ) {
    _id
    name
    number
    kind
    formula
    formulaText
    status
    percent
  }
}
`);

export const CTAX_ROWS_REMOVE = gql(`
mutation accountingCtaxRowsRemove($ctaxRowIds: [String!]!) {
  ctaxRowsRemove(ctaxRowIds: $ctaxRowIds)
}
`);
