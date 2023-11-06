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

  // return total templates list from available services
  async reportTemplatesList(_root, { searchValue }, { models }: IContext) {
    const serviceNames = await serviceDiscovery.getServices();
    const totalTemplatesList: any = [];
    for (const serviceName of serviceNames) {
      const service = await serviceDiscovery.getService(serviceName, true);
      const reportTemplates = service.config?.meta?.reports?.reportTemplates;

      if (reportTemplates) {
        totalTemplatesList.push(
          ...reportTemplates.filter(t =>
            t.name.toLowerCase().includes(searchValue.toLowerCase())
          )
        );
      }
    }

    return totalTemplatesList;
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

  reportChartGetFilterTypes(
    _root,
    { serviceName, templateType },
    { models }: IContext
  ) {
    const service = serviceDiscovery.getService(serviceName);

    const templates = service.configs.meta.reports.templates || {};

    let filterTypes = [];

    if (templates) {
      const template = templates.find(t => t.templateType === templateType);
      if (template) {
        filterTypes = template.filterTypes || [];
      }
    }

    return filterTypes;
  },

  async reportChartGetTemplates(_root, { serviceName }, { models }: IContext) {
    const service = await serviceDiscovery.getService(serviceName, true);

    const reportConfig = service.config.meta.reports || {};

    let templates = [];

    if (reportConfig) {
      templates = reportConfig.templates || [];
    }

    return templates;
  },

  async reportChartGetResult(
    _root,
    { serviceName, templateType, filter },
    { subdomain, user }: IContext
  ) {
    const reportResult = await sendCommonMessage({
      subdomain,
      serviceName,
      action: 'reports.getChartResult',
      data: {
        filter,
        templateType,
        currentUser: user
      },
      isRPC: true
    });

    return reportResult;
  }
};

export default reportsQueries;
