import { IContext } from '~/connectionResolvers';

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
    { models, __, checkPermission }: IContext,
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
    return models.PosOrders.findOne({ _id }).lean();
  },
};

export default orderMutations;
