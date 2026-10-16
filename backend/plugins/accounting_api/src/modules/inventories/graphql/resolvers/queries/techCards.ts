import { paginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import {
  ITechCardListParams,
  ITechCardOutputListParams,
  ITechCardOutputRow,
} from '../../../@types/techCards';
import {
  getTechCardFilter,
  getTechCardSort,
  getTechCardOutputsPipeline,
} from '../../../utils/techCardFilters';

const techCardQueries = {
  techCards: async (
    _root: undefined,
    params: ITechCardListParams,
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('readTechCards');

    const query = getTechCardFilter(params);
    const sort = getTechCardSort(params);

    return {
      totalCount: await models.TechCards.find(query).countDocuments(),
      techCards: await paginate(models.TechCards.find(query).sort(sort), {
        ...params,
      }),
    };
  },

  techCardOutputs: async (
    _root: undefined,
    params: ITechCardOutputListParams,
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('readTechCards');
    const [result] = await models.TechCards.aggregate<{
      rows: ITechCardOutputRow[];
      totalCount: { count: number }[];
    }>(getTechCardOutputsPipeline(params));
    return {
      rows: result?.rows ?? [],
      totalCount: result?.totalCount[0]?.count ?? 0,
    };
  },

  techCardDetail: async (
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('readTechCards');

    return await models.TechCards.getTechCard(_id);
  },
};

export default techCardQueries;
