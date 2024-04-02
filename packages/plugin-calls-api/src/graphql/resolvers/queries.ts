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
}

const callsQueries = {
  callsIntegrationDetail(_root, { integrationId }, { models }: IContext) {
    return models.Integrations.findOne({ inboxId: integrationId });
  },

  async callUserIntegrations(_root, _args, { models, user }: IContext) {
    const res = models.Integrations.getIntegrations(user._id);

    return res;
  },

  async callsCustomerDetail(_root, { callerNumber }, { subdomain }: IContext) {
    let customer = await sendCommonMessage({
      subdomain,
      isRPC: true,
      serviceName: 'contacts',
      action: 'customers.findOne',
      data: {
        primaryPhone: callerNumber,
      },
      defaultValue: null,
    });

    return customer;
  },
  async callsActiveSession(_root, {}, { models, user }: IContext) {
    const activeSession = models.ActiveSessions.getActiveSession(user._id);

    return activeSession;
  },
  async callHistories(_root, params: IHistoryArgs, { models, user }: IContext) {
    const activeSession = models.CallHistory.getCallHistories(params, user);

    return activeSession;
  },

  async callsGetConfigs(_root, _args, { models }: IContext) {
    return models.Configs.find({}).lean();
  },
};

export default callsQueries;
