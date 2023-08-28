import { paginate } from '@erxes/api-utils/src';
import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { sendSegmentsMessage } from '../../../messageBroker';
import { ITrigger } from '../../../models/definitions/automaions';
import { serviceDiscovery } from '../../../configs';
import { STATUSES, UI_ACTIONS } from '../../../constants';

interface IListArgs {
  status: string;
  searchValue: string;
  ids?: string;
  page?: number;
  perPage?: number;
  sortField: string;
  sortDirection: number;
  tagIds: string[];
}

interface IHistoriesParams {
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
  const { status, searchValue, tagIds } = params;

  const filter: any = { status: { $nin: [STATUSES.ARCHIVED, 'template'] } };

  if (status) {
    filter.status = status;
  }

  if (searchValue) {
    filter.name = new RegExp(`.*${searchValue}.*`, 'i');
  }

  if (tagIds) {
    filter.tagIds = { $in: tagIds };
  }

  return filter;
};

const automationQueries = {
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
    const { page, perPage } = params;

    const filter = generateFilter(params);

    const automations = paginate(
      models.Automations.find(filter)
        .sort({ createdAt: -1 })
        .lean(),
      { perPage, page }
    );

    const totalCount = await models.Automations.find(filter).countDocuments();

    return {
      list: automations,
      totalCount
    };
  },

  /**
   * Get one automation
   */
  async automationDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.Automations.getAutomation(_id);
  },

  /**
   * Automations note list
   */
  automationNotes(
    _root,
    params: { automationId: string },
    { models }: IContext
  ) {
    return models.Notes.find({ automationId: params.automationId }).sort({
      createdAt: -1
    });
  },

  /**
   * Automations history list
   */
  automationHistories(_root, params: IHistoriesParams, { models }: IContext) {
    const {
      page,
      perPage,
      automationId,
      triggerType,
      triggerId,
      status,
      beginDate,
      endDate
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

    return paginate(models.Executions.find(filter).sort({ createdAt: -1 }), {
      page,
      perPage
    });
  },

  async automationConfigPrievewCount(
    _root,
    params: { config: any },
    { subdomain }: IContext
  ) {
    const config = params.config;
    if (!config) {
      return;
    }

    const contentId = config.contentId;
    if (!contentId) {
      return;
    }

    const segment = await sendSegmentsMessage({
      subdomain,
      action: 'findOne',
      data: { _id: contentId },
      isRPC: true
    });

    if (!segment) {
      return;
    }

    const result = await sendSegmentsMessage({
      subdomain,
      action: 'fetchSegment',
      data: {
        segmentId: segment._id,
        options: { returnCount: true }
      },
      isRPC: true
    });

    return result;
  },

  async automationsTotalCount(
    _root,
    { status }: { status: string },
    { models }: IContext
  ) {
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    return models.Automations.find(filter).countDocuments();
  },

  async automationConstants(_root, {}) {
    const services = await serviceDiscovery.getServices();

    const constants: {
      triggersConst: ITrigger[];
      triggerTypesConst: string[];
      actionsConst: any[];
      propertyTypesConst: Array<{ value: string; label: string }>;
    } = {
      triggersConst: [],
      triggerTypesConst: [],
      actionsConst: [...UI_ACTIONS],
      propertyTypesConst: []
    };

    for (const serviceName of services) {
      const service = await serviceDiscovery.getService(serviceName, true);
      const meta = service.config?.meta || {};

      if (meta && meta.automations && meta.automations.constants) {
        const pluginConstants = meta.automations.constants || {};
        const { triggers = [], actions = [] } = pluginConstants;

        for (const trigger of triggers) {
          constants.triggersConst.push(trigger);
          constants.triggerTypesConst.push(trigger.type);
          constants.propertyTypesConst.push({
            value: trigger.type,
            label: trigger.label
          });
        }

        for (const action of actions) {
          constants.actionsConst.push(action);
        }

        if (!!pluginConstants?.emailRecipientTypes?.length) {
          const updatedEmailRecipIentTypes = pluginConstants.emailRecipientTypes.map(
            eRT => ({ ...eRT, serviceName })
          );
          constants.actionsConst = constants.actionsConst.map(actionConst =>
            actionConst.type === 'sendEmail'
              ? {
                  ...actionConst,
                  emailRecipientsConst: actionConst.emailRecipientsConst.concat(
                    updatedEmailRecipIentTypes
                  )
                }
              : actionConst
          );
        }
      }
    }

    return constants;
  }
};

requireLogin(automationQueries, 'automationsMain');
requireLogin(automationQueries, 'automationNotes');
requireLogin(automationQueries, 'automationDetail');

checkPermission(automationQueries, 'automations', 'showAutomations', []);
checkPermission(automationQueries, 'automationsMain', 'showAutomations', {
  list: [],
  totalCount: 0
});

export default automationQueries;
