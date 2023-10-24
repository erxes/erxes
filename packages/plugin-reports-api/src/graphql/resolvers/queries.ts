import { serviceDiscovery } from '../../configs';
import { IContext } from '../../connectionResolver';
import { sendCommonMessage } from '../../messageBroker';

const reportsQueries = {
  reportsList(_root, {}, { models }: IContext) {
    const selector: any = {};
    const totalCount = models.Reports.count(selector);

    const list = models.Reports.find(selector).sort({
      createdAt: 1,
      name: 1
    });

    return { list, totalCount };
  },

  reportDetail(_root, { _id }, { models }: IContext) {
    return models.Reports.getReport(_id);
  },

  chartsList(_root, {}, { models }: IContext) {
    const selector: any = {};
    const totalCount = models.Charts.count(selector);
    const list = models.Charts.find(selector).sort({ name: 1 });
    return { list, totalCount };
  },

  chartDetail(_root, { _id }, { models }: IContext) {
    return models.Charts.getChart(_id);
  },

  reportChartGetTemplates(_root, { serviceType }, { models }: IContext) {
    const service = serviceDiscovery.getService(serviceType);

    const reportConfig = service.configs.meta.report || {};

    let templates = [];

    if (reportConfig) {
      templates = reportConfig.templates || [];
    }

    return templates;
  },

  async reportChartGetResult(
    _root,
    { serviceType, templateType, filter },
    { subdomain }: IContext
  ) {
    const serviceName = serviceType.split(':')[0];
    const reportResult = await sendCommonMessage({
      subdomain,
      serviceName,
      action: 'reports.getChartResult',
      data: {
        actionType: 'create',
        filter,
        templateType
      },
      isRPC: true
    });

    return reportResult;
  }
};

export default reportsQueries;
