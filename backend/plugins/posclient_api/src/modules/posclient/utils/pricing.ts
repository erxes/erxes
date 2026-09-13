import { IConfigDocument } from '~/modules/posclient/@types/configs';
import { IOrderInput, IOrderItemInput } from '~/modules/posclient/@types/types';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import {
  applyDiscountInfo,
  ensureHandDiscountInfo,
  recalculateDiscountFields,
} from './discountInfos';

type PricingDiscount = {
  value: number;
  bonusProducts: string[];
};

type PricingResponse = Record<string, PricingDiscount>;
type BonusProductsToAdd = Record<string, { count: number }>;

export const checkPricing = async (
  subdomain: string,
  doc: IOrderInput,
  config: IConfigDocument,
) => {
  let pricing: PricingResponse = {};

  try {
    pricing = await sendTRPCMessage({
      subdomain,
      pluginName: 'loyalty',
      module: 'pricing',
      action: 'checkPricing',
      input: {
        prioritizeRule: 'exclude',
        totalAmount: doc.totalAmount,
        departmentId: config.departmentId,
        branchId: config.branchId,
        customerType: doc.customerType,
        customerId: doc.customerId,
        brokerType: doc.brokerType || '',
        brokerId: doc.brokerId || '',
        products: [
          ...doc.items.map((i) => ({
            itemId: i._id,
            productId: i.productId,
            quantity: i.count,
            price: i.unitPrice,
            manufacturedDate: i.manufacturedDate,
          })),
        ],
      },
      defaultValue: {},
    });
  } catch (e) {}

  const bonusProductsToAdd: BonusProductsToAdd = {};

  for (const item of doc.items || []) {
    const discount = pricing[item._id];
    item.unitPrice = item.unitPrice || 0;
    item.discountInfos = ensureHandDiscountInfo(item);

    if (discount) {
      if (discount.bonusProducts.length !== 0) {
        for (const bonusProduct of discount.bonusProducts) {
          if (bonusProductsToAdd[bonusProduct]) {
            bonusProductsToAdd[bonusProduct].count += 1;
          } else {
            bonusProductsToAdd[bonusProduct] = {
              count: 1,
            };
          }
        }
      }

      applyDiscountInfo(item, {
        type: 'pricing',
        title: 'Pricing discount',
        amount: discount.value * item.count,
        percent: Number.parseFloat(
          ((discount.value / item.unitPrice) * 100).toFixed(2),
        ),
      });
      item.unitPrice -= discount.value;
    } else {
      recalculateDiscountFields(item);
    }
  }

  for (const bonusProductId of Object.keys(bonusProductsToAdd)) {
    const orderIndex = doc.items.findIndex(
      (docItem: IOrderItemInput) => docItem.productId === bonusProductId,
    );

    if (orderIndex === -1) {
      const bonusProduct: IOrderItemInput = {
        _id: bonusProductId,
        productId: bonusProductId,
        unitPrice: 0,
        count: bonusProductsToAdd[bonusProductId].count,
      };

      doc.items.push(bonusProduct);
    } else {
      const item = doc.items[orderIndex];
      item.unitPrice = item.unitPrice || 0;

      item.bonusCount = bonusProductsToAdd[bonusProductId].count;

      if ((item.bonusCount || 0) > item.count) {
        item.count = item.bonusCount || 0;
      }
      item.unitPrice = Math.floor(
        (item.unitPrice * (item.count - (item.bonusCount || 0))) / item.count,
      );
    }
  }

  return doc;
};
