import {
  cursorPaginate,
  getEnv,
  getPlugin,
  getPlugins,
} from 'erxes-api-shared/utils';

import {
  AUTOMATION_ACTIONS,
  AUTOMATION_CORE_PROPERTY_TYPES,
  AUTOMATION_STATUSES,
  AUTOMATION_TRIGGERS,
  checkPermission,
  IAutomationDocument,
  IAutomationExecutionDocument,
  IAutomationsActionConfig,
  IAutomationsTriggerConfig,
  requireLogin,
} from 'erxes-api-shared/core-modules';
import { ICursorPaginateParams } from 'erxes-api-shared/core-types';

import { IContext } from '~/connectionResolvers';

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

  if (ids?.length) {
    filter._id = { $in: ids };
  }
  if (excludeIds.length) {
    filter._id = { $nin: excludeIds };
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
    const plugins = await getPlugins();

    const constants: {
      triggersConst: IAutomationsTriggerConfig[];
      triggerTypesConst: string[];
      actionsConst: IAutomationsActionConfig[];
      propertyTypesConst: Array<{ value: string; label: string }>;
    } = {
      triggersConst: [...AUTOMATION_TRIGGERS],
      triggerTypesConst: [],
      actionsConst: [...AUTOMATION_ACTIONS],
      propertyTypesConst: [...AUTOMATION_CORE_PROPERTY_TYPES],
    };

    // Track seen items to avoid duplicates
    const seenTriggerTypes = new Set<string>(
      constants.triggersConst.map((t) => t.type),
    );
    const seenTriggerTypeStrings = new Set<string>();
    const seenPropertyValues = new Set<string>(
      constants.propertyTypesConst.map((p) => p.value),
    );
    const seenActionTypes = new Set<string>(
      constants.actionsConst.map((a) => a.type),
    );

    for (const pluginName of plugins) {
      const plugin = await getPlugin(pluginName);
      const meta = plugin.config?.meta || {};

      if (meta && meta.automations && meta.automations.constants) {
        const pluginConstants = meta.automations.constants || {};
        const { triggers = [], actions = [] } = pluginConstants;

        for (const trigger of triggers) {
          if (!seenTriggerTypes.has(trigger.type)) {
            constants.triggersConst.push({ ...trigger, pluginName });
            seenTriggerTypes.add(trigger.type);
          }

          if (!seenTriggerTypeStrings.has(trigger.type)) {
            constants.triggerTypesConst.push(trigger.type);
            seenTriggerTypeStrings.add(trigger.type);
          }

          if (!seenPropertyValues.has(trigger.type)) {
            constants.propertyTypesConst.push({
              value: trigger.type,
              label: trigger.label,
            });
            seenPropertyValues.add(trigger.type);
          }
        }

        for (const action of actions) {
          if (!seenActionTypes.has(action.type)) {
            constants.actionsConst.push({ ...action, pluginName });
            seenActionTypes.add(action.type);
          }
        }

        if (pluginConstants?.emailRecipientTypes?.length) {
          const updatedEmailRecipIentTypes =
            pluginConstants.emailRecipientTypes.map((eRT) => ({
              ...eRT,
              pluginName,
            }));
          constants.actionsConst = constants.actionsConst.map((actionConst) => {
            if (actionConst.type !== 'sendEmail') {
              return actionConst;
            }

            const baseRecipients = actionConst.emailRecipientsConst || [];
            const merged = [...baseRecipients, ...updatedEmailRecipIentTypes];

            const seenRecipientValues = new Set<string>();
            const dedupedRecipients = merged.filter((recipient: any) => {
              const key = recipient.value ?? recipient.type ?? recipient.label;
              if (!key) {
                return true;
              }
              if (seenRecipientValues.has(key)) {
                return false;
              }
              seenRecipientValues.add(key);
              return true;
            });

            return {
              ...actionConst,
              emailRecipientsConst: dedupedRecipients,
            } as IAutomationsActionConfig as any;
          });
        }
      }
    }

    return constants;
  },

  async getAutomationWebhookEndpoint(
    _root,
    { _id },
    { models, subdomain }: IContext,
  ) {
    const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });

    const automation = await models.Automations.findById(_id).lean();

    if (!automation) {
      throw new Error('Not found');
    }

    return `${DOMAIN}/${automation._id}/`;
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
    return await models.AiAgents.find(kind ? { provider: kind } : {});
  },

  async automationsAiAgentDetail(_root, _, { models }: IContext) {
    return await models.AiAgents.findOne({});
  },

  async getTrainingStatus(_root, { agentId }, {}: IContext) {
    const agent = await this.models.AiAgents.findById(agentId);
    if (!agent) {
      throw new Error('AI Agent not found');
    }

    const files = agent.files || [];
    const embeddedFiles = await this.models.AiEmbeddings.find({
      fileId: { $in: files.map(({ id }) => id) },
    });

    return {
      agentId,
      totalFiles: files.length,
      processedFiles: embeddedFiles.length,
      status: embeddedFiles.length === files.length ? 'completed' : 'pending',
    };
  },
};

requireLogin(automationQueries, 'automationsMain');
requireLogin(automationQueries, 'automationNotes');
requireLogin(automationQueries, 'automationDetail');

checkPermission(automationQueries, 'automations', 'showAutomations', []);
checkPermission(automationQueries, 'automationsMain', 'showAutomations', {
  list: [],
  totalCount: 0,
});
