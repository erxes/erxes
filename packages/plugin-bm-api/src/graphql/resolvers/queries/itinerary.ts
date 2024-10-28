import { skip } from 'node:test';
import { IContext } from '../../../connectionResolver';

const itineraryQueries = {
  async bmItineraries(
    _root,
    { categories, page = 1, perPage = 10 },
    { models }: IContext
  ) {
    const selector: any = {};

    const skip = Math.max(0, page - 1) * perPage;
    if (categories) {
      selector.categories = { $in: categories };
    }

    const list = await models.Itineraries.find(selector)
      .limit(perPage)
      .skip(skip);
    const total = await models.Itineraries.countDocuments();
    return {
      list,
      total,
    };
  },
  async bmItineraryDetail(_root, { _id }, { models }: IContext) {
    return await models.Itineraries.findById(_id);
  },
};

export default itineraryQueries;
