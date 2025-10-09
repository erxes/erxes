import { getPureDate } from 'erxes-api-shared/utils';

export const checkSlotStatus = async (models, config, slots) => {
  const now = getPureDate(new Date());

  const slotCodes = slots.map((s) => s.code);

  const activeOrders = await models.Orders.find({
    posToken: config.token,
    slotCode: { $in: slotCodes },
    $or: [
      { paidDate: { $exists: false } },
      { paidDate: null },
      { $and: [{ isPre: true, dueDate: { $gte: now } }] },
    ],
  }).lean();

  for (const slot of slots) {
    slot.status = 'available';

    const preOrders = activeOrders.filter(
      (o) =>
        o.slotCode === slot.code &&
        o.isPre &&
        new Date(o.dueDate).getTime() > now.getTime(),
    );
    const currentOrder = activeOrders.find(
      (o) => o.slotCode === slot.code && !o.isPre,
    );

    if (preOrders.length) {
      slot.status = 'reserved';
      slot.isPreDates = preOrders
        .map((po) => ({ _id: po._id, dueDate: po.dueDate }))
        .sort((a, b) => {
          return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        });
    }

    if (currentOrder) {
      slot.status = 'serving';
    }
  }

  return slots;
};
