import { IContext } from '~/connectionResolvers';
import {
  getTaxReportRecords,
  ITaxReportParams,
} from '~/modules/accounting/utils/taxReports';

export const taxReportQueries = {
  async taxReportData(
    _root,
    params: ITaxReportParams,
    { models, user, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('accountsRead');

    return getTaxReportRecords(subdomain, models, params, user);
  },
};
