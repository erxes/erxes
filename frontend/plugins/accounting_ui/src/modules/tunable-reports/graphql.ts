import { gql } from '~/gql';

export const REPORT_FIELDS = gql(`
  fragment AccountingTunableReportFields on AccountingTunableReport {
    _id code name description header footer orientation status version
    sections {
      _id code name order isActive header footer formulaType
      columns { _id code name order isActive getDate isPre }
      rows { _id code name order isActive getDate isPre number kind valueSide isBold isItalic isUnderline tabCount }
      formulas {
        _id rowId columnId kind plusOrMinus percent debitAccountId creditAccountId
        debitAccountCategoryId creditAccountCategoryId getDate isPre valueSide ratioRule
        source { reportId sectionId rowId columnId }
        ratioSource { reportId sectionId rowId columnId }
      }
    }
  }
`);
export const REPORT_LIST = gql(`
  query AccountingTunableReports($searchValue: String, $page: Int, $perPage: Int) {
    accountingTunableReports(searchValue: $searchValue, page: $page, perPage: $perPage) {
      totalCount list { ...AccountingTunableReportFields }
    }
  }
`);
export const REPORT_DETAIL = gql(`
  query AccountingTunableReportDetail($_id: String!) {
    accountingTunableReportDetail(_id: $_id) { ...AccountingTunableReportFields }
  }
`);
export const REPORT_SAVE = gql(`
  mutation AccountingTunableReportSave($_id: String, $expectedVersion: Int, $input: AccountingTunableReportInput!) {
    accountingTunableReportSave(_id: $_id, expectedVersion: $expectedVersion, input: $input) { ...AccountingTunableReportFields }
  }
`);
export const REPORT_REMOVE = gql(`
  mutation AccountingTunableReportRemove($_id: String!, $expectedVersion: Int!) {
    accountingTunableReportRemove(_id: $_id, expectedVersion: $expectedVersion)
  }
`);

export const REPORT_GENERATE = gql(`
  query AccountingTunableReportGenerate($_id: String!, $fromDate: String!, $toDate: String!, $amountUnit: String, $decimals: Int) {
    accountingTunableReportGenerate(_id: $_id, fromDate: $fromDate, toDate: $toDate, amountUnit: $amountUnit, decimals: $decimals) {
      report { ...AccountingTunableReportFields }
      fromDate toDate amountUnit decimals
      cells { sectionId rowId columnId value }
    }
  }
`);

// Portable report JSON translates tenant ids and codes; only ids and codes are read.
export const REPORT_TRANSFER_ACCOUNTS = gql(`
  query AccountingTunableReportTransferAccounts($ids: [String], $perPage: Int) {
    accounts(ids: $ids, perPage: $perPage) { _id code }
  }
`);
export const REPORT_TRANSFER_CATEGORIES = gql(`
  query AccountingTunableReportTransferCategories {
    accountCategories { _id code }
  }
`);
export const REPORT_TRANSFER_REPORTS = gql(`
  query AccountingTunableReportTransferReports($perPage: Int) {
    accountingTunableReports(perPage: $perPage) { list { _id code } }
  }
`);
