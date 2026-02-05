import { ILotteryDocument, ILotteryParams } from '@/lottery/@types/lottery';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';

const generateFilter = (params: ILotteryParams) => {
  const filter: FilterQuery<ILotteryDocument> = {};

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
  async lotteries(
    _root: undefined,
    params: ILotteryParams,
    { models }: IContext,
  ) {
    const filter: FilterQuery<ILotteryDocument> = generateFilter(params);

    return cursorPaginate({
      model: models.Lotteries,
      params,
      query: filter,
    });
  },
};
