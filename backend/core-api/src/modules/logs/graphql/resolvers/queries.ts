import { ILogDocument } from 'erxes-api-shared/core-types';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
const operatorMap = {
  ne: '$ne',
  eq: '$eq',
  exists: '$exists',
  lt: '$lt',
  lte: '$lte',
  gt: '$gt',
  gte: '$gte',
  contain: '$regex',
  startsWith: '$regex',
  endsWith: '$regex',
};

const generateOperator = (operator) => operatorMap[operator] || '$eq';

const generateValue = (field, value, operator) => {
  if (field === 'createdAt') {
    return new Date(value);
  }
  if (operator === 'startsWith') {
    return new RegExp(`^${value}`, 'i');
  }
  if (operator === 'endsWith') {
    return new RegExp(`${value}$`, 'i');
  }
  if (operator === 'contain') {
    return new RegExp(value, 'i');
  }

  if (operator === 'exists') {
    return JSON.parse(value);
  }

  return value;
};

const generateFilters = (params) => {
  const filter: any = {};

  if (Object.keys(params?.filters || {})?.length) {
    for (const [field, { operator, value }] of Object.entries<{
      operator: string;
      value: string;
    }>(params?.filters)) {
      filter[field] = {
        [generateOperator(operator)]: generateValue(field, value, operator),
      };
    }
  }

  return filter;
};

export const logQueries = {
  async logsMainList(_root, args, { models }: IContext) {
    const filter = generateFilters(args);

    const { list, totalCount, pageInfo } = await cursorPaginate<ILogDocument>({
      model: models.Logs,
      params: {
        ...args,
        orderBy: { createdAt: -1 },
      },
      query: filter,
    });

    return {
      list,
      totalCount,
      pageInfo,
    };
  },

  async logDetail(_root, { _id }, { models }: IContext) {
    return await models.Logs.findOne({ _id });
  },
};
