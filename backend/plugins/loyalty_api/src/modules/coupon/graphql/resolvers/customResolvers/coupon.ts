import { IContext } from '~/connectionResolvers';
import { OWNER_TYPES } from '~/constants';
import { ICouponDocument } from '~/modules/coupon/@types/coupon';

export const Coupon = {
  async __resolveReference(
    { _id }: ICouponDocument,
    _: undefined,
    { models }: IContext,
  ) {
    return models.Coupon.findOne({ _id }).lean();
  },

  async owner({ ownerId, ownerType }: ICouponDocument) {
    if (!ownerId || !ownerType) return null;

    if (ownerType === OWNER_TYPES.CUSTOMER) {
      return { __typename: 'Customer', _id: ownerId };
    }

    if (ownerType === OWNER_TYPES.MEMBER) {
      return { __typename: 'User', _id: ownerId };
    }

    if (ownerType === OWNER_TYPES.COMPANY) {
      return { __typename: 'Company', _id: ownerId };
    }

    if (ownerType === OWNER_TYPES.CPUSER) {
      return { __typename: 'ClientPortalUser', _id: ownerId };
    }

    return null;
  },

  async campaign({ campaignId }: ICouponDocument) {
    return { __typename: 'CouponCampaign', _id: campaignId };
  },

  async createdBy({ createdBy }: ICouponDocument) {
    return { __typename: 'User', _id: createdBy };
  },

  async updatedBy({ updatedBy }: ICouponDocument) {
    return { __typename: 'User', _id: updatedBy };
  },
};
