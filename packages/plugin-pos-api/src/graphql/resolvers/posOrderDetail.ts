import {
  sendCoreMessage,
  sendContactsMessage,
  sendEbarimtMessage
} from '../../messageBroker';
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

      return {
        _id: user._id,
        code: user.code,
        primaryPhone: (user.details && user.details.operatorPhone) || '',
        firstName: `${user.firstName || ''} ${user.lastName || ''}`,
        primaryEmail: user.email,
        lastName: user.username
      };
    }

    const customer = await sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: { _id: order.customerId },
      isRPC: true,
      defaultValue: {}
    });

    return {
      _id: customer._id,
      code: customer.code,
      primaryPhone: customer.primaryPhone,
      firstName: customer.firstName,
      primaryEmail: customer.primaryEmail,
      lastName: customer.lastName
    };
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

  putResponses: async (order, {}, { subdomain }) => {
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
  }
};

export default resolvers;
