import { IContext } from "../../../connectionResolver";
import { sendCommonMessage } from "../../../messageBroker";
import { getService, getServices } from "@erxes/api-utils/src/serviceDiscovery";

const insightQueries = {
  /**
   * Get last dashboard
   */
  async insightGetLast(_root, params, { models }: IContext) {
    const dashboard = await models.Dashboards.findOne({}).sort({
      createdAt: -1
    });

    if (dashboard) {
      return { _id: dashboard._id, type: "dashboard" };
    }

    const report = await models.Reports.findOne({}).sort({
      createdAt: -1
    });

    if (report) {
      return { _id: report._id, type: "report" };
    }
  },

  // return service names list that exports reports
  async insightServicesList(_root, _params, { models }: IContext) {
    const serviceNames = await getServices();
    const totalServicesNamesList: string[] = [];

    for (const serviceName of serviceNames) {
      const service = await getService(serviceName);
      const reportTemplates = service.config?.meta?.reports?.reportTemplates

      if (reportTemplates) {
        for (const reportTemplate of reportTemplates) {
          totalServicesNamesList.push(reportTemplate['serviceLabel']);
        }
      }
    }

    return totalServicesNamesList;
  },

  // return total templates list from available services
  async insightTemplatesList(
    _root,
    { searchValue, serviceName },
    { models }: IContext
  ) {
    const totalTemplatesList: any = [];

    const filterBySearchValue = (reportTemplates: any[], searchVal: string) => {
      return reportTemplates.filter(t =>
        t.title.toLowerCase().includes(searchVal.toLowerCase())
      );
    };

    if (serviceName) {
      const service = await getService(serviceName);
      const reportTemplates = service.config?.meta?.reports?.reportTemplates;

      if (reportTemplates) {
        totalTemplatesList.push(
          ...filterBySearchValue(reportTemplates, searchValue || "")
        );
      }

      return totalTemplatesList;
    }

    const serviceNames = await getServices();

    for (const srviceName of serviceNames) {
      const service = await getService(srviceName);
      const reportTemplates = service.config?.meta?.reports?.reportTemplates;

      if (reportTemplates) {
        totalTemplatesList.push(
          ...filterBySearchValue(reportTemplates, searchValue || "")
        );
      }
    }

    return totalTemplatesList;
  },

  async insightChartTemplatesList(
    _root,
    { serviceName: currentService }: { serviceName: string },
    {}: IContext
  ) {

    const [serviceName, contentType] = currentService.split(':');

    const service = await getService(serviceName);

    const chartTemplates = service.config?.meta?.reports?.chartTemplates;

    if (contentType) {
      return chartTemplates.filter(t => t.serviceType === contentType);
    }

    return chartTemplates;
  },

  async insightChartGetFilterTypes(
    _root,
    { serviceName, templateType },
    { models }: IContext
  ) {
    const service = await getService(serviceName);

    const templates = service.config?.meta?.reports?.templates || {};

    let filterTypes = [];

    if (templates) {
      const template = templates.find(t => t.templateType === templateType);
      if (template) {
        filterTypes = template.filterTypes || [];
      }
    }

    return filterTypes;
  },

  async insightChartGetTemplates(_root, { serviceName }, { models }: IContext) {
    const service = await getService(serviceName);

    const reportConfig = service.config.meta.reports || {};

    let templates = [];

    if (reportConfig) {
      templates = reportConfig.templates || [];
    }

    return templates;
  },

  async chartGetResult(
    _root,
    { serviceName: currentService, templateType, chartType, filter, dimension },
    { subdomain, user }: IContext
  ) {

    const [serviceName] = currentService.split(':');

    const chartResult = await sendCommonMessage({
      subdomain,
      serviceName,
      action: "reports.getChartResult",
      data: {
        filter,
        dimension,
        templateType,
        chartType,
        currentUser: user
      },
      isRPC: true
    });

    return chartResult;
  },

  async insightPinnedList(_root, { }, { models, user }: IContext) {
    const dashboards = await models.Dashboards.find({ userIds: { $in: [user._id] } }) || [];
    const reports = await models.Reports.find({ userIds: { $in: [user._id] } }) || [];

    const dashboardsWithType = dashboards.map(dashboard => ({
      ...dashboard.toObject(),
      type: 'dashboard'
    }));

    const reportsWithType = reports.map(report => ({
      ...report.toObject(),
      type: 'report'
    }));

    return [...dashboardsWithType, ...reportsWithType];
  },
};

export default insightQueries;
