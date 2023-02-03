import { paginate } from '@erxes/api-utils/src';
import { escapeRegExp } from '@erxes/api-utils/src/core';
import { IContext } from '../../../connectionResolver';

const generateFilter = params => {
  let filter: any = {};

  if (params.searchValue) {
    filter.name = { $regex: new RegExp(escapeRegExp(params.searchValue), 'i') };
  }

  return filter;
};

const operationQueries = {
  async operations(_root, params, { models }: IContext) {
    const filter = generateFilter(params);

    return paginate(models.Operations.find(filter), params);
  },
  async operationsTotalCount(_root, params, { models }: IContext) {
    const filter = generateFilter(params);

    return await models.Operations.find(filter).countDocuments();
  },
  async operation(_root, { _id }, { models }: IContext) {
    const operation = await models.Operations.findOne({ _id });

    if (!operation) {
      throw new Error(`Not found operation`);
    }
    return operation;
  }
};

export default operationQueries;
