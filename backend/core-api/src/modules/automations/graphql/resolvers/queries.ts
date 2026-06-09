import {
  IAutomationDocument,
  IAutomationExecutionDocument,
  splitType,
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
  markResolvers,
} from 'erxes-api-shared/utils';
import { SortOrder } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { sanitizeAiAgent, sanitizeAiAgents } from './utils/aiAgent';
import {
  generateAutomationHistoriesFilter,
  generateAutomationsFilter,
  getAutomationReferenceFields,
  getAutomationConstants,
  getAutomationSetPropertyTargets,
} from './utils/queriesUtils';

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

export const automationQueries = {
  /**
   * Automations list
   */
  async automations(_root, params: IListArgs, { models }: IContext) {
    const filter = generateAutomationsFilter(params);

    return models.Automations.find(filter).lean();
  },

  /**
   * Automations for only main list
   */
  async automationsMain(_root, params: IListArgs, { models }: IContext) {
    const filter = generateAutomationsFilter(params);

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

  async cpAutomationDetail(
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
    const filter: any = generateAutomationHistoriesFilter(params);

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
    const filter: any = generateAutomationHistoriesFilter(params);

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

  async automationConstants() {
    return getAutomationConstants();
  },

  async automationSetPropertyTargets(
    _root,
    { sourceType }: { sourceType: string },
  ) {
    const [pluginName, moduleName, collectionName] = splitType(sourceType);
    return await getAutomationSetPropertyTargets(
      `${pluginName}:${moduleName}.${collectionName}`,
    );
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
    { models }: IContext,
  ) {
    return await getAutomationReferenceFields({
      field,
      models,
      type,
    });
  },

  async getAutomationWebhookEndpoint(
    _root,
    { _id },
    { models, subdomain }: IContext,
  ) {
    const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });
    const NODE_ENV = getEnv({ name: 'NODE_ENV' });

    if (!DOMAIN) {
      throw new Error('DOMAIN is not set');
    }

    const automation = await models.Automations.findById(_id).lean();

    if (!automation) {
      throw new Error('Not found');
    }

    const syntax = NODE_ENV === 'production' ? '/gateway/pl:automations' : '';

    return `${DOMAIN}${syntax}/automation/${automation._id}/`;
  },

  async getAutomationExecutionDetail(
    _root,
    { executionId },
    { models }: IContext,
  ) {
    const execution =
      await models.AutomationExecutions.findById(executionId).lean();
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

  async automationsAiAgentTotalCounts(_root, _args, { models }: IContext) {
    const counts = await models.AiAgents.aggregate([
      {
        $group: {
          _id: '$connection.provider',
          totalCount: { $sum: 1 },
        },
      },
    ]);

    return counts.reduce<Record<string, number>>((acc, { _id, totalCount }) => {
      if (_id) {
        acc[_id] = totalCount;
      }

      return acc;
    }, {});
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

Object.assign(automationQueries.cpAutomationDetail, {
  wrapperConfig: { forClientPortal: true },
});
