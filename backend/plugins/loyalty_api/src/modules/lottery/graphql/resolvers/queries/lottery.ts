import { ILotteryDocument, ILotteryParams } from '@/lottery/@types/lottery';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { ICommonParams } from '~/utils';

export interface ILotteryMainParams extends ICommonParams {
  voucherCampaignId?: string;
}

const generateFilter = (params: ILotteryParams | ILotteryMainParams) => {
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

  if ((params as ILotteryParams).voucherCampaignId) {
    filter.voucherCampaignId = (params as ILotteryParams).voucherCampaignId;
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

  async lotteriesMain(
    _root: undefined,
    params: ILotteryMainParams,
    { models }: IContext,
  ) {
    const {
      page = 1,
      perPage = 20,
      sortField = 'createdAt',
      sortDirection = -1,
    } = params;

    const filter = generateFilter(params);

    const totalCount = await models.Lotteries.countDocuments(filter);
    const list = await models.Lotteries.find(filter)
      .sort({ [sortField]: sortDirection })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .lean();

    return { list, totalCount };
  },
};
