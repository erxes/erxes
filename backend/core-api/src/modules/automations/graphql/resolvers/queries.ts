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

const getAutomationConstants = async (): Promise<TAutomationConstantsResponse> => {
  const plugins = await getPlugins();
  const normalizedCoreConstants = normalizeAutomationConstantsForTransport(
    'core',
    coreAutomationConstants,
  );

  const constants: TAutomationConstantsResponse = {
    triggersConst: [...(normalizedCoreConstants.triggers || [])],
    triggerTypesConst: [],
    actionsConst: [...(normalizedCoreConstants.actions || [])],
    findObjectTargetsConst: [...(normalizedCoreConstants.findObjectTargets || [])],
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
    const { triggers = [], actions = [], findObjectTargets = [] } =
      pluginConstants as AutomationConstants;
    constants.findObjectTargetsConst.push(...findObjectTargets);

    for (const trigger of triggers) {
      constants.triggersConst.push({ ...trigger, pluginName });

      if (pluginName !== 'core' && trigger.moduleName && trigger.collectionName) {
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
      array.findIndex((candidate) => candidate.value === item.value) === index,
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

    const matchedTrigger = triggersConst.find(
      ({ type }) => type === nodeType,
    );

    if (matchedTrigger?.output) {
      return matchedTrigger.output;
    }

    const matchedAction = actionsConst.find(({ type }) => type === nodeType);

    return matchedAction?.output || null;
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
