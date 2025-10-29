import { LOYALTY_CONDITIONS, OWNER_TYPES, TARGET } from '~/@types';
import { IModels } from '~/connectionResolvers';

type LoyaltyContext = {
  discount: {
    voucherId?: string;
    couponCode?: string;
  };
  targets: TARGET[];
  ownerId: string;
  ownerType: OWNER_TYPES;
};

const validateCampaignConditions = (
  targets: TARGET[],
  conditions?: LOYALTY_CONDITIONS,
) => {
  if (!conditions) {
    return;
  }

  const {
    categoryIds = [],
    excludeCategoryIds = [],
    productIds = [],
    excludeProductIds = [],
    tagIds = [],
    excludeTagIds = [],
  } = conditions || {};

  const targetIds = targets.map((target) => target._id);
};

export const checkLoyalty = async (
  context: LoyaltyContext,
  models: IModels,
) => {
  const { discount, ownerId, ownerType, targets } = context;

  const loyalties: { [key: string]: number } = {};

  for (const discountKey in discount) {
    const discountValue = discount[discountKey];

    if (!discountValue) {
      continue;
    }

    if (discountKey === 'voucherId') {
      const { type, amount, conditions } = await models.Voucher.checkVoucher({
        voucherId: discountValue,
        ownerId,
        ownerType,
      });

      validateCampaignConditions(targets, conditions);

      loyalties[type] = (loyalties[type] || 0) + amount;
    }

    // if (discountKey === 'couponCode') {
    //   const coupon = await models.Coupon.checkCoupon(discountValue);

    //   const { type, amount } = await models.CouponCampaign.getCampaign(
    //     coupon.campaignId,
    //   );

    //   loyalties[type] = (loyalties[type] || 0) + amount;
    // }
  }

  return loyalties;
};
