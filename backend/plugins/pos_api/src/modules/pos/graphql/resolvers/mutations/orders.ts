import { sendTRPCMessage } from "erxes-api-shared/utils";
import { IContext } from "~/connectionResolvers";
import { getConfig } from "~/modules/pos/utils";

const orderMutations = {
  async posOrderReturnBill(
    _root,
    { _id }: { _id: string; },
    { models }: IContext
  ) {
    const order = await models.PosOrders.findOne({ _id }).lean();
    if (!order) {
      throw new Error('not found order');
    }
    const pos = await models.Pos.findOne({ token: order.posToken }).lean();
    if (!pos) {
      throw new Error('not found pos');
    }
    if (order.status === 'return') {
      throw new Error('Already returned');
    }

    const ebarimtMainConfig = await getConfig('EBARIMT', {});

    await sendTRPCMessage({
      method: 'query',
      pluginName: 'ebarimt',
      module: 'putresponses',
      action: 'returnBill',
      input: {
        contentType: 'pos',
        contentId: _id,
        number: order.number,
        config: { ...pos.ebarimtConfig, ...ebarimtMainConfig },
      }
    });

    await sendTRPCMessage({
      method: 'mutation',
      pluginName: 'coreintegrations',
      module: 'syncerkhet',
      action: 'returnOrder',
      input: {
        pos,
        order,
      },
    });

    await models.PosOrders.deleteOne({ _id });
    return;
  },

  async posOrderChangePayments(
    _root,
    { _id, cashAmount, mobileAmount, paidAmounts }: { _id: string, cashAmount: number, mobileAmount: number, paidAmounts: { type: string; amount: number }[] },
    { models, __ }: IContext
  ) {
    const order = await models.PosOrders.findOne({ _id }).lean();
    if (!order) {
      throw new Error('not found order');
    }

    if (order.status === 'return') {
      throw new Error('Already returned');
    }

    if (order.totalAmount !==
      cashAmount +
      mobileAmount +
      (paidAmounts || []).reduce(
        (sum, i) => Number(sum) + Number(i.amount),
        0
      )) {
      throw new Error('not balanced');
    }

    await models.PosOrders.updateOne(
      { _id },
      { $set: __({ cashAmount, mobileAmount, paidAmounts }) }
    );
    return models.PosOrders.findOne({ _id }).lean();
  },
};

// checkPermission(orderMutations, 'posOrderReturnBill', 'manageOrders');
// checkPermission(orderMutations, 'posOrderChangePayments', 'manageOrders');
export default orderMutations;