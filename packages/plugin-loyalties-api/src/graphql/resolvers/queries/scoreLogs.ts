import { ICommonParams, IScoreParams } from '../../../models/definitions/common';
import { IContext } from '../../../connectionResolver';
import { checkVouchersSale } from '../../../utils';
import { getOwner } from '../../../models/utils';
import { paginate } from '@erxes/api-utils/src';

const scoreLogQueries = {
  async scoreLogs(_root, params: ICommonParams, { models }: IContext) {
    const { ownerType, ownerId, searchValue } = params;
    const filter: any = {};

    if (ownerType) {
      filter.ownerType = ownerType;
    }

    if (ownerId) {
      filter.ownerId = ownerId;
    }

    if (searchValue) {
      filter.description = searchValue;
    }
    return paginate(models.ScoreLogs.find(filter).sort({ createdAt: -1 }), params)
  },
  async scoreLogList(_root, params: IScoreParams, { models }: IContext) {
    const result = models.ScoreLogs.getScoreLogs(params);
    return result;
  }
};

export default scoreLogQueries;
