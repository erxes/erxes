import { IContext } from '../../connectionResolver';
import {
  sendCoreMessage,
  sendContactsMessage,
  sendEbarimtMessage,
  sendCardsMessage
} from '../../messageBroker';
import { IPosOrderDocument } from '../../models/definitions/orders';
import { getConfig } from '../../utils';

const resolvers = {
  user: (order, {}, { subdomain }) => {
    if (!order.userId) {
      return null;
    }
    return sendCoreMessage({
      subdomain,
      action: 'users.findOne',
      data: { _id: order.userId },
      isRPC: true
    });
  },

  posName: async (order, {}, { models }) => {
    const pos = await models.Pos.findOne({ token: order.posToken }).lean();
    return pos ? pos.name : '';
  },

  customer: async (order, {}, { subdomain }) => {
    if (!order.customerId) {
      return null;
    }

    if (order.customerType === 'company') {
      const company = await sendContactsMessage({
        subdomain,
        action: 'companies.findOne',
        data: { _id: order.customerId },
        isRPC: true,
        defaultValue: {}
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
        lastName: ''
      };
    }

    if (order.customerType === 'user') {
      const user = await sendCoreMessage({
        subdomain,
        action: 'users.findOne',
        data: { _id: order.customerId },
        isRPC: true,
        defaultValue: {}
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
        lastName: user.username
      };
    }

    if (!order.customerType || order.customerType === 'customer') {
      const customer = await sendContactsMessage({
        subdomain,
        action: 'customers.findOne',
        data: { _id: order.customerId },
        isRPC: true,
        defaultValue: {}
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
        lastName: customer.lastName
      };
    }

    return {};
  },

  syncedErkhet: async (order, {}, { subdomain }) => {
    if (order.syncedErkhet) {
      return true;
    }
    const erkhetConfig = await getConfig(subdomain, 'ERKHET', {});
    if (!erkhetConfig || !erkhetConfig.apiToken) {
      return true;
    }
    return order.syncedErkhet;
  },

  putResponses: async (order, {}, { subdomain }: IContext) => {
    return sendEbarimtMessage({
      subdomain,
      action: 'putresponses.find',
      data: {
        query: {
          contentType: 'pos',
          contentId: order._id
        }
      },
      isRPC: true
    });
  },

  async deal(order: IPosOrderDocument, {}, { subdomain }: IContext) {
    if (!order.convertDealId) {
      return null;
    }

    return await sendCardsMessage({
      subdomain,
      action: 'deals.findOne',
      data: { _id: order.convertDealId },
      isRPC: true
    });
  },

  async dealLink(order: IPosOrderDocument, {}, { subdomain }: IContext) {
    if (!order.convertDealId) {
      return null;
    }
    return await sendCardsMessage({
      subdomain,
      action: 'getLink',
      data: { _id: order.convertDealId, type: 'deal' },
      isRPC: true
    });
  }
};

export default resolvers;
