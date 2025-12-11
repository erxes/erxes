import { checkPermission } from 'erxes-api-shared/core-modules';
import { paginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { ICommonParams } from '~/modules/loyalty/@types/common';

const generateFilter = (params: ICommonParams) => {
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
  return filter;
};

const donateQueries = {
  async donates(_root, params: ICommonParams, { models }: IContext) {
    const filter: any = generateFilter(params);
    return paginate(models.Donates.find(filter), params);
  },

  async donatesMain(_root, params: ICommonParams, { models }: IContext) {
    const filter: any = generateFilter(params);

    const list = await paginate(models.Donates.find(filter), params);

    const totalCount = await models.Donates.find(filter).countDocuments();

    return {
      list,
      totalCount,
    };
  },
};

checkPermission(donateQueries, 'donatesMain', 'showLoyalties', {
  list: [],
  totalCount: 0,
});

export default donateQueries;
