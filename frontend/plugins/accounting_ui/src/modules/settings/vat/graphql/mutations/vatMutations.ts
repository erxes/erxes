import { gql } from '~/gql';

export const VAT_ROWS_ADD = gql(`
mutation accountingVatRowsAdd($name: String, $number: String, $kind: String, $formula: String, $formulaText: String, $tabCount: Float, $isBold: Boolean, $status: String, $percent: Float, $valueSide: String, $ledgerFormulas: JSON) {
  vatRowsAdd(
    name: $name
    number: $number
    kind: $kind
    formula: $formula
    formulaText: $formulaText
    tabCount: $tabCount
    isBold: $isBold
    status: $status
    percent: $percent
    valueSide: $valueSide
    ledgerFormulas: $ledgerFormulas
  ) {
    _id
    name
    number
    kind
    formula
    formulaText
    tabCount
    isBold
    status
    percent
    valueSide
    ledgerFormulas
  }
}
`);

export const VAT_ROWS_EDIT = gql(`
mutation accountingVatRowsEdit($_id: String!, $name: String, $number: String, $kind: String, $formula: String, $formulaText: String, $tabCount: Float, $isBold: Boolean, $status: String, $percent: Float, $valueSide: String, $ledgerFormulas: JSON) {
  vatRowsEdit(
    _id: $_id
    name: $name
    number: $number
    kind: $kind
    formula: $formula
    formulaText: $formulaText
    tabCount: $tabCount
    isBold: $isBold
    status: $status
    percent: $percent
    valueSide: $valueSide
    ledgerFormulas: $ledgerFormulas
  ) {
    _id
    name
    number
    kind
    formula
    formulaText
    tabCount
    isBold
    status
    percent
    valueSide
    ledgerFormulas
  }
}
`);

export const VAT_ROWS_REMOVE = gql(`
mutation accountingVatRowsRemove($vatRowIds: [String!]!) {
  vatRowsRemove(vatRowIds: $vatRowIds)
}
`);
