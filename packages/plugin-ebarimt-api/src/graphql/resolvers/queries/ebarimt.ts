import { getFullDate, getTomorrow } from './utils';
import { paginate, regexSearchText } from '@erxes/api-utils/src';
import {
  sendCardsMessage,
  sendLoansMessage,
  sendPosMessage
} from '../../../messageBroker';
import { IContext } from '../../../connectionResolver';
import { getCompany } from '../../../utils';

const generateFilter = async (subdomain, params, commonQuerySelector) => {
  const filter: any = commonQuerySelector;

  if (params.search) {
    filter.$or = [
      { billId: new RegExp(`.*${params.search}.*`, 'i') },
      { returnBillId: new RegExp(`.*${params.search}.*`, 'i') },
      { number: new RegExp(`.*${params.search}.*`, 'i') }
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
      const posOrders = await sendPosMessage({
        subdomain,
        action: 'orders.find',

        data: { number: { $regex: params.orderNumber, $options: 'mui' } },
        isRPC: true,
        defaultValue: []
      });

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
          data: { ...dealsFilter },
          isRPC: true
        });

        filter.contentId = { $in: (deals || []).map(d => d._id) };
      }
    }

    if (params.contentType === 'loans:transaction') {
      if (params.contractNumber) {
        const loansContracts = await sendLoansMessage({
          subdomain,
          action: 'transactions.findAtContracts',
          data: { number: { $regex: params.contractNumber, $options: 'mui' } },
          isRPC: true,
          defaultValue: []
        });

        filter.contentId = { $in: (loansContracts || []).map(p => p._id) };
      }

      if (params.transactionNumber) {
        const loansTransactions = await sendLoansMessage({
          subdomain,
          action: 'transactions.find',
          data: {
            number: { $regex: params.transactionNumber, $options: 'mui' }
          },
          isRPC: true,
          defaultValue: []
        });

        filter.contentId = { $in: (loansTransactions || []).map(p => p._id) };
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

  if (params.isLast) {
    filter.status = { $ne: 'inactive' };
  }

  return filter;
};

export const sortBuilder = params => {
  const sortField = params.sortField;
  const sortDirection = params.sortDirection || 0;

  if (sortField) {
    return { [sortField]: sortDirection };
  }

  return { createdAt: 1 };
};

const queries = {
  putResponses: async (
    _root,
    params,
    { commonQuerySelector, models, subdomain }: IContext
  ) => {
    const filter = await generateFilter(subdomain, params, commonQuerySelector);

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
    const filter = await generateFilter(subdomain, params, commonQuerySelector);

    return models.PutResponses.find(filter).countDocuments();
  },

  putResponsesAmount: async (
    _root,
    params,
    { commonQuerySelector, models, subdomain }
  ) => {
    const filter = await generateFilter(subdomain, params, commonQuerySelector);
    const res = await models.PutResponses.aggregate([
      { $match: filter },
      { $project: { _id: 1, amount: 1 } },
      { $group: { _id: '', amount: { $sum: { $toDecimal: '$amount' } } } }
    ]);

    if (!res || !res.length) {
      return 0;
    }

    return Number((res[0] || {}).amount || 0);
  },

  putResponsesByDate: async (
    _root,
    params,
    { commonQuerySelector, models, subdomain }: IContext
  ) => {
    const { createdStartDate, createdEndDate, paidDate } = params;

    if (!((createdStartDate && createdEndDate) || paidDate === 'today')) {
      throw new Error('Please, Must choose date filters');
    }

    const csd = new Date(createdStartDate);
    const ced = new Date(createdEndDate);
    if (
      ((ced ? ced.getTime() : 0) - (csd ? csd.getTime() : 0)) /
        (1000 * 60 * 60 * 24) >
      32
    ) {
      throw new Error('The date range exceeds one month');
    }

    const filter = await generateFilter(subdomain, params, commonQuerySelector);

    const responses = await models.PutResponses.find(filter);

    const result = {};
    for (const res of responses) {
      if (!res.date) {
        continue;
      }
      const dateStr = res.date.substring(0, 10);
      if (!Object.keys(result).includes(dateStr)) {
        result[dateStr] = {
          counter: 0,
          cityTax: 0,
          vat: 0,
          amount: 0
        };
      }

      result[dateStr].counter += 1;
      result[dateStr].vat += Number(res.vat) || 0;
      result[dateStr].cityTax += Number(res.cityTax) || 0;
      result[dateStr].amount += Number(res.amount) || 0;
    }

    const dates = Object.keys(result).reverse();
    return dates.map(date => ({ date, values: result[date] }));
  },

  getDealLink: async (_root, param, { subdomain }) => {
    return await sendCardsMessage({
      subdomain,
      action: 'getLink',
      data: { _id: param._id, type: 'deal' },
      isRPC: true
    });
  },

  ebarimtGetCompany: async (
    _root,
    { companyRD }: { companyRD: string },
    { subdomain }
  ) => {
    return getCompany(subdomain, companyRD);
  }
};

export default queries;
