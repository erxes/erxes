import { paginate } from '@erxes/api-utils/src';

import { IContext } from '../../../connectionResolver';
import {
  sendClientPortalMessage,
  sendCommonMessage
} from '../../../messageBroker';

const tripsQuery = {
  customerAccount: async (
    _root,
    args: { customerId: string },
    { models, subdomain }: IContext
  ) => {
    const { customerId } = args;

    const customer = await sendCommonMessage({
      serviceName: 'contacts',
      subdomain,
      action: 'customers.findOne',
      data: {
        _id: customerId
      },
      isRPC: true,
      defaultValue: null
    });

    if (!customer) {
      throw new Error('customer not found');
    }

    if (
      !customer.tagIds.includes('FjtEHstburfa9TWfJ') &&
      !customer.tagIds.includes('Bn9oK3hxqo7jgBtPk')
    ) {
      return null;
    }

    let account = await models.CustomerAccounts.findOne({
      customerId
    });

    if (!account) {
      account = await models.CustomerAccounts.create({
        customerId,
        balance: 200000
      });
    }

    return account;
  },

  getAccount: async (_root, {}, { models, cpUser, subdomain }: IContext) => {
    if (!cpUser) {
      throw new Error('login required');
    }

    const user = await sendClientPortalMessage({
      subdomain,
      action: 'clientPortalUsers.findOne',
      data: {
        _id: cpUser.userId
      },
      isRPC: true,
      defaultValue: null
    });

    if (!user) {
      throw new Error('user not found');
    }

    let account = await models.CustomerAccounts.findOne({
      customerId: user.erxesCustomerId
    });

    if (!account) {
      account = await models.CustomerAccounts.create({
        customerId: user.erxesCustomerId,
        balance: 200000
      });
    }

    return account;
  },

  getEbarimt: async (
    _root,
    { topupId, companyRegNumber, companyName },
    { models, cpUser, subdomain }: IContext
  ) => {
    if (!cpUser) {
      throw new Error('login required');
    }

    const user = await sendClientPortalMessage({
      subdomain,
      action: 'clientPortalUsers.findOne',
      data: {
        _id: cpUser.userId
      },
      isRPC: true,
      defaultValue: null
    });

    if (!user) {
      throw new Error('user not found');
    }

    let account = await models.CustomerAccounts.findOne({
      customerId: user.erxesCustomerId
    });

    if (!account) {
      account = await models.CustomerAccounts.create({
        customerId: user.erxesCustomerId,
        balance: 200000
      });
    }

    const topup = await models.Topups.findOne({ _id: topupId });

    if (!topup) {
      throw new Error('topup history not found');
    }

    if (topup.customerId !== user.erxesCustomerId) {
      throw new Error('topup history not found');
    }

    const product = await sendCommonMessage({
      serviceName: 'products',
      subdomain,
      action: 'findOne',
      data: {
        code: 'TT0001'
      },
      isRPC: true,
      defaultValue: null
    });

    if (!product) {
      throw new Error('product not configured');
    }

    const date = new Date(topup.createdAt);

    const orderInfo = {
      number: topup._id,
      date:
        date.toISOString().split('T')[0] +
        ' ' +
        date.toTimeString().split(' ')[0],
      orderId: topup._id,
      hasVat: true,
      hasCityTax: false,
      billType: companyRegNumber ? '3' : '1',
      customerCode: companyRegNumber,
      customerName: companyName,
      description: '',
      details: [
        {
          productId: product._id,
          amount: topup.amount,
          count: 1,
          inventoryCode: product.code,
          discount: 0
        }
      ]
    };

    const productsById: any = {};

    productsById[product._id] = product;

    const config = {
      districtName: 'Сүхбаатар',
      vatPercent: 10,
      cityTaxPercent: 0,
      defaultGSCode: '6601200',
      companyRD: '6906192' // production companyRD
      // companyRD: '0000038' // test companyRD
    };

    const ebarimtData = await sendCommonMessage({
      serviceName: 'ebarimt',
      subdomain,
      action: 'putresponses.putData',
      data: {
        orderInfo: { ...orderInfo },
        productsById,
        contentType: 'tumentech_topups',
        contentId: topup._id,
        config
      },
      isRPC: true,
      defaultValue: null
    });

    if (!ebarimtData) {
      throw new Error('ebarimt data not found');
    }

    await models.Topups.updateOne(
      { _id: topup._id },
      { $set: { ebarimtData: JSON.stringify(ebarimtData) } }
    );

    return ebarimtData;
  }
};

export default tripsQuery;
