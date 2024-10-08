import { skip } from 'node:test';
import { IContext } from '../../../connectionResolver';

const tourQueries = {
  async bmTours(
    _root,
    { categories, page, perPage = 10 },
    { models }: IContext
  ) {
    const selector: any = {};

    const skip = Math.max(0, page) * perPage;
    if (categories) {
      selector.categories = { $in: categories };
    }

    return await models.Tours.find(selector).limit(perPage).skip(skip);
  },
};

export default tourQueries;
