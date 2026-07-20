import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { IPosOrderDocument } from '~/modules/pos/@types/orders';
import { IPosDocument } from '~/modules/pos/@types/pos';

const resolvers = {
  putResponses: async (order, _, { subdomain }) => {
    return sendTRPCMessage({
      subdomain,

      pluginName: 'ebarimt',
      module: 'putresponses',
      action: 'find',
      input: {
        query: {
          contentType: 'pos',
          contentId: order._id,
        },
      },
      defaultValue: [],
    });
  },

  posName: async (order, _, { models }) => {
    const pos = await models.Pos.findOne({ token: order.posToken }).lean();
    return pos ? pos.name : '';
  },

  paidAmounts: async (order: IPosOrderDocument, _, { models }: IContext) => {
    if (!order.paidAmounts?.length) {
      return;
    }

    const pos: IPosDocument | null = await models.Pos.findOne({
      token: order.posToken,
    }).lean();

    if (!pos?.paymentTypes?.length) {
      return order.paidAmounts;
    }

    const paidAmounts: any[] = order.paidAmounts;
    return paidAmounts.map((paidAmount) => ({
      _id: paidAmount._id,
      type: paidAmount.type,
      amount: paidAmount.amount,
      title: (
        (pos.paymentTypes || []).find((p) => p.type === paidAmount.type) || {
          title: paidAmount.type,
        }
      ).title,
    }));
  },

  user: async (order, _, { subdomain }) => {
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

  brokerName: async (order, _, { subdomain }) => {
    if (!order.brokerId || !order.brokerType) return null;

    if (order.brokerType === 'user') {
      const user = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'users',
        action: 'findOne',
        input: { _id: order.brokerId },
        defaultValue: null,
      });
      return user?.username || null;
    }

    if (order.brokerType === 'company') {
      const company = await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        module: 'companies',
        action: 'findOne',
        input: { _id: order.brokerId },
        defaultValue: null,
      });
      return company?.primaryName || null;
    }

    const customer = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      module: 'customers',
      action: 'findOne',
      input: { _id: order.brokerId },
      defaultValue: null,
    });
    if (!customer) return null;
    const name = [customer.firstName, customer.lastName]
      .filter(Boolean)
      .join(' ');
    return name || customer.primaryEmail || customer.code || null;
  },
};

export default resolvers;
