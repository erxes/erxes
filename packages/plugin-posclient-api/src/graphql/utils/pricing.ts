import { sendPricingMessage } from '../../messageBroker';
import { IConfigDocument } from '../../models/definitions/configs';
import { IOrderInput } from '../types';

export const checkPricing = async (
  subdomain: string,
  doc: IOrderInput,
  config: IConfigDocument
) => {
  let pricing: any = {};

  try {
    pricing = await sendPricingMessage({
      subdomain,
      action: 'checkPricing',
      data: {
        prioritizeRule: 'exclude',
        totalAmount: doc.totalAmount,
        departmentId: config.departmentId,
        branchId: config.branchId,
        products: [
          ...doc.items.map(i => ({
            productId: i.productId,
            quantity: i.count,
            price: i.unitPrice,
            manufacturedDate: '1670901' // i.manufacturedDate,
          }))
        ]
      },
      isRPC: true,
      defaultValue: {}
    });
  } catch (e) {
    console.log(e.message);
  }

  let bonusProductsToAdd: any = {};

  for (const item of doc.items || []) {
    const discount = pricing[item.productId];

    if (discount) {
      if (discount.bonusProducts.length !== 0) {
        for (const bonusProduct of discount.bonusProducts) {
          if (bonusProductsToAdd[bonusProduct]) {
            bonusProductsToAdd[bonusProduct].count += 1;
          } else {
            bonusProductsToAdd[bonusProduct] = {
              count: 1
            };
          }
        }
      }
      if (discount.type === 'percentage') {
        item.discountPercent = parseFloat(
          ((discount.value / item.unitPrice) * 100).toFixed(2)
        );
        item.unitPrice -= discount.value;
      } else {
        item.discountAmount = discount.value;
        item.unitPrice -= discount.value;
      }
    }
  }

  for (const bonusProductId of Object.keys(bonusProductsToAdd)) {
    const orderIndex = doc.items.findIndex(
      (docItem: any) => docItem.productId === bonusProductId
    );

    if (orderIndex === -1) {
      const bonusProduct: any = {
        productId: bonusProductId,
        unitPrice: 0,
        count: bonusProductsToAdd[bonusProductId].count
      };

      doc.items.push(bonusProduct);
    } else {
      const item = doc.items[orderIndex];

      item.bonusCount = bonusProductsToAdd[bonusProductId].count;

      if ((item.bonusCount || 0) > item.count) {
        item.count = item.bonusCount || 0;
      }
      item.unitPrice = Math.floor(
        (item.unitPrice * (item.count - (item.bonusCount || 0))) / item.count
      );
    }
  }

  return doc;
};
