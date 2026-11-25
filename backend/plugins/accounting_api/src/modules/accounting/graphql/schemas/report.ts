const period = `getDate: String isPre: Boolean`;
const ordered = `_id: String! code: String name: String order: Int isActive: Boolean`;
const reference = `reportId: String sectionId: String rowId: String! columnId: String`;
const formula = `_id: String! rowId: String! columnId: String kind: String! plusOrMinus: Boolean percent: String debitAccountId: String creditAccountId: String debitAccountCategoryId: String creditAccountCategoryId: String ${period} valueSide: String ratioRule: String`;
const row = `${ordered} ${period} number: String kind: String valueSide: String isBold: Boolean isItalic: Boolean isUnderline: Boolean tabCount: Int`;
const report = `code: String! name: String! description: String header: String footer: String orientation: String status: String`;
export const types = `
  type AccountingReportReference { ${reference} }
  input AccountingReportReferenceInput { ${reference} }
  type AccountingReportColumn { ${ordered} ${period} }
  input AccountingReportColumnInput { ${ordered} ${period} }
  type AccountingReportRow { ${row} }
  input AccountingReportRowInput { ${row} }
  type AccountingReportFormula { ${formula} source: AccountingReportReference ratioSource: AccountingReportReference }
  input AccountingReportFormulaInput { ${formula} source: AccountingReportReferenceInput ratioSource: AccountingReportReferenceInput }
  type AccountingReportSection {
    ${ordered} header: String footer: String formulaType: String
    columns: [AccountingReportColumn!]! rows: [AccountingReportRow!]! formulas: [AccountingReportFormula!]!
  }
  input AccountingReportSectionInput {
    ${ordered} header: String footer: String formulaType: String
    columns: [AccountingReportColumnInput!]! rows: [AccountingReportRowInput!]! formulas: [AccountingReportFormulaInput!]!
  }
  type AccountingTunableReport {
    _id: String! ${report} version: Int! sections: [AccountingReportSection!]!
    createdAt: Date modifiedAt: Date
  }
  input AccountingTunableReportInput { ${report} sections: [AccountingReportSectionInput!]! }
  type AccountingTunableReportGeneratedCell {
    sectionId: String! rowId: String! columnId: String! value: Float
  }
  type AccountingTunableReportGenerated {
    report: AccountingTunableReport!
    fromDate: String! toDate: String! amountUnit: String! decimals: Int!
    cells: [AccountingTunableReportGeneratedCell!]!
  }
  type AccountingTunableReportList { list: [AccountingTunableReport!]! totalCount: Int! }
`;
export const queries = `
  accountingTunableReports(searchValue: String, page: Int, perPage: Int): AccountingTunableReportList!
  accountingTunableReportDetail(_id: String!): AccountingTunableReport!
  accountingTunableReportGenerate(_id: String!, fromDate: String!, toDate: String!, amountUnit: String, decimals: Int, branchId: String, departmentId: String): AccountingTunableReportGenerated!
`;
export const mutations = `
  accountingTunableReportSave(_id: String, expectedVersion: Int, input: AccountingTunableReportInput!): AccountingTunableReport!
  accountingTunableReportRemove(_id: String!, expectedVersion: Int!): Boolean!
`;
