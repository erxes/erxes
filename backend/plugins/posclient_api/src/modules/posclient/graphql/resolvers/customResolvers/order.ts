import { IContext } from '@/posclient/@types/types';
import { IOrderItemDocument } from '~/modules/posclient/@types/orderItems';
import { IOrderDocument } from '~/modules/posclient/@types/orders';
import { IEbarimtDocument } from '~/modules/posclient/@types/putResponses';
import { fakePutData } from '@/posclient/utils/orderUtils';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

export default {
  async items(order: IOrderDocument, _params, { models }: IContext) {
    return await models.OrderItems.find({ orderId: order._id }).lean();
  },

  async customer(order: IOrderDocument, _params, { subdomain }: IContext) {
    if (!order.customerId) {
      return null;
    }

    if (order.customerType === 'visitor') {
      return null;
    }

    if (order.customerType === 'company') {
      const company = await sendTRPCMessage({
        method: 'query',
        pluginName: 'core',
        module: 'companies',
        action: 'findOne',
        input: { query: { _id: order.customerId } },
        defaultValue: {},
      });

      if (!company?._id) {
        return null;
      }
      return {
        _id: company._id,
        code: company.code,
        primaryPhone: company.primaryPhone,
        primaryEmail: company.primaryEmail,
        firstName: company.primaryName,
        lastName: '',
      };
    }

    if (order.customerType === 'user') {
      const user = await sendTRPCMessage({
        method: 'query',
        pluginName: 'core',
        module: 'users',
        action: 'findOne',
        input: { query: { _id: order.customerId } },
        defaultValue: {},
      });

      if (!user?._id) {
        return null;
      }
      return {
        _id: user._id,
        code: user.code,
        primaryPhone: user?.details?.operatorPhone || '',
        primaryEmail: user.email,
        firstName: `${user.firstName || ''} ${user.lastName || ''}`,
        lastName: user.username,
      };
    }
    const customer = await sendTRPCMessage({
      method: 'query',
      pluginName: 'core',
      module: 'customers',
      action: 'findOne',
      input: { query: { _id: order.customerId } },
      defaultValue: {},
    });

    if (!customer?._id) {
      return null;
    }

    return {
      _id: customer._id,
      code: customer.code,
      primaryPhone: customer.primaryPhone,
      primaryEmail: customer.primaryEmail,
      firstName: customer.firstName,
      lastName: customer.lastName,
    };
  },

  async user(order: IOrderDocument, _params, { models }: IContext) {
    return models.PosUsers.findOne({ _id: order.userId });
  },

  async putResponses(
    order: IOrderDocument,
    _params,
    { models, config }: IContext,
  ) {
    if (order.billType === '9') {
      const items: IOrderItemDocument[] = await models.OrderItems.find({
        orderId: order._id,
      }).lean();

      return [await fakePutData(models, items, order, config)];
    }

    const putResponses: IEbarimtDocument[] = await models.PutResponses.find({
      contentType: 'pos',
      contentId: order._id,
      status: { $ne: 'inactive' },
    })
      .sort({ createdAt: -1 })
      .lean();

    const excludeIds: string[] = [];
    for (const falsePR of putResponses.filter(
      (pr) => pr.status !== 'SUCCESS',
    )) {
      for (const truePR of putResponses.filter(
        (pr) => pr.status === 'SUCCESS',
      )) {
        if (
          falsePR.sendInfo &&
          truePR.sendInfo &&
          falsePR.sendInfo.totalAmount === truePR.sendInfo.totalAmount &&
          falsePR.sendInfo.totalVAT === truePR.sendInfo.totalVAT &&
          falsePR.sendInfo.type === truePR.sendInfo.type &&
          falsePR.sendInfo.receipts?.length === truePR.sendInfo.receipts?.length
        ) {
          excludeIds.push(falsePR._id);
        }
      }
    }

    const innerItems = await models.OrderItems.find({
      orderId: order._id,
      isInner: true,
    }).lean();

    if (innerItems?.length) {
      const response = await fakePutData(models, innerItems, order, config);
      putResponses.push(response as any);
    }

    return putResponses.filter((pr) => !excludeIds.includes(pr._id));
  },

  async deal(order: IOrderDocument, _params, { subdomain }: IContext) {
    if (!order.convertDealId) {
      return null;
    }

    return await sendTRPCMessage({
      method: 'query',
      pluginName: 'sales',
      module: 'deal',
      action: 'findOne',
      input: { _id: order.convertDealId },
      defaultValue: {},
    });
  },

  async dealLink(order: IOrderDocument, _params, { subdomain }: IContext) {
    if (!order.convertDealId) {
      return null;
    }

    return await sendTRPCMessage({
      method: 'query',
      pluginName: 'sales',
      module: 'deal',
      action: 'getLink',
      input: { _id: order.convertDealId, type: 'deal' },
      defaultValue: {},
    });
  },
};
