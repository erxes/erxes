import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../connectionResolver';
import { sendCommonMessage } from '../../messageBroker';
import { calculateDynamicValue } from '../../utils';

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

  async apexReportDetail(_root, { _id, code }, { models }: IContext) {
    const report = await models.Reports.findOne(_id ? { _id } : { code });

    if (!report) {
      throw new Error('Not found');
    }

    calculateDynamicValue(models, report);

    return report;
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

  apexCompanies(_root, { search }) {
    const selector: any = {
      tagIds: { $in: [process.env.PUBLIC_COMPANIES_TAG || ''] }
    };

    if (search) {
      selector.$or = [{ primaryName: { $regex: '.*' + search + '.*' } }];
    }

    return sendCommonMessage({
      subdomain: 'os',
      serviceName: 'contacts',
      action: 'companies.findActiveCompanies',
      isRPC: true,
      data: { selector }
    });
  },

  apexStories(_root, { companyId, limit }, { models }: IContext) {
    const sort = { createdAt: -1 };

    const selector: any = {};

    if (limit) {
      return models.Stories.find(selector)
        .sort(sort)
        .limit(limit);
    }

    if (companyId) {
      selector.companyId = companyId;
    }

    return paginate(models.Stories.find(selector), {}).sort(sort);
  },

  async apexStoryDetail(_root, { _id, code }, { models }: IContext) {
    const story = await models.Stories.findOne(_id ? { _id } : { code });

    if (!story) {
      throw new Error('Not found');
    }

    return story;
  },

  async apexStoryIsReadByUser(_root, { _id }, { models, cpUser }) {
    const story = await models.Stories.findOne({ _id });

    if (!story) {
      throw true;
    }

    return (story.readUserIds || []).includes(cpUser.userId);
  }
};

export default reportQueries;
