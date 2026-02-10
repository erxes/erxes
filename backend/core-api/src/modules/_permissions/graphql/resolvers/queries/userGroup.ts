import { IListParams } from 'erxes-api-shared/core-types';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

export const usersGroupQueries = {
  /**
   * Users groups list
   * @param {Object} args - Search params
   * @return {Promise} sorted and filtered users objects
   */
  async usersGroups(_root, params: IListParams, { models }: IContext) {
    const { list, pageInfo, totalCount } = await cursorPaginate({
      model: models.UsersGroups,
      params,
      query: {},
    });

    return { list, pageInfo, totalCount };
  },

  /**
   * Get all groups list. We will use it in pager
   * @return {Promise} total count
   */
  async usersGroupsTotalCount(_root, _args, { models }: IContext) {
    return models.UsersGroups.find({}).countDocuments();
  },
};
