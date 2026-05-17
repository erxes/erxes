import {
  AUTOMATION_STATUSES,
  AutomationConstants,
  IAutomationDocument,
  IAutomationExecutionDocument,
  normalizeAutomationConstantsForTransport,
} from 'erxes-api-shared/core-modules';
import {
  IAutomationEmailTemplateDocument,
  ICursorPaginateParams,
} from 'erxes-api-shared/core-types';
import {
  cursorPaginate,
  getEnv,
  getPlugin,
  getPlugins,
  sendWorkerMessage,
} from 'erxes-api-shared/utils';
import { SortOrder } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import {
  fieldsCombinedByContentType,
  getCustomFields,
} from '~/modules/forms/utils';
import { coreAutomationConstants } from '~/meta/automations/constants';
import { sanitizeAiAgent, sanitizeAiAgents } from './utils/aiAgent';

export interface IListArgs extends ICursorPaginateParams {
  status: string;
  searchValue: string;
  ids?: string;
  page?: number;
  perPage?: number;
  sortField: string;
  sortDirection: number;
  tagIds: string[];
  excludeIds: string[];
  triggerTypes: string[];
  createdByIds: string[];
  updatedByIds: string[];
  createdAtFrom: Date;
  createdAtTo: Date;
  updatedAtFrom: Date;
  updatedAtTo: Date;
  actionTypes: string[];
}

export interface IHistoriesParams {
  automationId: string;
  page?: number;
  perPage?: number;
  status?: string;
  triggerId?: string;
  triggerType?: string;
  beginDate?: Date;
  endDate?: Date;
}

const generateFilter = (params: IListArgs) => {
  const {
    status,
    searchValue,
    tagIds,
    triggerTypes,
    ids,
    excludeIds = [],
    createdByIds,
    updatedByIds,
    actionTypes,
    createdAtFrom,
    createdAtTo,
    updatedAtFrom,
    updatedAtTo,
  } = params;

  const filter: any = {
    status: { $nin: [AUTOMATION_STATUSES.ARCHIVED, 'template'] },
  };

  if (status) {
    filter.status = status;
  }

  if (searchValue) {
    filter.name = new RegExp(`.*${searchValue}.*`, 'i');
  }

  if (tagIds) {
    filter.tagIds = { $in: tagIds };
  }

  if (triggerTypes?.length) {
    filter['triggers.type'] = { $in: triggerTypes };
  }

  if (actionTypes?.length) {
    filter['actions.type'] = { $in: actionTypes };
  }

  if (ids?.length) {
    filter._id = { $in: ids };
  }
  if (excludeIds.length) {
    filter._id = { $nin: excludeIds };
  }
  if (createdByIds?.length) {
    filter.createdBy = { $in: createdByIds };
  }
  if (updatedByIds?.length) {
    filter.updatedBy = { $in: updatedByIds };
  }
  if (createdAtFrom) {
    filter.createdAt = { $gte: createdAtFrom };
  }
  if (createdAtTo) {
    filter.createdAt = { ...(filter.createdAt || {}), $lte: createdAtTo };
  }
  if (updatedAtFrom) {
    filter.updatedAt = { $gte: updatedAtFrom };
  }
  if (updatedAtTo) {
    filter.updatedAt = { ...(filter.updatedAt || {}), $lte: updatedAtTo };
  }

  return filter;
};

const generateHistoriesFilter = (params: any) => {
  const {
    automationId,
    triggerType,
    triggerId,
    status,
    beginDate,
    endDate,
    targetId,
    targetIds,
  } = params;
  const filter: any = { automationId };

  if (status) {
    filter.status = status;
  }

  if (triggerId) {
    filter.triggerId = triggerId;
  }

  if (triggerType) {
    filter.triggerType = triggerType;
  }

  if (beginDate) {
    filter.createdAt = { $gte: beginDate };
  }

  if (endDate) {
    filter.createdAt = { $lte: endDate };
  }

  if (targetId) {
    filter.targetId = targetId;
  }

  if (targetIds?.length) {
    filter.targetId = { $in: targetIds };
  }

  return filter;
};

type TAutomationConstantsResponse = {
  triggersConst: any[];
  triggerTypesConst: string[];
  actionsConst: any[];
  findObjectTargetsConst: any[];
};

const normalizeAutomationReferenceType = (type: string) => {
  const [pluginName, contentType = ''] = (type || '').split(':');
  const [moduleName, collectionName] = contentType.split('.');

  if (!pluginName || !moduleName || !collectionName) {
    return type;
  }

  return `${pluginName}:${moduleName}.${collectionName}`;
};

const REFERENCE_FIELD_TYPE_MAP: Record<string, Record<string, string>> = {
  'core:user': {
    _id: 'core:user',
    groupIds: 'core:usersGroup',
    brandIds: 'core:brand',
    branchIds: 'core:branch',
    departmentIds: 'core:department',
    positionIds: 'core:position',
    permissionGroupIds: 'core:permissionGroup',
  },
  'core:customer': {
    _id: 'core:customer',
    ownerId: 'core:user',
    tagIds: 'core:tag',
    integrationId: 'core:integration',
    relatedIntegrationIds: 'core:integration',
    mergedIds: 'core:customer',
  },
  'core:company': {
    _id: 'core:company',
    ownerId: 'core:user',
    parentCompanyId: 'core:company',
    tagIds: 'core:tag',
    mergedIds: 'core:company',
  },
  'sales:sales.deal': {
    _id: 'sales:sales.deal',
    userId: 'core:user',
    assignedUserIds: 'core:user',
    watchedUserIds: 'core:user',
    customers: 'core:customer',
    companies: 'core:company',
    products: 'core:product',
    productIds: 'core:product',
    'productsData.productId': 'core:product',
    stageId: 'sales:sales.stage',
    initialStageId: 'sales:sales.stage',
    tagIds: 'core:tag',
    branchIds: 'core:branch',
    departmentIds: 'core:department',
    labelIds: 'sales:sales.pipelineLabel',
  },
};

const REFERENCE_BASE_FIELDS: Record<
  string,
  { key: string; label: string; exposure?: 'placeholder' | 'reference' }[]
> = {
  'core:user': [
    { key: '_id', label: 'User ID', exposure: 'reference' },
    { key: 'email', label: 'Email' },
    { key: 'username', label: 'Username' },
    { key: 'details.fullName', label: 'Full name' },
    { key: 'details.shortName', label: 'Short name' },
    { key: 'details.firstName', label: 'First name' },
    { key: 'details.lastName', label: 'Last name' },
  ],
  'core:customer': [
    { key: '_id', label: 'Customer ID', exposure: 'reference' },
    { key: 'primaryEmail', label: 'Primary email' },
    { key: 'emails', label: 'Emails' },
    { key: 'primaryPhone', label: 'Primary phone' },
    { key: 'phones', label: 'Phones' },
    { key: 'firstName', label: 'First name' },
    { key: 'lastName', label: 'Last name' },
    { key: 'middleName', label: 'Middle name' },
    { key: 'status', label: 'Status' },
    { key: 'state', label: 'State' },
    { key: 'createdAt', label: 'Created at' },
    { key: 'updatedAt', label: 'Updated at' },
  ],
  'core:company': [
    { key: '_id', label: 'Company ID', exposure: 'reference' },
    { key: 'primaryName', label: 'Name' },
    { key: 'names', label: 'Names' },
    { key: 'primaryEmail', label: 'Primary email' },
    { key: 'emails', label: 'Emails' },
    { key: 'primaryPhone', label: 'Primary phone' },
    { key: 'phones', label: 'Phones' },
    { key: 'industry', label: 'Industry' },
    { key: 'website', label: 'Website' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Created at' },
    { key: 'updatedAt', label: 'Updated at' },
  ],
  'core:product': [
    { key: '_id', label: 'Product ID', exposure: 'reference' },
    { key: 'name', label: 'Name' },
    { key: 'code', label: 'Code' },
    { key: 'unitPrice', label: 'Unit price' },
    { key: 'type', label: 'Type' },
    { key: 'categoryId', label: 'Category ID', exposure: 'reference' },
  ],
  'sales:sales.stage': [
    { key: '_id', label: 'Stage ID', exposure: 'reference' },
    { key: 'name', label: 'Name' },
    { key: 'probability', label: 'Probability' },
    { key: 'status', label: 'Status' },
  ],
  'core:tag': [
    { key: '_id', label: 'Tag ID', exposure: 'reference' },
    { key: 'name', label: 'Name' },
    { key: 'colorCode', label: 'Color' },
  ],
  'core:branch': [
    { key: '_id', label: 'Branch ID', exposure: 'reference' },
    { key: 'title', label: 'Title' },
    { key: 'code', label: 'Code' },
  ],
  'core:department': [
    { key: '_id', label: 'Department ID', exposure: 'reference' },
    { key: 'title', label: 'Title' },
    { key: 'code', label: 'Code' },
  ],
  'sales:sales.pipelineLabel': [
    { key: '_id', label: 'Label ID', exposure: 'reference' },
    { key: 'name', label: 'Name' },
    { key: 'colorCode', label: 'Color' },
  ],
};

const resolveReferenceContentType = (type: string, field: string) => {
  const normalizedType = normalizeAutomationReferenceType(type);

  return REFERENCE_FIELD_TYPE_MAP[normalizedType]?.[field] || '';
};

const getReferenceContentTypeAliases = (contentType: string) => {
  const aliases: Record<string, string[]> = {
    'core:customer': [
      'core:customer',
      'core:lead',
      'core:visitor',
      'core:contact.customer',
      'core:contacts.customers',
      'customer',
      'customers',
    ],
    'core:company': [
      'core:company',
      'core:contact.company',
      'core:contacts.companies',
      'company',
      'companies',
    ],
    'core:user': ['core:user', 'core:teamMember', 'user', 'users'],
    'core:product': ['core:product', 'product', 'products'],
  };

  return aliases[contentType] || [contentType];
};

const getReferenceCustomFields = async (
  models: IContext['models'],
  subdomain: string,
  contentType: string,
) => {
  const toOutputVariable = (field) => ({
    key: field.name || `customFieldsData.${field._id}`,
    label: field.label || field.text || field.code || field.name,
    type: field.type,
  });

  try {
    const fields = await fieldsCombinedByContentType(models, subdomain, {
      contentType,
    } as any);
    const combinedFields = (fields || [])
      .filter((field) => field?.name?.startsWith('customFieldsData.'))
      .map(toOutputVariable);

    if (combinedFields.length) {
      return combinedFields;
    }
  } catch (error) {
    // Fall back to direct field lookup below. Reference field expansion should
    // still work even if plugin-provided base fields are unavailable.
  }

  const contentTypes = getReferenceContentTypeAliases(contentType);
  const customFields = await models.Fields.find({
    contentType: { $in: contentTypes },
  })
    .sort({ order: 1, code: 1 })
    .lean();

  if (customFields.length) {
    return customFields.map((field) =>
      toOutputVariable({
        ...field,
        name: `customFieldsData.${field._id}`,
      }),
    );
  }

  const fallbackFields = await getCustomFields(models, contentType);

  return (fallbackFields || []).map((field) =>
    toOutputVariable({
      ...field,
      name: `customFieldsData.${field._id}`,
    }),
  );
};

const getAutomationConstants =
  async (): Promise<TAutomationConstantsResponse> => {
    const plugins = await getPlugins();
    const normalizedCoreConstants = normalizeAutomationConstantsForTransport(
      'core',
      coreAutomationConstants,
    );

    const constants: TAutomationConstantsResponse = {
      triggersConst: [...(normalizedCoreConstants.triggers || [])],
      triggerTypesConst: [],
      actionsConst: [...(normalizedCoreConstants.actions || [])],
      findObjectTargetsConst: [
        ...(normalizedCoreConstants.findObjectTargets || []),
      ],
    };

    for (const pluginName of plugins) {
      if (pluginName === 'core') {
        continue;
      }

      const plugin = await getPlugin(pluginName);
      const meta = plugin.config?.meta ?? {};

      if (!meta?.automations?.constants) {
        continue;
      }

      const pluginConstants = normalizeAutomationConstantsForTransport(
        pluginName,
        meta.automations.constants as AutomationConstants,
      );
      const {
        triggers = [],
        actions = [],
        findObjectTargets = [],
      } = pluginConstants as AutomationConstants;
      constants.findObjectTargetsConst.push(...findObjectTargets);

      for (const trigger of triggers) {
        constants.triggersConst.push({ ...trigger, pluginName });

        if (
          pluginName !== 'core' &&
          trigger.moduleName &&
          trigger.collectionName
        ) {
          const propertyType = `${pluginName}:${trigger.moduleName}.${trigger.collectionName}`;
          constants.triggerTypesConst = [
            ...new Set([...constants.triggerTypesConst, propertyType]),
          ];
        }
      }
      for (const action of actions) {
        constants.actionsConst.push({ ...action, pluginName });
      }
    }

    constants.findObjectTargetsConst = constants.findObjectTargetsConst.filter(
      (item, index, array) =>
        array.findIndex((candidate) => candidate.value === item.value) ===
        index,
    );

    return constants;
  };

export const automationQueries = {
  /**
   * Automations list
   */
  async automations(_root, params: IListArgs, { models }: IContext) {
    const filter = generateFilter(params);

    return models.Automations.find(filter).lean();
  },

  /**
   * Automations for only main list
   */
  async automationsMain(_root, params: IListArgs, { models }: IContext) {
    const filter = generateFilter(params);

    const { list, totalCount, pageInfo } =
      await cursorPaginate<IAutomationDocument>({
        model: models.Automations,
        params: {
          ...params,
          orderBy: {
            createdAt: -1,
          },
        },
        query: filter,
      });

    return {
      list,
      totalCount,
      pageInfo,
    };
  },

  /**
   * Get one automation
   */
  async automationDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.Automations.getAutomation(_id);
  },

  /**
   * Automations history list
   */
  async automationHistories(
    _root,
    params: IHistoriesParams,
    { models }: IContext,
  ) {
    const filter: any = generateHistoriesFilter(params);

    const { list, totalCount, pageInfo } =
      await cursorPaginate<IAutomationExecutionDocument>({
        model: models.AutomationExecutions,
        params: {
          ...params,
          orderBy: { createdAt: -1 },
        },
        query: filter,
      });

    return {
      list,
      totalCount,
      pageInfo,
    };
  },

  async automationHistoriesTotalCount(
    _root,
    params: IHistoriesParams,
    { models }: IContext,
  ) {
    const filter: any = generateHistoriesFilter(params);

    return await models.AutomationExecutions.find(filter).countDocuments();
  },

  async automationsTotalCount(
    _root,
    { status }: { status: string },
    { models }: IContext,
  ) {
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    return models.Automations.find(filter).countDocuments();
  },

  async automationConstants(_root, _args) {
    return getAutomationConstants();
  },

  async automationNodeOutput(_root, { nodeType }: { nodeType: string }) {
    const { triggersConst, actionsConst } = await getAutomationConstants();

    const matchedTrigger = triggersConst.find(({ type }) => type === nodeType);

    if (matchedTrigger?.output) {
      return matchedTrigger.output;
    }

    const matchedAction = actionsConst.find(({ type }) => type === nodeType);

    return matchedAction?.output || null;
  },

  async automationReferenceFields(
    _root,
    { type, field }: { type: string; field: string },
    { models, subdomain }: IContext,
  ) {
    const referenceType = resolveReferenceContentType(type, field);

    if (!referenceType) {
      return [];
    }

    const baseFields = REFERENCE_BASE_FIELDS[referenceType] || [];
    const customFields = await getReferenceCustomFields(
      models,
      subdomain,
      referenceType,
    );

    return [...baseFields, ...customFields].filter(
      (item, index, array) =>
        array.findIndex((candidate) => candidate.key === item.key) === index,
    );
  },

  async getAutomationWebhookEndpoint(
    _root,
    { _id },
    { models, subdomain }: IContext,
  ) {
    const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });

    if (!DOMAIN) {
      throw new Error('DOMAIN is not set');
    }

    const automation = await models.Automations.findById(_id).lean();

    if (!automation) {
      throw new Error('Not found');
    }

    return `${DOMAIN}/automation/${automation._id}/`;
  },

  async getAutomationExecutionDetail(
    _root,
    { executionId },
    { models }: IContext,
  ) {
    const execution = await models.AutomationExecutions.findById(
      executionId,
    ).lean();
    if (!execution) {
      throw new Error('Execution not found');
    }

    return execution;
  },

  async automationBotsConstants() {
    const plugins = await getPlugins();
    const botsConstants: any[] = [];

    for (const pluginName of plugins) {
      const plugin = await getPlugin(pluginName);
      const bots = plugin?.config?.meta?.automations?.constants?.bots || [];

      if (bots.length) {
        botsConstants.push(...bots.map((bot) => ({ ...bot, pluginName })));
      }
    }

    return botsConstants;
  },

  async automationsAiAgents(_root, { kind }, { models }: IContext) {
    const agents = await models.AiAgents.find(
      kind ? { 'connection.provider': kind } : {},
    );

    return sanitizeAiAgents(agents as any[]);
  },

  async automationsAiAgentDetail(
    _root,
    { _id }: { _id?: string },
    { models }: IContext,
  ) {
    return sanitizeAiAgent(await models.AiAgents.findOne(_id ? { _id } : {}));
  },

  async automationsAiAgentHealth(
    _root,
    { agentId }: { agentId: string },
    { subdomain }: IContext,
  ) {
    return await sendWorkerMessage({
      pluginName: 'automations',
      queueName: 'aiAgent',
      jobName: 'checkAiAgentHealth',
      subdomain,
      data: { agentId },
      timeout: 10000,
    });
  },

  /**
   * Email templates list
   */
  async automationEmailTemplates(
    _root,
    params: {
      page?: number;
      perPage?: number;
      searchValue?: string;
      sortField?: string;
      sortDirection?: number;
    },
    { models }: IContext,
  ) {
    const { searchValue, sortField = 'createdAt', sortDirection = -1 } = params;

    const filter: any = {};

    if (searchValue) {
      filter.$or = [
        { name: new RegExp(`.*${searchValue}.*`, 'i') },
        { description: new RegExp(`.*${searchValue}.*`, 'i') },
      ];
    }

    const { list, totalCount, pageInfo } =
      await cursorPaginate<IAutomationEmailTemplateDocument>({
        model: models.AutomationEmailTemplates,
        params: {
          ...params,
          orderBy: {
            [sortField]: sortDirection as SortOrder,
          },
        },
        query: filter,
      });

    return {
      list,
      totalCount,
      pageInfo,
    };
  },

  /**
   * Get one email template
   */
  async automationEmailTemplateDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return models.AutomationEmailTemplates.getEmailTemplate(_id);
  },
};
