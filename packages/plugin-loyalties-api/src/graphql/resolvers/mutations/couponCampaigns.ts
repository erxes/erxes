import { checkPermission } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { ICouponCampaign } from '../../../models/definitions/couponCampaigns';

const couponCampaignMutations = {
  couponCampaignAdd: async (
    _root,
    doc: ICouponCampaign,
    { models, user }: IContext,
  ) => {
    return await models.CouponCampaigns.createCouponCampaign(doc, user);
  },

  couponCampaignEdit: async (
    _root,
    { _id, ...doc }: ICouponCampaign & { _id: string },
    { models, user }: IContext,
  ) => {
    return await models.CouponCampaigns.updateCouponCampaign(_id, doc, user);
  },

  couponCampaignsRemove: async (
    _root,
    { _ids }: { _ids: string[] },
    { models }: IContext,
  ) => {
    return await models.CouponCampaigns.removeCouponCampaigns(_ids);
  },
};

checkPermission(couponCampaignMutations, 'couponCampaignAdd', 'manageLoyalties');
checkPermission(couponCampaignMutations, 'couponCampaignEdit', 'manageLoyalties');
checkPermission(couponCampaignMutations, 'couponCampaignsRemove', 'manageLoyalties');

export default couponCampaignMutations;
