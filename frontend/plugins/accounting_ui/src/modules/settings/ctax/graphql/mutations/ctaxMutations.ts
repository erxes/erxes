import { gql } from '~/gql';

export const CTAX_ROWS_ADD = gql(`
mutation accountingCtaxRowsAdd($name: String, $number: String, $kind: String, $formula: String, $formulaText: String, $status: String, $percent: Float, $tabCount: Float, $isBold: Boolean, $valueSide: String, $ledgerFormulas: JSON) {
  ctaxRowsAdd(
    name: $name
    number: $number
    kind: $kind
    formula: $formula
    formulaText: $formulaText
    status: $status
    percent: $percent
    tabCount: $tabCount
    isBold: $isBold
    valueSide: $valueSide
    ledgerFormulas: $ledgerFormulas
  ) {
    _id
    name
    number
    kind
    formula
    formulaText
    status
    percent
    tabCount
    isBold
    valueSide
    ledgerFormulas
  }
}
`);

export const CTAX_ROWS_EDIT = gql(`
mutation accountingCtaxRowsEdit($_id: String!, $name: String, $number: String, $kind: String, $formula: String, $formulaText: String, $status: String, $percent: Float, $tabCount: Float, $isBold: Boolean, $valueSide: String, $ledgerFormulas: JSON) {
  ctaxRowsEdit(
    _id: $_id
    name: $name
    number: $number
    kind: $kind
    formula: $formula
    formulaText: $formulaText
    status: $status
    percent: $percent
    tabCount: $tabCount
    isBold: $isBold
    valueSide: $valueSide
    ledgerFormulas: $ledgerFormulas
  ) {
    _id
    name
    number
    kind
    formula
    formulaText
    status
    percent
    tabCount
    isBold
    valueSide
    ledgerFormulas
  }
}
`);

export const CTAX_ROWS_REMOVE = gql(`
mutation accountingCtaxRowsRemove($ctaxRowIds: [String!]!) {
  ctaxRowsRemove(ctaxRowIds: $ctaxRowIds)
}
`);
