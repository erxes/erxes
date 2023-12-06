import { IUserDocument } from '@erxes/api-utils/src/types';
import { serviceDiscovery } from '../../configs';
import { IContext } from '../../connectionResolver';
import {
  sendCommonMessage,
  sendCoreMessage,
  sendTagsMessage
} from '../../messageBroker';

interface IListParams {
  searchValue: string;
  ids?: string;
  page?: number;
  perPage?: number;
  sortField: string;
  sortDirection: number;
  tag: string;
  departmentId: string;
}

const generateFilter = async (
  params: IListParams,
  user: IUserDocument,
  subdomain: string
) => {
  const { searchValue, tag, departmentId } = params;

  let filter: any = {};

  if (!user.isOwner) {
    const departments = await sendCoreMessage({
      subdomain,
      action: 'departments.find',
      data: {
        userIds: { $in: [user._id] }
      },
      isRPC: true,
      defaultValue: []
    });

    const departmentIds = departments.map(d => d._id);

    filter = {
      $or: [
        { visibility: { $exists: null } },
        { visibility: 'public' },
        {
          $and: [
            { visibility: 'private' },
            {
              $or: [
                { selectedMemberIds: user._id },
                { createdBy: user._id },
                { departmentIds: { $in: departmentIds } }
              ]
            }
          ]
        }
      ]
    };
  }

  if (searchValue) {
    filter.name = new RegExp(`.*${searchValue}.*`, 'i');
  }
  if (tag) {
    filter.tagIds = { $in: [tag] };
  }
  if (departmentId) {
    filter.departmentIds = { $in: [departmentId] };
  }

  return filter;
};

const reportsQueries = {
  async reportsList(_root, params, { models, subdomain, user }: IContext) {
    const totalCount = models.Reports.count({});

    const filter = await generateFilter(params, user, subdomain);

    const list = models.Reports.find(filter).sort({
      createdAt: 1,
      name: 1
    });

    return { list, totalCount };
  },

  reportDetail(_root, { reportId }, { models }: IContext) {
    return models.Reports.getReport(reportId);
  },

  // return service names list that exports reports
  async reportServicesList(_root, _params, { models }: IContext) {
    const serviceNames = await serviceDiscovery.getServices();
    const totalServicesNamesList: string[] = [];

    for (const serviceName of serviceNames) {
      const service = await serviceDiscovery.getService(serviceName, true);
      const chartTemplates = service.config?.meta?.reports?.chartTemplates;

      if (chartTemplates && chartTemplates.length) {
        totalServicesNamesList.push(serviceName);
      }
    }

    return totalServicesNamesList;
  },

  // return total templates list from available services
  async reportTemplatesList(
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
      const service = await serviceDiscovery.getService(serviceName, true);
      const reportTemplates = service.config?.meta?.reports?.reportTemplates;

      if (reportTemplates) {
        totalTemplatesList.push(
          ...filterBySearchValue(reportTemplates, searchValue || '')
        );
      }

      return totalTemplatesList;
    }

    const serviceNames = await serviceDiscovery.getServices();

    for (const srviceName of serviceNames) {
      const service = await serviceDiscovery.getService(srviceName, true);
      const reportTemplates = service.config?.meta?.reports?.reportTemplates;

      if (reportTemplates) {
        totalTemplatesList.push(
          ...filterBySearchValue(reportTemplates, searchValue || '')
        );
      }
    }

    return totalTemplatesList;
  },

  async reportChartTemplatesList(
    _root,
    { serviceName }: { serviceName: string },
    {}: IContext
  ) {
    const service = await serviceDiscovery.getService(serviceName, true);
    const chartTemplates = service.config?.meta?.reports?.chartTemplates;
    return chartTemplates;
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
  },
  async reportsCountByTags(_root, _params, { models, subdomain }: IContext) {
    const counts = {};

    const tags = await sendTagsMessage({
      subdomain,
      action: 'find',
      data: {
        type: 'reports:reports'
      },
      isRPC: true,
      defaultValue: []
    });

    for (const tag of tags) {
      counts[tag._id] = await models.Reports.find({
        tagIds: tag._id,
        status: { $ne: 'deleted' }
      }).countDocuments();
    }

    return counts;
  }
};

export default reportsQueries;
