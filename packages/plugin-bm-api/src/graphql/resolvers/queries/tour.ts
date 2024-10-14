import { skip } from 'node:test';
import { IContext } from '../../../connectionResolver';

const tourQueries = {
  async bmTours(
    _root,
    { categories, page = 1, perPage = 10 },
    { models }: IContext
  ) {
    const selector: any = {};

    const skip = Math.max(0, page - 1) * perPage;
    if (categories) {
      selector.categories = { $in: categories };
    }

    const list = await models.Tours.find(selector).limit(perPage).skip(skip);
    const total = await models.Tours.countDocuments();
    return {
      list,
      total,
    };
  },
};

export default tourQueries;
