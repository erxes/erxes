import { getFullDate, getTomorrow } from './utils';
import { paginate, regexSearchText } from '@erxes/api-utils/src';
import { sendCardsMessage } from '../../../messageBroker';
import { IContext } from '../../../connectionResolver';

const generateFilter = async (
  subdomain,
  models,
  params,
  commonQuerySelector
) => {
  const filter: any = commonQuerySelector;

  if (params.search) {
    filter.$or = [
      { billId: new RegExp(`.*${params.search}.*`, 'i') },
      { returnBillId: new RegExp(`.*${params.search}.*`, 'i') }
    ];
  }

  if (params.billIdRule) {
    if (params.billIdRule === '00') {
      filter.billId = { $in: ['', null] };
      filter.returnBillId = { $in: ['', null] };
    }
    if (params.billIdRule === '01') {
      filter.billId = { $in: ['', null] };
      filter.returnBillId = { $nin: ['', null] };
    }
    if (params.billIdRule === '10') {
      filter.billId = { $nin: ['', null] };
      filter.returnBillId = { $in: ['', null] };
    }
    if (params.billIdRule === '11') {
      filter.billId = { $nin: ['', null] };
      filter.returnBillId = { $nin: ['', null] };
    }
  }

  if (params.contentType) {
    filter.contentType = params.contentType;

    if (params.contentType === 'pos' && params.orderNumber) {
      const posOrders = await models.PosOrders.find(
        { number: { $regex: new RegExp(params.orderNumber) } },
        { _id: 1 }
      ).lean();
      filter.contentId = { $in: (posOrders || []).map(p => p._id) };
    }

    if (params.contentType === 'deal') {
      const dealsFilter: any = {};
      if (params.pipelineId) {
        if (params.stageId) {
          dealsFilter.stageId = params.stageId;
        } else {
          const stages = await sendCardsMessage({
            subdomain,
            action: 'stages.find',
            data: { pipelineId: params.pipelineId },
            isRPC: true
          });

          dealsFilter.stageId = { $in: (stages || []).map(s => s._id) };
        }
      }
      if (params.dealName) {
        Object.assign(dealsFilter, regexSearchText(params.dealName));
      }

      if (Object.keys(dealsFilter).length) {
        const deals = await sendCardsMessage({
          subdomain,
          action: 'deals.find',
          data: { query: dealsFilter },
          isRPC: true
        });

        filter.contentId = { $in: (deals || []).map(d => d._id) };
      }
    }
  }

  if (params.success) {
    filter.success = params.success;
  }

  if (params.billType) {
    filter.billType = params.billType;
  }

  const createdQry: any = {};
  if (params.createdStartDate) {
    createdQry.$gte = new Date(params.createdStartDate);
  }
  if (params.createdEndDate) {
    createdQry.$lte = new Date(params.createdEndDate);
  }
  if (Object.keys(createdQry).length) {
    filter.createdAt = createdQry;
  }

  if (params.paidDate === 'today') {
    const now = new Date();

    const startDate = getFullDate(now);
    const endDate = getTomorrow(now);
    filter.createdAt = { $gte: startDate, $lte: endDate };
  }

  return filter;
};

export const sortBuilder = params => {
  const sortField = params.sortField;
  const sortDirection = params.sortDirection || 0;

  if (sortField) {
    return { [sortField]: sortDirection };
  }

  return {};
};

const queries = {
  putResponses: async (
    _root,
    params,
    { commonQuerySelector, models, subdomain }: IContext
  ) => {
    const filter = await generateFilter(
      subdomain,
      models,
      params,
      commonQuerySelector
    );

    if (params.isLast && params.isLast === '1') {
      const { page = 0, perPage = 0 } = params || { ids: null };
      const _page = Number(page || '1');
      const _limit = Number(perPage || '20');

      return models.PutResponses.aggregate([
        { $match: filter },
        { $sort: { createdAt: 1 } },
        { $group: { _id: '$contentId', doc: { $last: '$$ROOT' } } },
        {
          $replaceRoot: {
            newRoot: '$doc'
          }
        },
        {
          $skip: (_page - 1) * _limit
        },
        {
          $limit: _limit
        }
      ]);
    }

    return await paginate(
      models.PutResponses.find(filter).sort(sortBuilder(params)),
      {
        page: params.page || 1,
        perPage: params.perPage
      }
    );
  },

  putResponsesCount: async (
    _root,
    params,
    { commonQuerySelector, models, subdomain }
  ) => {
    const filter = await generateFilter(
      subdomain,
      models,
      params,
      commonQuerySelector
    );

    if (params.isLast && params.isLast === '1') {
      return (
        await models.PutResponses.aggregate([
          { $match: filter },
          { $sort: { createdAt: 1 } },
          { $group: { _id: '$contentId' } }
        ])
      ).length;
    }

    return models.PutResponses.find(filter).countDocuments();
  },

  putResponsesAmount: async (
    _root,
    params,
    { commonQuerySelector, models, subdomain }
  ) => {
    const filter = await generateFilter(
      subdomain,
      models,
      params,
      commonQuerySelector
    );
    let res: any[];

    if (params.isLast && params.isLast === '1') {
      res = await models.PutResponses.aggregate([
        { $match: filter },
        { $sort: { createdAt: 1 } },
        { $group: { _id: '$contentId', amount: { $last: '$amount' } } },
        { $project: { _id: 1, amount: 1 } },
        { $group: { _id: '', amount: { $sum: { $toDecimal: '$amount' } } } }
      ]);
    } else {
      res = await models.PutResponses.aggregate([
        { $match: filter },
        { $project: { _id: 1, amount: 1 } },
        { $group: { _id: '', amount: { $sum: { $toDecimal: '$amount' } } } }
      ]);
    }
    if (!res || !res.length) {
      return 0;
    }

    return Number((res[0] || {}).amount || 0);
  },

  getDealLink: async (_root, param, { subdomain }) => {
    return await sendCardsMessage({
      subdomain,
      action: 'getLink',
      data: { _id: param._id, type: 'deal' },
      isRPC: true
    });
  }
};

export default queries;
