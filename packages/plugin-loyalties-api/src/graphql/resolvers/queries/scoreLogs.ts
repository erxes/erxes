import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { ICommonParams } from '../../../models/definitions/common';

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
    return paginate(
      models.ScoreLogs.find(filter).sort({ createdAt: -1 }),
      params
    );
  },
  async scoreLogList(_root, params: ICommonParams, { models }: IContext) {
    const list = await models.ScoreLogs.find().sort({ createdAt: -1 });
    const total = await models.ScoreLogs.find().count();
    return { list, total };
  }
};

export default scoreLogQueries;
