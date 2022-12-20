import { moduleCheckPermission } from '@erxes/api-utils/src/permissions';
import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../connectionResolver';

const reportQueries = {
  apexReports(_root, { limit }: { limit: number }, { models }: IContext) {
    const sort = { date: -1 };

    const selector: any = {};

    if (limit) {
      return models.Reports.find(selector)
        .sort(sort)
        .limit(limit);
    }

    return paginate(models.Reports.find(selector), {}).sort(sort);
  },

  apexReportDetail(_root, { _id }, { models }: IContext) {
    return models.Reports.findOne({ _id });
  }
};

moduleCheckPermission(reportQueries, 'manageApexReports');

export default reportQueries;
