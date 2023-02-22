import * as moment from 'moment';
import { IContext } from '../../connectionResolver';
import { IOrderDocument } from '../../models/definitions/orders';
import { IOrderItem } from '../../models/definitions/orderItems';
import { IPutResponseDocument } from '../../models/definitions/putResponses';
import { sendContactsMessage } from '../../messageBroker';

export default {
  async items(order: IOrderDocument, {}, { models }: IContext) {
    return await models.OrderItems.find({ orderId: order._id }).lean();
  },

  async customer(order: IOrderDocument, _params, { subdomain }: IContext) {
    if (!order.customerId) {
      return null;
    }

    return sendContactsMessage({
      subdomain,
      action: 'customers.findOne',
      data: { _id: order.customerId },
      isRPC: true
    });
  },

  user(order: IOrderDocument, {}, { models }: IContext) {
    return models.PosUsers.findOne({ _id: order.userId });
  },

  async putResponses(order: IOrderDocument, {}, { models }: IContext) {
    if (order.billType === '9') {
      const items: IOrderItem[] =
        (await models.OrderItems.find({ orderId: order._id }).lean()) || [];
      const products = await models.Products.find({
        _id: { $in: items.map(item => item.productId) }
      });
      const productById = {};
      for (const product of products) {
        productById[product._id] = product;
      }

      return [
        {
          contentType: 'pos',
          contentId: order._id,
          number: order.number,
          success: 'true',
          billId: '',
          date: moment(order.paidDate).format('yyyy-MM-dd hh:mm:ss'),
          macAddress: '',
          internalCode: '',
          billType: '9',
          lotteryWarningMsg: '',
          errorCode: '',
          message: '',
          getInformation: '',
          taxType: '1',
          qrData: '',
          lottery: '',
          sendInfo: {},
          status: '',
          stocks: items.map(item => ({
            code: productById[item.productId].code,
            name: productById[item.productId].name,
            measureUnit: productById[item.productId].sku || 'ш',
            qty: item.count,
            unitPrice: item.unitPrice,
            totalAmount: (item.unitPrice || 0) * item.count,
            vat: '0.00',
            cityTax: '0.00',
            discount: item.discountAmount
          })),
          amount: order.totalAmount,
          vat: 0,
          cityTax: 0,
          cashAmount: order.cashAmount || 0,
          nonCashAmount: order.totalAmount - (order.cashAmount || 0),
          registerNo: '',
          customerNo: '',
          customerName: ''
        }
      ];
    }

    const putResponses: IPutResponseDocument[] = await models.PutResponses.find(
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
    for (const falsePR of putResponses.filter(pr => pr.success === 'false')) {
      for (const truePR of putResponses.filter(pr => pr.success === 'true')) {
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

    return putResponses.filter(pr => !excludeIds.includes(pr._id));
  }
};
