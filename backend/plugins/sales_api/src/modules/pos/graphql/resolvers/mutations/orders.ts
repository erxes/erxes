import { IContext } from '~/connectionResolvers';
import { spendOrderPoints } from '~/modules/pos/utils';

const orderMutations = {
  async posOrderChangePayments(
    _root,
    {
      _id,
      cashAmount,
      mobileAmount,
      paidAmounts,
    }: {
      _id: string;
      cashAmount: number;
      mobileAmount: number;
      paidAmounts: { type: string; amount: number }[];
    },
    { models, subdomain, user, checkPermission }: IContext,
  ) {
    await checkPermission('posOrderChangePayments');
    const order = await models.PosOrders.findOne({ _id }).lean();
    if (!order) {
      throw new Error('not found order');
    }

    if (order.status === 'return') {
      throw new Error('Already returned');
    }

    if (
      order.totalAmount !==
      cashAmount +
      mobileAmount +
      (paidAmounts || []).reduce(
        (sum, i) => Number(sum) + Number(i.amount),
        0,
      )
    ) {
      throw new Error('not balanced');
    }

    await models.PosOrders.updateOrder(
      { _id },
      { ...order, cashAmount, mobileAmount, paidAmounts },
    );
    const updated = await models.PosOrders.findOne({ _id }).lean();

    // A changed point payment changes what was spent.
    if (updated) {
      await spendOrderPoints(subdomain, models, updated, user?._id);
    }

    return updated;
  },
};

export default orderMutations;
