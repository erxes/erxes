import { getPureDate } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { sendPosMessage } from '../../../messageBroker';

const configQueries = {
  async currentConfig(_root, _args, { models, config }: IContext) {
    if (!config) {
      const confCount = await models.Configs.find({
        status: { $ne: 'deleted' }
      }).count();

      if (!confCount) {
        return {};
      }

      if (confCount === 1) {
        return await models.Configs.findOne({
          status: { $ne: 'deleted' }
        }).lean();
      }

      throw new Error('not found currentConfig');
    }
    return config;
  },

  async posclientConfigs(_root, _args, { models }: IContext) {
    return models.Configs.find({ status: { $ne: 'deleted' } }).lean();
  },

  async poscSlots(_root, _args, { models, config }: IContext) {
    const slots = await models.PosSlots.find({ posId: config.posId }).lean();
    const now = getPureDate(new Date());

    const slotCodes = slots.map(s => s.code);

    const activeOrders = await models.Orders.find({
      posToken: config.token,
      slotCode: { $in: slotCodes },
      $or: [
        { paidDate: { $exists: false } },
        { paidDate: null },
        { $and: [{ isPre: true, dueDate: { $gte: now } }] }
      ]
    }).lean();

    for (const slot of slots) {
      slot.status = 'available';

      const preOrders = activeOrders.filter(
        o =>
          o.slotCode === slot.code &&
          o.isPre &&
          new Date(o.dueDate).getTime() > now.getTime()
      );
      const currentOrder = activeOrders.find(
        o => o.slotCode === slot.code && !o.isPre
      );

      if (preOrders.length) {
        slot.status = 'reserved';
        slot.isPreDates = preOrders
          .map(po => ({ _id: po._id, dueDate: po.dueDate }))
          .sort((a, b) => {
            return (
              new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
            );
          });
      }

      if (currentOrder) {
        slot.status = 'serving';
      }
    }
    return slots;
  },

  async getBranches(_root, _param, { subdomain, config }: IContext) {
    return await sendPosMessage({
      subdomain,
      action: 'ecommerceGetBranches',
      data: { posToken: config.token || '' },
      isRPC: true,
      defaultValue: []
    });
  }
};

export default configQueries;
