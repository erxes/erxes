import { Segments } from '../../../db/models';
import { fetchSegment } from '../../modules/segments/queryBuilder';
import { checkPermission, requireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';

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

const automationQueries = {
  /**
   * Automations list
   */
  automations(_root, params: IListArgs, { dataSources }: IContext) {
    return dataSources.AutomationsAPI.getAutomations(params);
  },

  /**
   * Automations for only main list
   */
  automationsMain(_root, params: IListArgs, { dataSources }: IContext) {
    return dataSources.AutomationsAPI.getAutomationsMain(params);
  },

  /**
   * Get one automation
   */
  automationDetail(_root, { _id }: { _id: string }, { dataSources }: IContext) {
    return dataSources.AutomationsAPI.getAutomationDetail(_id);
  },

  /**
   * Automations note list
   */
  automationNotes(
    _root,
    params: { automationId: string },
    { dataSources }: IContext
  ) {
    return dataSources.AutomationsAPI.getAutomationNotes(params);
  },

  /**
   * Automations history list
   */
  automationHistories(
    _root,
    params: IHistoriesParams,
    { dataSources }: IContext
  ) {
    return dataSources.AutomationsAPI.getAutomationHistories(params);
  },

  async automationConfigPrievewCount(_root, params: { config: any }) {
    const config = params.config;
    if (!config) {
      return;
    }

    const contentId = config.contentId;
    if (!contentId) {
      return;
    }

    const segment = await Segments.findOne({ _id: contentId });
    if (!segment) {
      return;
    }

    const result = await fetchSegment(segment, { returnCount: true });

    return result;
  },

  async automationsTotalCount(
    _root,
    { status }: { status: string },
    { dataSources }: IContext
  ) {
    return dataSources.AutomationsAPI.getTotalCount(status);
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
