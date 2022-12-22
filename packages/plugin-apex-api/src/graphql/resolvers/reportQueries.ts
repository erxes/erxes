import { moduleCheckPermission } from '@erxes/api-utils/src/permissions';
import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../connectionResolver';

const reportQueries = {
  apexReports(_root, { type, companyId, limit }, { models }: IContext) {
    const sort = { date: -1 };

    const selector: any = {};

    if (limit) {
      return models.Reports.find(selector)
        .sort(sort)
        .limit(limit);
    }

    if (type) {
      selector.type = type;
    }

    if (companyId) {
      selector.companyId = companyId;
    }

    return paginate(models.Reports.find(selector), {}).sort(sort);
  },

  apexReportDetail(_root, { _id, code }, { models }: IContext) {
    return models.Reports.findOne(_id ? { _id } : { code });
  }
};

moduleCheckPermission(reportQueries, 'manageApexReports');

export default reportQueries;
