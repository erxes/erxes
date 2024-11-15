import { skip } from 'node:test';
import { IContext } from '../../../connectionResolver';

const tourQueries = {
  async bmTours(
    _root,
    { categories, page = 1, perPage = 10, status },
    { models }: IContext
  ) {
    const selector: any = {};

    const skip = Math.max(0, page - 1) * perPage;
    if (categories) {
      selector.categories = { $in: categories };
    }
    if (status) {
      selector.status = status;
    }

    const list = await models.Tours.find(selector).limit(perPage).skip(skip);
    const total = await models.Tours.find(selector).countDocuments();
    return {
      list,
      total,
    };
  },
  async bmTourDetail(_root, { _id }, { models }: IContext) {
    return await models.Tours.findById(_id);
  },
};

export default tourQueries;
