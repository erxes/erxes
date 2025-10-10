import { IOrderInput } from '~/modules/posclient/@types/types';
// import { sendLoyaltiesMessage } from '../../messageBroker';

export const checkLoyalties = async (subdomain: string, doc: IOrderInput) => {
  if (!doc.couponCode && !doc.voucherId && !doc.customerId) {
    return doc;
  }

  let loyalties: any = {};
  try {
    // loyalties = await sendLoyaltiesMessage({
    //   subdomain,
    //   action: 'checkLoyalties',
    //   data: {
    //     ownerType: doc.customerType || 'customer',
    //     ownerId: doc.customerId,
    //     products: [
    //       ...doc.items.map((i) => ({
    //         productId: i.productId,
    //         quantity: i.count,
    //         unitPrice: i.unitPrice,
    //       })),
    //     ],
    //     discountInfo: {
    //       couponCode: doc.couponCode,
    //       voucherId: doc.voucherId,
    //     },
    //   },
    //   isRPC: true,
    //   defaultValue: {},
    // });
  } catch (e) {
    throw new Error(e.message);
  }

  for (const item of doc.items || []) {
    const loyalty = loyalties[item.productId];
    item.unitPrice = item.unitPrice || 0;

    if (loyalty) {
      if (loyalty.potentialBonus) {
        item.bonusVoucherId = loyalty.voucherId;

        if (item.count > loyalty.potentialBonus) {
          item.discountPercent =
            100 -
            ((item.count - loyalty.potentialBonus) / (item.count || 1)) * 100;
          item.bonusCount = loyalty.potentialBonus;
          item.discountAmount = loyalty.potentialBonus * item.unitPrice;
          item.unitPrice =
            (item.unitPrice * (item.count - loyalty.potentialBonus)) /
            (item.count || 1);
        } else {
          item.discountPercent = 100;
          item.bonusCount = item.count;
          item.discountAmount = item.count * item.unitPrice;
          item.unitPrice = 0;
        }
      } else {
        item.discountPercent = loyalty.discount;
        item.discountAmount =
          ((item.count * item.unitPrice) / 100) * loyalty.discount;
        item.unitPrice =
          item.unitPrice - (item.unitPrice / 100) * loyalty.discount;
      }
    }
  }

  return doc;
};
