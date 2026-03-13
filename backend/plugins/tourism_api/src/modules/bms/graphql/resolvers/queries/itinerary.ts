import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

const itineraryQueries = {
  async bmsItineraries(
    _root,
    { branchId, name, ...params },
    { models }: IContext,
  ) {
    const selector: any = {};
    if (branchId) {
      selector.branchId = branchId;
    }
    if (name) {
      selector.name = { $regex: name, $options: 'i' };
    }

    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.Itineraries,
      params,
      query: selector,
    });

    return { list, totalCount, pageInfo };
  },

  async bmsItineraryDetail(_root, { _id }, { models }: IContext) {
    return await models.Itineraries.findById(_id);
  },
};

export default itineraryQueries;
