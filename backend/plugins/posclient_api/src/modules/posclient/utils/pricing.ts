import { nanoid } from 'nanoid';
import { IConfigDocument } from '~/modules/posclient/@types/configs';
import { IOrderInput, IOrderItemInput } from '~/modules/posclient/@types/types';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import {
  IPricingReason,
  applyDiscountInfo,
  ensureHandDiscountInfo,
  recalculateDiscountFields,
} from './discountInfos';

type PricingDiscount = {
  value: number;
  bonusProducts: string[];
  reasons?: IPricingReason[];
};

// The plans behind a line's discount, by name, so the cashier can tell why.
const pricingTitle = (reasons: IPricingReason[] = []) =>
  [
    ...new Set(
      reasons
        .filter(({ kind, value }) => kind === 'discount' && value !== 0)
        .map(({ planName }) => planName)
        .filter(Boolean),
    ),
  ].join(' + ') || 'Pricing discount';

type PricingResponse = Record<string, PricingDiscount>;
type BonusProductsToAdd = Record<string, { count: number }>;

export const checkPricing = async (
  subdomain: string,
  doc: IOrderInput,
  config: IConfigDocument,
): Promise<IOrderInput> => {
  let pricing: PricingResponse = {};

  try {
    pricing = await sendTRPCMessage({
      subdomain,
      pluginName: 'loyalty',
      module: 'pricing',
      action: 'checkPricing',
      input: {
        // Checkout is now; the plan picks which moment its schedule reads.
        orderCreatedAt: doc.createdAt?.toISOString(),
        prioritizeRule: 'exclude',
        totalAmount: doc.totalAmount,
        branchId: config.branchId || '',
        departmentId: config.departmentId || '',
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
            conditionCode: i.conditionCode,
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

      const reasons = (discount.reasons || []).filter(
        ({ kind }) => kind === 'discount',
      );

      applyDiscountInfo(item, {
        type: 'pricing',
        title: pricingTitle(reasons),
        ...(reasons.length ? { reasons } : {}),
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
    // Keep paid quantities and prices intact, even for the same product.
    // Generated lines are rebuilt by prepareOrderDoc on every save.
    const bonusProduct: IOrderItemInput = {
      _id: nanoid(),
      productId: bonusProductId,
      unitPrice: 0,
      count: bonusProductsToAdd[bonusProductId].count,
      isPackage: true,
    };

    doc.items.push(bonusProduct);
  }

  return doc;
};
