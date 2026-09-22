import { IOrderInput } from '~/modules/posclient/@types/types';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import {
  applyDiscountInfo,
  ensureHandDiscountInfo,
  recalculateDiscountFields,
} from './discountInfos';

type LoyaltyDiscount = {
  voucherId?: string;
  potentialBonus?: number;
  discount?: number;
};

type LoyaltyResponse = Record<string, LoyaltyDiscount>;

export const checkLoyalties = async (subdomain: string, doc: IOrderInput) => {
  if (!doc.couponCode && !doc.voucherId && !doc.customerId) {
    return doc;
  }

  let loyalties: LoyaltyResponse = {};
  try {
    loyalties = await sendTRPCMessage({
      subdomain,
      pluginName: 'loyalty',
      module: 'loyalty',
      action: 'checkLoyalties',
      input: {
        ownerType: doc.customerType || 'customer',
        ownerId: doc.customerId,
        products: [
          ...doc.items.map((i) => ({
            productId: i.productId,
            quantity: i.count,
            unitPrice: i.unitPrice,
          })),
        ],
        discountInfo: {
          couponCode: doc.couponCode,
          voucherId: doc.voucherId,
        },
      },
      defaultValue: {},
    });
  } catch (e) {
    throw new Error(e.message);
  }

  for (const item of doc.items || []) {
    const loyalty = loyalties[item.productId];
    item.unitPrice = item.unitPrice || 0;
    item.discountInfos = ensureHandDiscountInfo(item);

    if (loyalty) {
      if (loyalty.potentialBonus) {
        item.bonusVoucherId = loyalty.voucherId;

        if (item.count > loyalty.potentialBonus) {
          const discountPercent =
            100 -
            ((item.count - loyalty.potentialBonus) / (item.count || 1)) * 100;
          item.bonusCount = loyalty.potentialBonus;
          applyDiscountInfo(item, {
            type: 'voucher',
            title: 'Voucher bonus',
            amount: loyalty.potentialBonus * item.unitPrice,
            percent: discountPercent,
          });
          item.unitPrice =
            (item.unitPrice * (item.count - loyalty.potentialBonus)) /
            (item.count || 1);
        } else {
          item.bonusCount = item.count;
          applyDiscountInfo(item, {
            type: 'voucher',
            title: 'Voucher bonus',
            amount: item.count * item.unitPrice,
            percent: 100,
          });
          item.unitPrice = 0;
        }
      } else {
        const discountPercent = loyalty.discount || 0;
        applyDiscountInfo(item, {
          type: 'voucher',
          title: 'Loyalty discount',
          amount: ((item.count * item.unitPrice) / 100) * discountPercent,
          percent: discountPercent,
        });
        item.unitPrice =
          item.unitPrice - (item.unitPrice / 100) * discountPercent;
      }
    } else {
      recalculateDiscountFields(item);
    }
  }

  return doc;
};
