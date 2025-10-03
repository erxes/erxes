import { checkPermission } from 'erxes-api-shared/core-modules';
import {
  cursorPaginate,
  getPlugin,
  getPlugins,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { documents } from '~/meta/documents';
import { IDocumentDocument, IDocumentFilterQueryParams } from '../types';

const generateFilter = (params: IDocumentFilterQueryParams) => {
  const { searchValue, contentType, subType, userIds, dateFilters } = params;

  const filter: any = {};

  if (contentType) {
    filter.contentType = contentType;
  }

  if (subType) {
    filter.$or = [
      { subType },
      { subType: { $exists: false } },
      { subType: { $in: ['', null, undefined] } },
    ];
  }

  if (searchValue) {
    filter.name = new RegExp(`.*${searchValue}.*`, 'i');
  }

  if (userIds?.length) {
    filter.createdUserId = { $in: userIds };
  }

  if (dateFilters) {
    try {
      const dateFilter = JSON.parse(dateFilters || '{}');

      for (const [key, value] of Object.entries(dateFilter)) {
        const { gte, lte } = (value || {}) as { gte?: string; lte?: string };

        if (gte || lte) {
          filter[key] = {};

          if (gte) {
            filter[key]['$gte'] = gte;
          }

          if (lte) {
            filter[key]['$lte'] = lte;
          }
        }
      }
    } catch (error) {
      throw new Error(`Invalid dateFilters: ${error.message}`);
    }
  }

  return filter;
};

export const documentQueries = {
  documents: async (
    _parent: undefined,
    params: IDocumentFilterQueryParams,
    { models }: IContext,
  ) => {
    const filter = generateFilter(params);

    const { list, pageInfo, totalCount } =
      await cursorPaginate<IDocumentDocument>({
        model: models.Documents,
        params,
        query: filter,
      });

    return { list, pageInfo, totalCount };
  },

  documentsDetail: async (
    _parent: undefined,
    { _id },
    { models }: IContext,
  ) => {
    return models.Documents.findOne({ _id });
  },

  documentsTypes: async () => {
    const services = await getPlugins();

    const fieldTypes: Array<{
      label: string;
      contentType: string;
      subTypes?: string[];
    }> = [];

    for (const serviceName of services) {
      const service = await getPlugin(serviceName);
      const meta = service.config.meta || {};
      if (meta && meta.documents) {
        const types = meta.documents.types || [];

        for (const type of types) {
          fieldTypes.push({
            label: type.label,
            contentType: type.contentType,
            subTypes: type.subTypes,
          });
        }
      }
    }

    return fieldTypes;
  },

  documentsGetEditorAttributes: async (
    _parent: undefined,
    { contentType }: { contentType: string },
    { models, subdomain }: IContext,
  ) => {
    const [serviceName] = contentType.split(':');

    const { editorAttributes } = documents;

    if (editorAttributes) {
      return await editorAttributes(models, subdomain, contentType);
    }

    return await sendTRPCMessage({
      pluginName: serviceName,
      method: 'query',
      module: 'documents',
      action: 'editorAttributes',
      input: {
        contentType,
      },
      defaultValue: [],
    });
  },

  documentsTotalCount: async (
    _parent: undefined,
    params: IDocumentFilterQueryParams,
    { models }: IContext,
  ) => {
    const filter = generateFilter(params);

    return models.Documents.find(filter).countDocuments();
  },

  documentsProcess: async (
    _parent: undefined,
    {
      _id,
      replacerIds,
      config,
    }: { _id: string; replacerIds: string[]; config },
    { models }: IContext,
  ) => {
    return models.Documents.processDocument({
      _id,
      replacerIds,
      config,
    });
  },
};

checkPermission(documentQueries, 'documents', 'showDocuments');
