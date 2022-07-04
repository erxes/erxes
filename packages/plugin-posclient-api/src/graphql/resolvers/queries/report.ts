import { ORDER_STATUSES } from '../../../models/definitions/constants';
import { generateOrderNumber } from '../../utils/orderUtils';
import { IContext } from '../../types';

const reportQueries = {
  async dailyReport(
    _root,
    { posUserIds, posNumber }: { posUserIds: string[]; posNumber?: string },
    { models }: IContext
  ) {
    const report: any = {};

    let beginNumber: any = posNumber;

    if (!beginNumber) {
      const tempNumber = await generateOrderNumber(models);
      beginNumber = tempNumber.split('_')[0];
    }

    const orderQuery = {
      paidDate: { $ne: null },
      status: { $in: ORDER_STATUSES.FULL },
      number: { $regex: new RegExp(beginNumber) },
      posToken: { $in: ['', null] }
    };
    const users = await models.PosUsers.find({
      _id: { $in: posUserIds }
    }).lean();

    for (const user of users) {
      const ordersAmounts = await models.Orders.aggregate([
        { $match: { ...orderQuery, userId: user._id } },
        {
          $project: {
            cardAmount: '$cardAmount',
            cashAmount: '$cashAmount',
            mobileAmount: '$mobileAmount',
            totalAmount: '$totalAmount'
          }
        },
        {
          $group: {
            _id: '',
            cardAmount: { $sum: '$cardAmount' },
            cashAmount: { $sum: '$cashAmount' },
            mobileAmount: { $sum: '$mobileAmount' },
            totalAmount: { $sum: '$totalAmount' }
          }
        }
      ]);

      const orders = await models.Orders.find({
        ...orderQuery,
        userId: user._id
      }).lean();
      const orderIds = orders.map(o => o._id);
      const groupedItems = await models.OrderItems.aggregate([
        { $match: { orderId: { $in: orderIds } } },
        {
          $project: {
            productId: '$productId',
            count: '$count'
          }
        },
        {
          $group: {
            _id: '$productId',
            count: { $sum: '$count' }
          }
        }
      ]);

      const productIds = groupedItems.map(g => g._id);
      const products = await models.Products.find(
        { _id: { $in: productIds } },
        { _id: 1, code: 1, name: 1, categoryId: 1 }
      ).lean();
      const productCategories = await models.ProductCategories.find(
        { _id: { $in: products.map(p => p.categoryId) } },
        { _id: 1, code: 1, name: 1 }
      )
        .sort({ order: 1 })
        .lean();

      const productById = {};
      for (const product of products) {
        productById[product._id] = product;
      }

      const categoryById = {};
      for (const productCategory of productCategories) {
        categoryById[productCategory._id] = productCategory;
      }

      const items = {};
      for (const groupedItem of groupedItems) {
        const product = productById[groupedItem._id];
        const category = categoryById[product.categoryId];

        if (!Object.keys(items).includes(category._id)) {
          items[category._id] = {
            code: category.code,
            name: category.name,
            products: []
          };
        }

        items[category._id].products.push({
          name: product.name,
          code: product.code,
          unitPrice: product.unitPrice,
          count: groupedItem.count
        });
      }

      report[user._id] = {
        user,
        ordersAmounts: { ...(ordersAmounts || [{}])[0], count: orders.length },
        items
      };
    }

    return {
      report
    };
  }
};

export default reportQueries;
