import { markResolvers, sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import {
  getCallProWebhookUrl,
  isCallProEnabled,
} from '@/integrations/callpro/config';

const callProQueries = {
  callProConfig(_root, _args, { subdomain }: IContext) {
    const enabled = isCallProEnabled();

    return {
      enabled,
      webhookUrl: enabled ? getCallProWebhookUrl(subdomain) : null,
    };
  },

  async callProIntegrationDetail(
    _root,
    { integrationId }: { integrationId: string },
    { models }: IContext,
  ) {
    return models.CallProIntegrations.findOne({ inboxId: integrationId })
      .select(['-_id', '-inboxId'])
      .lean();
  },

  async callProCustomersByPhone(
    _root,
    { phone }: { phone: string },
    { subdomain }: IContext,
  ) {
    return sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'customers',
      action: 'find',
      input: {
        query: {
          status: { $ne: 'deleted' },
          $or: [{ primaryPhone: phone }, { 'phones.phone': { $in: [phone] } }],
        },
      },
      defaultValue: [],
    });
  },
};

markResolvers(callProQueries, {
  wrapperConfig: {
    skipPermission: true,
  },
});

export default callProQueries;
