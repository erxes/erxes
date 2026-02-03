import { requireLogin } from 'erxes-api-shared/core-modules';
import { IRoleDocument, IRoleParams } from 'erxes-api-shared/core-types';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

const generateSelector = async ({ role, userId }: IRoleParams) => {
  const filter: any = {};

  if (userId) {
    filter.userId = userId;
  }

  if (role) {
    filter.role = role;
  }

  return filter;
};

export const roleQueries = {
  async roles(_root: undefined, args: IRoleParams, { models }: IContext) {
    const filter = await generateSelector(args);

    const { list, pageInfo, totalCount } = await cursorPaginate<IRoleDocument>({
      model: models.Roles,
      params: args as any,
      query: filter,
    });

    return { list, pageInfo, totalCount };
  },
};

requireLogin(roleQueries, 'roles');