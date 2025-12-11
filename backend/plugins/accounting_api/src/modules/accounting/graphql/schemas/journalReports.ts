import { GQL_CURSOR_PARAM_DEFS } from "erxes-api-shared/utils";

export const types = `
  type AccDD {
    _id: String

    status: String
    ptrStatus: String

    createdAt: Date
    updatedAt: Date

    originId: String
    originSubId: String

    details: [AccTrDetail]
    shortDetail: AccTrDetail
    sumDt: Float
    sumCt: Float
    createdBy: String
    modifiedBy: String

    permission: String

    ptrInfo: JSON
  }


  type AccJournalReportResponse {
    records: [JSON],
  }
`;

const trsQueryParams = `
  status: String,
  searchValue: String,
  number: String,
  ptrStatus: String,

  accountId: String,
  accountIds: [String],
  accountKind: String,
  accountExcludeIds: Boolean,
  accountStatus: String,
  accountCategoryId: String,
  accountIsTemp: Boolean,
  accountIsOutBalance: Boolean,
  accountBranchId: String,
  accountDepartmentId: String,
  accountCurrency: String,
  accountJournal: String,

  brandId: String,
  isTemp: Boolean,
  isOutBalance: Boolean,
  branchId: String,
  departmentId: String,
  currency: String,
  journal: String,
  journals: [String],
  statuses: [String],

  createdUserId: String
  modifiedUserId: String  
  
  fromDate: Date
  toDate: Date

  report: String!
  groupRule: JSON
`;

export const queries = `
  journalReportData(
    ${trsQueryParams},
    ${GQL_CURSOR_PARAM_DEFS}
  ): AccJournalReportResponse
`;
