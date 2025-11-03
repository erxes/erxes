import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { ISpinParams } from '~/modules/spin/@types/spin';

const generateFilter = (params: ISpinParams) => {
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

export const spinQueries = {
  async getSpins(_root, params: ISpinParams, { models }: IContext) {
    const filter: any = generateFilter(params);

    return await cursorPaginate({
      model: models.Spin,
      params,
      query: filter,
    });
  },
};
