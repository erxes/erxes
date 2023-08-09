import { paginate } from '@erxes/api-utils/src/core';
import { IContext } from '../../../connectionResolver';

const coverQueries = {
  async covers(_root, params, { models, config, posUser }: IContext) {
    const selector: any = { posToken: config.token };

    if (params.userId) {
      selector.userId = params.userId;
    }

    if (!config.adminIds.includes(posUser._id)) {
      selector.userId = posUser._id;
    }

    if (params.startDate) {
      selector.beginDate = { $gte: params.startDate };
    }

    if (params.endDate) {
      selector.endDate = { $lte: params.endDate };
    }

    return paginate(
      models.Covers.find(selector)
        .sort({ createdAt: -1 })
        .lean(),
      {
        ...params
      }
    );
  },

  async coverDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return await models.Covers.findOne({ _id }).lean();
  },

  async coverAmounts(
    _root,
    { _id, endDate }: { _id: string; endDate: Date },
    { models, posUser, config }: IContext
  ) {
    if (endDate > new Date()) {
      throw new Error('Must be a date forward from now');
    }

    const filter: any = { posToken: config.token, userId: posUser._id };
    if (_id) {
      filter._id = { $ne: _id };
    }

    let lastCover = await models.Covers.findOne(filter)
      .sort({ endDate: -1 })
      .lean();
    if (!lastCover) {
      lastCover = {};
    }

    const startDate = lastCover.endDate;
    const orderFilter: any = { posToken: config.token, userId: posUser._id };
    if (startDate) {
      orderFilter.paidDate = { $gte: startDate, $lte: endDate };
    } else {
      orderFilter.paidDate = { $lte: endDate };
    }

    const orders = await models.Orders.find(orderFilter).lean();

    const result: any = { startDate, endDate };

    for (const order of orders) {
      if (order.cashAmount) {
        result.cashAmount = (result.cashAmount || 0) + order.cashAmount;
      }

      if (order.mobileAmount) {
        result.mobileAmount = (result.mobileAmount || 0) + order.mobileAmount;
      }

      for (const paidAmount of order.paidAmounts || []) {
        result[paidAmount.type] =
          (result[paidAmount.type] || 0) + paidAmount.amount;
      }
    }

    return result;
  }
};

export default coverQueries;
