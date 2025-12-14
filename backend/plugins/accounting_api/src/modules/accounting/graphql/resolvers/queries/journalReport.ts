import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';
import { generateFilter, getRecords } from '~/modules/accounting/utils/journalReports';

export interface IReportFilterParams {
  status?: string;
  searchValue?: string;
  number?: string;
  ptrStatus?: string;

  accountId?: string;
  accountIds?: string[];
  accountKind?: string;
  accountExcludeIds?: boolean;
  accountStatus?: string;
  accountCategoryId?: string;
  accountSearchValue?: string;
  accountBrand?: string;
  accountIsTemp?: boolean,
  accountIsOutBalance?: boolean,
  accountBranchId: string;
  accountDepartmentId: string;
  accountCurrency: string;
  accountJournal: string;

  brandId?: string;
  isOutBalance?: boolean,
  branchId?: string;
  departmentId?: string;
  currency?: string;
  journal?: string;
  journals?: string[];
  statuses?: string[];

  createdUserId?: string;
  modifiedUserId?: string;
  fromDate?: Date;
  toDate?: Date;
}

interface IReportParams extends IReportFilterParams {
  report: string;
  groupRule: any;
}

const journalReportQueries = {
  async journalReportData(
    _root,
    params: IReportParams & ICursorPaginateParams,
    { models, user, subdomain }: IContext,
  ) {
    const { groupRule, report, ...filters } = params;
    const records = await getRecords(subdomain, models, report, filters, user);
    return { records }
  },

  async journalReportMore(
    _root,
    params: IReportParams & ICursorPaginateParams,
    { models, user, subdomain }: IContext,
  ) {
    const { groupRule, report, ...filters } = params;
    const match = await generateFilter(subdomain, models, filters, user);

    const trDetails = await models.Transactions.aggregate([
      { $match: match },
      { $unwind: { path: '$details', includeArrayIndex: 'detailInd' } },
      { $match: match },
    ]);
    return { trDetails }
  },
};

export default journalReportQueries;
