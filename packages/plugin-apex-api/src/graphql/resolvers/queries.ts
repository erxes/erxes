import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../connectionResolver';
import { sendCommonMessage } from '../../messageBroker';

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
  },

  apexCompanyDetail(_root, { companyId }, { models }: IContext) {
    return sendCommonMessage({
      subdomain: 'os',
      serviceName: 'contacts',
      action: 'companies.findOne',
      isRPC: true,
      data: {
        _id: companyId
      }
    });
  },

  apexCompanies(_root) {
    return sendCommonMessage({
      subdomain: 'os',
      serviceName: 'contacts',
      action: 'companies.findActiveCompanies',
      isRPC: true,
      data: {
        selector: {
          tagIds: { $in: [process.env.PUBLIC_COMPANIES_TAG || ''] }
        }
      }
    });
  }
};

export default reportQueries;
