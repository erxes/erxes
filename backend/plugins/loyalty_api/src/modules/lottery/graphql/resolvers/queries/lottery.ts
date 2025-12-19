import { ILotteryParams } from '@/lottery/@types/lottery';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

const generateFilter = (params: ILotteryParams) => {
  const filter: any = {};

  if (params.campaignId) {
    filter.campaignId = params.campaignId;
  }

  if (params.status) {
    filter.status = params.status;
  }

  if (params.ownerType) {
    filter.ownerType = params.ownerType;
  }

  if (params.ownerId) {
    filter.ownerId = params.ownerId;
  }

  if (params.voucherCampaignId) {
    filter.voucherCampaignId = params.voucherCampaignId;
  }

  return filter;
};

export const lotteryQueries = {
  getLotteries: async (
    _parent: undefined,
    params: ILotteryParams,
    { models }: IContext,
  ) => {
    const filter = generateFilter(params);

    return cursorPaginate({
      model: models.Lottery,
      params,
      query: filter,
    });
  },
};
