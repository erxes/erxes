import { IContext } from '~/connectionResolvers';
import { ITriageDocument, ITriageFilter } from '@/task/@types/triage';
import { FilterQuery } from 'mongoose';
import { cursorPaginate, escapeRegExp } from 'erxes-api-shared/utils';

export const triageQueries = {
  operationGetTriage: async (
    _parent: undefined,
    { _id },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('triageRead');

    return models.Triage.getTriage(_id);
  },

  operationGetTriageList: async (
    _parent: undefined,
    { filter = {} }: { filter?: Partial<ITriageFilter> },
    { models, checkPermission }: IContext,
  ) => {
    await checkPermission('triageRead');

    const filterQuery: FilterQuery<ITriageDocument> = {};

    if (filter.name) {
      filterQuery.name = {
        $regex: escapeRegExp(filter.name),
        $options: 'i',
      };
    }

    if (filter.teamId) {
      filterQuery.teamId = filter.teamId;
    }

    if (filter.createdBy) {
      filterQuery.createdBy = filter.createdBy;
    }

    const { list, totalCount, pageInfo } =
      await cursorPaginate<ITriageDocument>({
        model: models.Triage,
        params: {
          ...filter,
          orderBy: {
            createdAt: 'desc',
          },
        },
        query: filterQuery,
      });

    return { list, totalCount, pageInfo };
  },
};
