import * as moment from 'moment';
import { IContext } from '../../connectionResolver';
import { IOrderDocument } from '../../models/definitions/orders';
import { IOrderItemDocument } from '../../models/definitions/orderItems';
import { IEbarimtDocument } from '../../models/definitions/putResponses';
import {
  sendCardsMessage,
  sendContactsMessage,
  sendCoreMessage
} from '../../messageBroker';
import { prepareEbarimtData } from '../utils/orderUtils';
import { IEbarimtConfig } from '../../models/definitions/configs';

export default {
  async items(order: IOrderDocument, { }, { models }: IContext) {
    return await models.OrderItems.find({ orderId: order._id }).lean();
  },

  async customer(order: IOrderDocument, _params, { subdomain }: IContext) {
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
        primaryEmail: company.primaryEmail,
        firstName: company.primaryName,
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
        primaryEmail: user.email,
        firstName: `${user.firstName || ''} ${user.lastName || ''}`,
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
      primaryEmail: customer.primaryEmail,
      firstName: customer.firstName,
      lastName: customer.lastName
    };
  },

  user(order: IOrderDocument, { }, { models }: IContext) {
    return models.PosUsers.findOne({ _id: order.userId });
  },

  async putResponses(order: IOrderDocument, { }, { models, config }: IContext) {
    if (order.billType === '9') {
      const items: IOrderItemDocument[] = await models.OrderItems.find({ orderId: order._id }).lean();

      const products = await models.Products.find({
        _id: { $in: items.map(item => item.productId) }
      });
      const productById = {};
      for (const product of products) {
        productById[product._id] = product;
      }

      return [
        {
          id: '',
          number: order.number,
          contentType: 'pos',
          contentId: order._id,
          posToken: config.token,
          totalAmount: order.totalAmount,
          totalVAT: 0,
          totalCityTax: 0,
          type: '9',
          status: 'SUCCESS',
          qrData: '',
          lottery: '',
          date: moment(order.paidDate).format('yyyy-MM-dd hh:mm:ss'),

          cashAmount: order.cashAmount || 0,
          nonCashAmount: order.totalAmount - (order.cashAmount || 0),
          registerNo: '',
          customerNo: '',
          customerName: '',

          receipts: [{
            _id: Math.random(),
            id: Math.random(),
            totalAmount: order.totalAmount,
            totalVAT: 0,
            totalCityTax: 0,
            taxType: 'NO_VAT',
            items: items.map(item => ({
              _id: item._id,
              id: item.id,
              name: productById[item.productId].shortName || productById[item.productId].name,
              measureUnit: productById[item.productId].uom || 'ш',
              qty: item.count,
              unitPrice: item.unitPrice,
              totalAmount: (item.unitPrice || 0) * item.count,
              totalVAT: 0,
              totalCityTax: 0,
              totalBonus: item.discountAmount,
            })),
          }],
          payments: [
            {}
          ],

        }
      ];
    }

    const putResponses: IEbarimtDocument[] = await models.PutResponses.find(
      {
        contentType: 'pos',
        contentId: order._id,
        status: { $ne: 'inactive' }
      }
    )
      .sort({ createdAt: -1 })
      .lean();

    if (!putResponses.length) {
      return [];
    }

    const excludeIds: string[] = [];
    for (const falsePR of putResponses.filter(pr => pr.status === 'ERROR')) {
      for (const truePR of putResponses.filter(pr => pr.status === 'SUCCESS')) {
        if (
          falsePR.sendInfo &&
          truePR.sendInfo &&
          falsePR.sendInfo.amount === truePR.sendInfo.amount &&
          falsePR.sendInfo.vat === truePR.sendInfo.vat &&
          falsePR.sendInfo.taxType === truePR.sendInfo.taxType
        ) {
          excludeIds.push(falsePR._id);
        }
      }
    }

    const innerItems = await models.OrderItems.find({
      orderId: order._id,
      isInner: true
    }).lean();

    if (innerItems && innerItems.length) {
      const products = await models.Products.find({
        _id: { $in: innerItems.map(i => i.productId) }
      });
      const productsById = {};
      for (const product of products) {
        productsById[product._id] = product;
      }
      const putData = await prepareEbarimtData(
        models,
        order,
        {
          ...config.ebarimtConfig as IEbarimtConfig
        });

      const response = {
        _id: Math.random(),
        billId: 'Түр баримт',
        ...(putData),
        registerNo: config.ebarimtConfig?.companyRD || ''
      };

      putResponses.push(response as any);
    }

    return putResponses.filter(pr => !excludeIds.includes(pr._id));
  },

  async deal(order: IOrderDocument, { }, { subdomain }: IContext) {
    if (!order.convertDealId) {
      return null;
    }

    return await sendCardsMessage({
      subdomain,
      action: 'deals.findOne',
      data: { _id: order.convertDealId }
    });
  },

  async dealLink(order: IOrderDocument, { }, { subdomain }: IContext) {
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
