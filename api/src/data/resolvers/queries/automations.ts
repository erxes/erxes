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

const automationQueries = {
  /**
   * Automations list
   */
  async automations(_root, params: IListArgs, { dataSources }: IContext) {
    return dataSources.AutomationsApi.getAutomations(params);
  },

  /**
   * Automations for only main list
   */
  async automationsMain(_root, params: IListArgs, { dataSources }: IContext) {
    console.log('qqqqqqqqqqqq', dataSources.AutomationsApi);
    return dataSources.AutomationsApi.getAutomationsMain(params);
  },

  /**
   * Get one automation
   */
  automationDetail(_root, { _id }: { _id: string }, { dataSources }: IContext) {
    return dataSources.AutomationsApi.getAutomationDetail(_id);
  }
};

requireLogin(automationQueries, 'automationsMain');
requireLogin(automationQueries, 'automationDetail');

checkPermission(automationQueries, 'automations', 'showAutomations', []);
checkPermission(automationQueries, 'automationsMain', 'showAutomations', {
  list: [],
  totalCount: 0
});

export default automationQueries;
