import {
  cursorPaginate,
  getPlugin,
  getPlugins,
  sendTRPCMessage,
} from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { documents } from '~/meta/documents';
import {
  DOCUMENT_APPROVAL_CONTENT_TYPE,
  DocumentProcessInput,
  IDocumentDocument,
  IDocumentFilterQueryParams,
} from '../types';

const generateFilter = (params: IDocumentFilterQueryParams) => {
  const { searchValue, contentType, subType, userIds, dateFilters, tagIds } =
    params;

  const filter: FilterQuery<IDocumentDocument> = {};

  if (tagIds?.length) {
    filter.tagIds = { $in: tagIds };
  }

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
        if (key !== 'createdAt') {
          throw new Error('Only createdAt can be used in dateFilters');
        }
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
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('documentsRead');
    const filter = generateFilter(params);
    // Cursor values are returned to the client, so never sort by template data.
    const sortFields = new Set([
      '_id',
      'name',
      'createdAt',
      'createdUserId',
      'contentType',
      'subType',
      'code',
    ]);
    if (
      Object.keys(params.orderBy || {}).some((field) => !sortFields.has(field))
    ) {
      throw new Error('Unsupported document sort field');
    }

    const { list, pageInfo, totalCount } =
      await cursorPaginate<IDocumentDocument>({
        model: models.Documents,
        params,
        query: filter,
      });

    const states = await models.ApprovalLocks.getStates({
      user,
      contentType: DOCUMENT_APPROVAL_CONTENT_TYPE,
      contentIds: list.map((document) => document._id),
      ownerIdsByContentId: Object.fromEntries(
        list.map((document) => [document._id, document.createdUserId]),
      ),
      action: 'view',
    });
    const statesById = new Map(states.map((state) => [state.contentId, state]));

    return {
      list: list.map((document) => {
        const approvalLockState = statesById.get(document._id);
        return {
          ...document,
          // Keep locked records discoverable without exposing their templates.
          content: approvalLockState?.hasAccess ? document.content : null,
          replacer: approvalLockState?.hasAccess ? document.replacer : null,
          approvalLockState,
        };
      }),
      pageInfo,
      totalCount,
    };
  },

  documentsDetail: async (
    _parent: undefined,
    { _id }: { _id: string },
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('documentsRead');
    return await models.Documents.getDocument({ _id, user });
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
      if (meta?.documents) {
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
    const [pluginName, moduleName] = contentType.split(':');

    if (pluginName === 'core') {
      const { editorAttributes } = documents;

      if (moduleName === 'broadcast') {
        contentType = 'core:contacts.customers';
      }

      if (editorAttributes) {
        return await editorAttributes(models, subdomain, contentType);
      }
    }

    return await sendTRPCMessage({
      subdomain,
      pluginName,
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
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('documentsRead');
    const filter = generateFilter(params);

    return models.Documents.find(filter).countDocuments();
  },

  documentsProcess: async (
    _parent: undefined,
    { _id, replacerIds, config }: Omit<DocumentProcessInput, 'user'>,
    { models, user, checkPermission }: IContext,
  ) => {
    await checkPermission('documentsRead');
    return models.Documents.processDocument({
      _id,
      replacerIds,
      config,
      user,
    });
  },
};
