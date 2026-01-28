import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

export interface ICouponCampaignParams {
  status?: string;
  searchValue?: string;
  limit?: number;
  cursor?: string;
}

export const couponCampaignQueries = {
  getCouponCampaigns: async (
    _root: undefined,
    params: ICouponCampaignParams,
    { models }: IContext,
  ) => {
    const filter: any = {};

    if (params.searchValue) {
      filter.name = new RegExp(params.searchValue, 'i');
    }

    if (params.status) {
      filter.status = params.status;
    }

    return cursorPaginate({
      model: models.CouponCampaign,
      params,
      query: filter,
    });
  },

  getCouponCampaign: async (
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) => {
    return models.CouponCampaign.getCouponCampaign(_id);
  },
};
