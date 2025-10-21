import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IPosOrderDocument } from '@/pos/@types/orders';
import { getConfig } from '@/pos/utils';
import { IContext } from '~/connectionResolvers';

const resolvers = {
  user: async (order, _, { subdomain }: IContext) => {
    if (!order.userId) {
      return null;
    }
    return await sendTRPCMessage({
      subdomain,

      pluginName: 'core',
      module: 'users',
      action: 'findOne',
      input: { _id: order.userId },
    });
  },

  posName: async (order, _, { models }: IContext) => {
    const pos = await models.Pos.findOne({ token: order.posToken }).lean();
    return pos ? pos.name : '';
  },

  customer: async (order, _, { subdomain }: IContext) => {
    if (!order.customerId) {
      return null;
    }

    if (order.customerType === 'company') {
      const company = await sendTRPCMessage({
        subdomain,

        pluginName: 'core',
        module: 'company',
        action: 'findOne',
        input: { _id: order.customerId },
      });

      if (!company) {
        return;
      }
      return {
        _id: company._id,
        code: company.code,
        primaryPhone: company.primaryPhone,
        firstName: company.primaryName,
        primaryEmail: company.primaryEmail,
        lastName: '',
      };
    }

    if (order.customerType === 'user') {
      const user = await sendTRPCMessage({
        subdomain,

        pluginName: 'core',
        module: 'users',
        action: 'findOne',
        input: { _id: order.customerId },
      });

      if (!user) {
        return;
      }

      return {
        _id: user._id,
        code: user.code,
        primaryPhone: (user.details && user.details.operatorPhone) || '',
        firstName: `${user.firstName || ''} ${user.lastName || ''}`,
        primaryEmail: user.email,
        lastName: user.username,
      };
    }

    if (!order.customerType || order.customerType === 'customer') {
      const customer = await sendTRPCMessage({
        subdomain,

        pluginName: 'core',
        module: 'customers',
        action: 'findOne',
        input: { _id: order.customerId },
      });

      if (!customer) {
        return;
      }

      return {
        _id: customer._id,
        code: customer.code,
        primaryPhone: customer.primaryPhone,
        firstName: customer.firstName,
        primaryEmail: customer.primaryEmail,
        lastName: customer.lastName,
      };
    }

    return {};
  },

  syncedErkhet: async (order, _, { subdomain }: IContext) => {
    if (order.syncedErkhet) {
      return true;
    }
    const erkhetConfig = await getConfig(subdomain, 'ERKHET', {});
    if (!erkhetConfig || !erkhetConfig.apiToken) {
      return true;
    }
    return order.syncedErkhet;
  },

  putResponses: async (order, _, { subdomain }: IContext) => {
    sendTRPCMessage({
      subdomain,

      pluginName: 'coreintegration',
      module: 'putresponses',
      action: 'find',
      input: {
        query: {
          contentType: 'pos',
          contentId: order._id,
        },
      },
    });
  },

  async deal(order: IPosOrderDocument, _, { subdomain }: IContext) {
    if (!order.convertDealId) {
      return null;
    }

    return await sendTRPCMessage({
      subdomain,

      pluginName: 'sales',
      module: 'deals',
      action: 'findOne',
      input: { _id: order.convertDealId },
    });
  },

  async dealLink(order: IPosOrderDocument, _, { subdomain }: IContext) {
    if (!order.convertDealId) {
      return null;
    }

    return await sendTRPCMessage({
      subdomain,

      pluginName: 'sales',
      module: 'deals',
      action: 'getLink',
      input: { _id: order.convertDealId, type: 'deal' },
    });
  },
};

export default resolvers;
