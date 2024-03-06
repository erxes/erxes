import { IContext } from '../../../connectionResolver';
import { paginate } from '@erxes/api-utils/src';
import graphqlPubsub from '@erxes/api-utils/src/graphqlPubsub';

const generateFilter = async (params, commonQuerySelector) => {
  const { type } = params;

  let filter: any = {};

  if (type) {
    filter.type = type;
  }

  return filter;
};

export const sortBuilder = (params) => {
  const sortField = params.sortField;
  const sortDirection = params.sortDirection || 0;

  if (sortField) {
    return { [sortField]: sortDirection };
  }

  return {};
};

const SectionQueries = {
  /**
   * Section list
   */

  sections: async (
    _root,
    params,
    { commonQuerySelector, models }: IContext,
  ) => {
    return models.Sections.find(
      await generateFilter(params, commonQuerySelector),
    );
  },
};

export default SectionQueries;
