import { getFullDate, getTomorrow } from "./utils";
import { paginate, regexSearchText } from "@erxes/api-utils/src";
import {
  sendLoansMessage,
  sendPosMessage,
  sendSalesMessage
} from "../../../messageBroker";
import { IContext } from "../../../connectionResolver";
import { getCompanyInfo, getConfig } from "../../../utils";

const generateFilter = async (subdomain, params, commonQuerySelector) => {
  const filter: any = commonQuerySelector;

  if (params.search) {
    filter.$or = [
      { id: new RegExp(`.*${params.search}.*`, "i") },
      { inactiveId: new RegExp(`.*${params.search}.*`, "i") },
      { number: new RegExp(`.*${params.search}.*`, "i") }
    ];
  }

  if (params.billIdRule) {
    if (params.billIdRule === "00") {
      filter.id = { $in: ["", null] };
      filter.inactiveId = { $in: ["", null] };
    }
    if (params.billIdRule === "01") {
      filter.id = { $in: ["", null] };
      filter.inactiveId = { $nin: ["", null] };
    }
    if (params.billIdRule === "10") {
      filter.id = { $nin: ["", null] };
      filter.inactiveId = { $in: ["", null] };
    }
    if (params.billIdRule === "11") {
      filter.id = { $nin: ["", null] };
      filter.inactiveId = { $nin: ["", null] };
    }
  }

  if (params.contentType) {
    filter.contentType = params.contentType;

    if (params.contentType === "pos" && params.orderNumber) {
      const posOrders = await sendPosMessage({
        subdomain,
        action: "orders.find",

        data: { number: { $regex: params.orderNumber, $options: "mui" } },
        isRPC: true,
        defaultValue: []
      });

      filter.contentId = { $in: (posOrders || []).map(p => p._id) };
    }

    if (params.contentType === "deal") {
      const dealsFilter: any = {};
      if (params.pipelineId) {
        if (params.stageId) {
          dealsFilter.stageId = params.stageId;
        } else {
          const stages = await sendSalesMessage({
            subdomain,
            action: "stages.find",
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
        const deals = await sendSalesMessage({
          subdomain,
          action: "deals.find",
          data: { ...dealsFilter },
          isRPC: true
        });

        filter.contentId = { $in: (deals || []).map(d => d._id) };
      }
    }

    if (params.contentType === "loans:transaction") {
      if (params.contractNumber) {
        const loansContracts = await sendLoansMessage({
          subdomain,
          action: "transactions.findAtContracts",
          data: { number: { $regex: params.contractNumber, $options: "mui" } },
          isRPC: true,
          defaultValue: []
        });

        filter.contentId = { $in: (loansContracts || []).map(p => p._id) };
      }

      if (params.transactionNumber) {
        const loansTransactions = await sendLoansMessage({
          subdomain,
          action: "transactions.find",
          data: {
            number: { $regex: params.transactionNumber, $options: "mui" }
          },
          isRPC: true,
          defaultValue: []
        });

        filter.contentId = { $in: (loansTransactions || []).map(p => p._id) };
      }
    }
  }

  if (params.contentId) {
    filter.contentId = params.contentId;
  }

  if (params.success) {
    filter.status = params.success;
  }

  if (params.billType) {
    filter.type = params.billType;
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

  if (params.paidDate === "today") {
    const now = new Date();

    const startDate = getFullDate(now);
    const endDate = getTomorrow(now);
    filter.createdAt = { $gte: startDate, $lte: endDate };
  }

  if (params.isLast) {
    filter.state = { $ne: "inactive" };
  }

  return filter;
};

export const sortBuilder = params => {
  const {sortField, sortDirection = 0} = params;  

  if (sortField) {
    return { [sortField]: sortDirection };
  }

  return { createdAt: 1 };
};

const genDuplicatedFilter = async params => {
  const { startDate, endDate, billType } = params;

  if (!(startDate && endDate)) {
    throw new Error("Please, Must choose date filters");
  }

  const csd = new Date(startDate);
  const ced = new Date(endDate);
  if (
    ((ced ? ced.getTime() : 0) - (csd ? csd.getTime() : 0)) /
      (1000 * 60 * 60 * 24) >
    32
  ) {
    throw new Error("The date range exceeds one month");
  }

  const filter: any = {};
  const createdQry: any = {};
  if (params.startDate) {
    createdQry.$gte = new Date(startDate);
  }
  if (endDate) {
    createdQry.$lte = new Date(endDate);
  }
  if (Object.keys(createdQry).length) {
    filter.createdAt = createdQry;
  }

  if (billType) {
    filter.type = billType;
  }

  return filter;
};

const queries = {
  putResponses: async (
    _root,
    params,
    { commonQuerySelector, models, subdomain }: IContext
  ) => {
    const filter = await generateFilter(subdomain, params, commonQuerySelector);

    return await paginate(
      models.PutResponses.find(filter).sort(sortBuilder(params) as any),
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
      { $project: { _id: 1, totalAmount: 1 } },
      { $group: { _id: "", amount: { $sum: { $toDecimal: "$totalAmount" } } } }
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

    if (!((createdStartDate && createdEndDate) || paidDate === "today")) {
      throw new Error("Please, Must choose date filters");
    }

    const csd = new Date(createdStartDate);
    const ced = new Date(createdEndDate);
    if (
      ((ced ? ced.getTime() : 0) - (csd ? csd.getTime() : 0)) /
        (1000 * 60 * 60 * 24) >
      32
    ) {
      throw new Error("The date range exceeds one month");
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
      result[dateStr].vat += Number(res.totalVAT) || 0;
      result[dateStr].cityTax += Number(res.totalCityTax) || 0;
      result[dateStr].amount += Number(res.totalAmount) || 0;
    }

    const dates = Object.keys(result).reverse();
    return dates.map(date => ({ date, values: result[date] }));
  },

  getDealLink: async (_root, param, { subdomain }) => {
    return await sendSalesMessage({
      subdomain,
      action: "getLink",
      data: { _id: param._id, type: "deal" },
      isRPC: true
    });
  },

  ebarimtGetCompany: async (
    _root,
    { companyRD }: { companyRD: string },
    { subdomain }
  ) => {
    const config = await getConfig(subdomain, "EBARIMT");
    return getCompanyInfo({
      checkTaxpayerUrl: config.checkTaxpayerUrl,
      no: companyRD
    });
  },

  putResponsesDuplicated: async (_root, params, { models }) => {
    const filter = await genDuplicatedFilter(params);

    const { perPage = 20, page = 1 } = params;

    return await models.PutResponses.aggregate([
      {
        $match: {
          ...filter,
          status: "SUCCESS",
          $or: [{ inactiveId: { $exists: false } }, { inactiveId: "" }],
          state: { $ne: "inactive" }
        }
      },
      {
        $group: {
          _id: { contentId: "$contentId", taxType: "$taxType" },
          count: { $sum: 1 },
          number: { $first: "$number" },
          date: { $first: { $substr: ["$date", 0, 10] } }
        }
      },
      { $match: { count: { $gt: 1 } } },
      { $skip: perPage * (page - 1) },
      { $limit: perPage }
    ]);
  },

  putResponsesDuplicatedCount: async (_root, params, { models }) => {
    const filter = await genDuplicatedFilter(params);

    const res = await models.PutResponses.aggregate([
      {
        $match: {
          ...filter,
          status: "SUCCESS",
          $or: [{ inactiveId: { $exists: false } }, { inactiveId: "" }],
          state: { $ne: "inactive" }
        }
      },
      {
        $group: {
          _id: { contentId: "$contentId", taxType: "$taxType" },
          count: { $sum: 1 },
          number: { $first: "$number" },
          date: { $first: { $substr: ["$date", 0, 10] } }
        }
      },
      { $match: { count: { $gt: 1 } } },
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);

    return (res.length && res[0].count) || 0;
  },

  putResponsesDuplicatedDetail: async (
    _root,
    { contentId, taxType },
    { models }
  ) => {
    return models.PutResponses.find({ contentId, taxType }).lean();
  }
};

export default queries;
