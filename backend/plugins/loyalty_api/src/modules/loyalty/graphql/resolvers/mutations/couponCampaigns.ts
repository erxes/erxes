import { checkPermission } from 'erxes-api-shared/core-modules';
import { IContext } from '~/connectionResolvers';
import { ICouponCampaign } from '~/modules/loyalty/@types/couponCampaigns';

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

checkPermission(
  couponCampaignMutations,
  'couponCampaignAdd',
  'manageLoyalties',
);
checkPermission(
  couponCampaignMutations,
  'couponCampaignEdit',
  'manageLoyalties',
);
checkPermission(
  couponCampaignMutations,
  'couponCampaignsRemove',
  'manageLoyalties',
);

export default couponCampaignMutations;
