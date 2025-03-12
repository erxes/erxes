import { IContext } from '../../connectionResolver';
import { sendCommonMessage } from '../../messageBroker';

export interface IHistoryArgs {
  limit?: number;
  callStatus?: string;
  callType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  perPage?: number;
  searchValue?: string;
  skip?: number;
  integrationId?: string;
}

const callsQueries = {
  async cloudflareCallsIntegrationDetail(
    _root,
    { integrationId },
    { models }: IContext,
  ) {
    return models.Integrations.findOne({ erxesApiId: integrationId });
  },

  async cloudflareCallsUserIntegrations(
    _root,
    _args,
    { models, user }: IContext,
  ) {
    const res = models.Integrations.getIntegrations(user._id);

    return res;
  },

  async cloudflareCallsGetIntegrations(_root, _args, { models }: IContext) {
    const integrations = await models.Integrations.find({
      status: { $eq: 'active' },
    });

    return integrations;
  },

  async cloudflareCallsCustomerDetail(
    _root,
    { customerPhone },
    { subdomain }: IContext,
  ) {
    let customer = await sendCommonMessage({
      subdomain,
      isRPC: true,
      serviceName: 'core',
      action: 'customers.findOne',
      data: {
        primaryPhone: customerPhone,
      },
      defaultValue: null,
    });

    return customer;
  },

  async cloudflareCallsHistories(
    _root,
    params: IHistoryArgs,
    { models, user }: IContext,
  ) {
    const activeSession = models.CallHistory.getCallHistories(params, user);

    return activeSession;
  },
  async cloudflareCallsHistoriesTotalCount(
    _root,
    params: IHistoryArgs,
    { models, user }: IContext,
  ) {
    return models.CallHistory.getHistoriesCount(params, user);
  },

  async cloudflareCallsGetConfigs(_root, _args, { models }: IContext) {
    return models.Configs.find({}).lean();
  },
};

export default callsQueries;
