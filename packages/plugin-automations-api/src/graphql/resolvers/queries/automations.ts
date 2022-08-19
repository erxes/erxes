import { paginate } from '@erxes/api-utils/src';
import { checkPermission, requireLogin } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { sendSegmentsMessage } from '../../../messageBroker';

interface IListArgs {
  status: string;
  searchValue: string;
  ids?: string;
  page?: number;
  perPage?: number;
  sortField: string;
  sortDirection: number;
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
  const { status, searchValue } = params;

  const filter: any = {};

  if (status) {
    filter.status = status;
  } else {
    filter.status = { $ne: 'template' };
  }

  if (searchValue) {
    filter.name = new RegExp(`.*${searchValue}.*`, 'i');
  }
  return filter;
}

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
  async automationDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Automations.getAutomation(_id);
  },

  /**
   * Automations note list
   */
  automationNotes(_root, params: { automationId: string }, { models }: IContext) {
    return models.Notes.find({ automationId: params.automationId }).sort({ createdAt: -1 });
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

    return paginate(
      models.Executions.find(filter).sort({ createdAt: -1 }),
      { page, perPage }
    )
  },

  async automationConfigPrievewCount(_root, params: { config: any }, { subdomain }: IContext) {
    const config = params.config;
    if (!config) {
      return;
    }

    const contentId = config.contentId;
    if (!contentId) {
      return;
    }

    const segment = await sendSegmentsMessage({ subdomain, action: 'findOne', data: { _id: contentId }, isRPC: true });

    if (!segment) {
      return;
    }

    const result = await sendSegmentsMessage({
      subdomain,
      action: "fetchSegment",
      data: {
        segmentId: segment._id,
        options: { returnCount: true },
      },
      isRPC: true,
    });

    return result;
  },

  async automationsTotalCount(_root, { status }: { status: string }, { models }: IContext) {
    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    return models.Automations.find(filter).countDocuments();
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
