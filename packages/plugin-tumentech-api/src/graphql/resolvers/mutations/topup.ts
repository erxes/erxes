import { checkPermission } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import {
  sendClientPortalMessage,
  sendCommonMessage
} from '../../../messageBroker';

const topupMutations = {
  manualTopup: async (_root, { customerId, amount }, { models }: IContext) => {
    const topup = await models.Topups.create({
      customerId,
      amount
    });

    await models.CustomerAccounts.addTopupAmount({
      customerId,
      amount
    });

    return topup;
  },

  topupAccount: async (
    _root,
    { invoiceId }: { invoiceId: string },
    { models, cpUser, subdomain }: IContext
  ) => {
    const invoice = await sendCommonMessage({
      subdomain: subdomain,
      serviceName: 'payment',
      action: 'invoices.findOne',
      data: {
        _id: invoiceId
      },
      isRPC: true,
      defaultValue: undefined
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const user = await sendClientPortalMessage({
      subdomain: subdomain,
      action: 'clientPortalUsers.findOne',
      data: {
        _id: cpUser.userId
      },
      isRPC: true,
      defaultValue: undefined
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.erxesCustomerId !== invoice.customerId) {
      throw new Error('User data mismatch');
    }

    const topup = await models.Topups.createTopup({
      invoiceId,
      customerId: invoice.customerId,
      amount: invoice.amount
    });

    await models.CustomerAccounts.addTopupAmount({
      customerId: invoice.customerId,
      amount: invoice.amount
    });

    return topup;
  }
};

// checkPermission(topupMutations, 'manualTopup', 'manageTopups');
// checkPermission(topupMutations, 'carCategoriesRemove', 'manageTopups');

export default topupMutations;
