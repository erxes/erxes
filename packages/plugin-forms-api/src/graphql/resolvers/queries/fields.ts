import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { fieldsCombinedByContentType } from '../../../utils';
import { serviceDiscovery } from '../../../configs';
import { fetchService } from '../../../messageBroker';
import { IContext } from '../../../connectionResolver';
interface IFieldsDefaultColmns {
  [index: number]: { name: string; label: string; order: number } | {};
}

export interface IFieldsQuery {
  contentType: string;
  contentTypeId?: string;
  isVisible?: boolean;
  isDefinedByErxes?: boolean;
  searchable?: boolean;
  isVisibleToCreate?: boolean;
  groupId?: any;
}

const fieldQueries = {
  async fieldsGetTypes() {
    const services = await serviceDiscovery.getServices();
    const fieldTypes: Array<{ description: string; contentType: string }> = [];

    for (const serviceName of services) {
      const service = await serviceDiscovery.getService(serviceName, true);
      const meta = service.config?.meta || {};

      if (meta && meta.forms) {
        const types = meta.forms.types || [];

        for (const type of types) {
          fieldTypes.push({
            description: type.description,
            contentType: `${serviceName}:${type.type}`
          });
        }
      }
    }

    return fieldTypes;
  },

  /**
   * Fields list
   */
  async fields(
    _root,
    {
      contentType,
      contentTypeId,
      isVisible,
      isVisibleToCreate,
      searchable,
      pipelineId
    }: {
      contentType: string;
      contentTypeId: string;
      isVisible: boolean;
      isVisibleToCreate: boolean;
      searchable: boolean;
      pipelineId: string;
    },
    { models }: IContext
  ) {
    const query: IFieldsQuery = { contentType };

    if (contentTypeId) {
      query.contentTypeId = contentTypeId;
    }

    if (isVisible) {
      query.isVisible = isVisible;
    }

    if (searchable !== undefined) {
      query.searchable = searchable;
    }

    if (isVisibleToCreate !== undefined) {
      query.isVisibleToCreate = isVisibleToCreate;
    }

    if (pipelineId) {
      const erxesDefinedGroup = await models.FieldsGroups.findOne({
        contentType,
        isDefinedByErxes: true
      });

      const otherGroupIds: string[] = await models.FieldsGroups.find({
        'config.boardsPipelines.pipelineIds': { $in: [pipelineId] }
      }).distinct('_id');

      if (erxesDefinedGroup) {
        otherGroupIds.push(erxesDefinedGroup._id);
      }

      if (otherGroupIds && otherGroupIds.length > 0) {
        query.groupId = { $in: otherGroupIds };
      }
    }

    return models.Fields.find(query).sort({ order: 1 });
  },

  /**
   * Generates all field choices base on given kind.
   */
  async fieldsCombinedByContentType(
    _root,
    args,
    { models, subdomain }: IContext
  ) {
    return fieldsCombinedByContentType(models, subdomain, args);
  },

  /**
   * Default list columns config
   */
  async fieldsDefaultColumnsConfig(
    _root,
    { contentType }: { contentType: string }
  ): Promise<IFieldsDefaultColmns> {
    const [serviceName, type] = contentType.split(':');
    const service = await serviceDiscovery.getService(serviceName, true);

    if (!service) {
      return [];
    }

    const meta = service.config?.meta || {};

    if (meta.forms && meta.forms.defaultColumnsConfig) {
      return meta.forms.defaultColumnsConfig[type] || [];
    }

    return [];
  }
};

requireLogin(fieldQueries, 'fieldsCombinedByContentType');
requireLogin(fieldQueries, 'fieldsDefaultColumnsConfig');

checkPermission(fieldQueries, 'fields', 'showForms', []);

const fieldsGroupQueries = {
  /**
   * Fields group list
   */
  async fieldsGroups(
    _root,
    {
      contentType,
      isDefinedByErxes,
      config
    }: {
      contentType: string;
      isDefinedByErxes: boolean;
      config;
    },
    { commonQuerySelector, models, subdomain }: IContext
  ) {
    let query: any = commonQuerySelector;

    // querying by content type
    query.contentType = contentType;

    if (config) {
      query = await fetchService(
        subdomain,
        contentType,
        'groupsFilter',
        { config, contentType },
        query
      );
    }

    if (isDefinedByErxes !== undefined) {
      query.isDefinedByErxes = isDefinedByErxes;
    }

    const groups = await models.FieldsGroups.find(query);

    return groups
      .map(group => {
        if (group.isDefinedByErxes) {
          group.order = -1;
        }
        return group;
      })
      .sort((a, b) => {
        if (a.order && b.order) {
          return a.order - b.order;
        }
        return -1;
      });
  },

  getSystemFieldsGroup(
    _root,
    { contentType }: { contentType: string },
    { models }: IContext
  ) {
    const query: any = {};

    // querying by content type
    query.contentType = contentType;
    query.isDefinedByErxes = true;

    return models.FieldsGroups.findOne(query);
  }
};

checkPermission(fieldsGroupQueries, 'fieldsGroups', 'showForms', []);

export { fieldQueries, fieldsGroupQueries };
