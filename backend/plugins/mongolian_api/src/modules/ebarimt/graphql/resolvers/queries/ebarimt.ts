import { cursorPaginate } from '../../../../../../../../erxes-api-shared/src/utils/mongo/mongoose-utils';
import moment from "moment";
import { regexSearchText } from '../../../../../../../../erxes-api-shared/src/utils/index';
import { nanoid } from "nanoid";
import { IContext } from "../../../connectionResolver";
import { sendTRPCMessage } from '../../../../../../../../erxes-api-shared/src/utils/index';
import { getEbarimtData, IDoc } from '../../../db/models/Ebarimt';
import { getCompanyInfo, getConfig, getPostData } from "../../../utils";
import { getFullDate, getTomorrow } from "./utils";

const generateFilter = async (params: any) => {
  const filter: any = {};

  if (params.search) {
    filter.$or = [
      { id: new RegExp(params.search, "i") },
      { inactiveId: new RegExp(params.search, "i") },
      { number: new RegExp(params.search, "i") },
      { "receipts.id": new RegExp(params.search, "i") },
    ];
  }

  if (params.billIdRule) {
    const ruleMap: any = {
      "00": { id: ["", null], inactiveId: ["", null] },
      "01": { id: ["", null], inactiveId: { $nin: ["", null] } },
      "10": { id: { $nin: ["", null] }, inactiveId: ["", null] },
      "11": { id: { $nin: ["", null] }, inactiveId: { $nin: ["", null] } },
    };
    const rule = ruleMap[params.billIdRule];
    if (rule) Object.assign(filter, rule);
  }

  if (params.contentType) {
    filter.contentType = params.contentType;

    if (params.contentType === "pos" && params.orderNumber) {
      const { pluginName, module, action } = parseAction("pos.orders.find");

      const posOrders = await sendTRPCMessage({
        pluginName,
        module,
        action,
        input: {
          number: { $regex: params.orderNumber, $options: "i" },
        },
      });
      filter.contentId = { $in: (posOrders || []).map((p: any) => p._id) };
    }

    if (params.contentType === "deal") {
      const dealsFilter: any = {};
      if (params.pipelineId) {
        if (params.stageId) {
          dealsFilter.stageId = params.stageId;
        } else {
          const { pluginName, module, action } = parseAction("sales.stages.find");

          const stages = await sendTRPCMessage({
            pluginName,
            module,
            action,
            input: {
              pipelineId: params.pipelineId,
            },
          });
          dealsFilter.stageId = { $in: (stages || []).map((s: any) => s._id) };
        }
      }
      if (params.dealName) Object.assign(dealsFilter, regexSearchText(params.dealName));

      if (Object.keys(dealsFilter).length) {
        const { pluginName, module, action } = parseAction("sales.deals.find");

        const deals = await sendTRPCMessage({
          pluginName,
          module,
          action,
          input: dealsFilter,
        });
        filter.contentId = { $in: (deals || []).map((d: any) => d._id) };
      }
    }

    if (params.contentType === "loans:transaction") {
      if (params.contractNumber) {
        const { pluginName, module, action } = parseAction("loans.transactions.findAtContracts");

        const contracts = await sendTRPCMessage({
          pluginName,
          module,
          action,
          input: {
            number: { $regex: params.contractNumber, $options: "i" },
          },
        });
        filter.contentId = { $in: (contracts || []).map((p: any) => p._id) };
      }

      if (params.transactionNumber) {
        const { pluginName, module, action } = parseAction("loans.transactions.find");

        const transactions = await sendTRPCMessage({
          pluginName,
          module,
          action,
          input: {
            number: { $regex: params.transactionNumber, $options: "i" },
          },
        });
        filter.contentId = { $in: (transactions || []).map((p: any) => p._id) };
      }
    }
  }

  if (params.contentId) filter.contentId = params.contentId;
  if (params.success) filter.status = params.success;
  if (params.billType) filter.type = params.billType;

  if (params.createdStartDate || params.createdEndDate) {
    filter.createdAt = {};
    if (params.createdStartDate) filter.createdAt.$gte = new Date(params.createdStartDate);
    if (params.createdEndDate) filter.createdAt.$lte = new Date(params.createdEndDate);
  }

  if (params.paidDate === "today") {
    const now = new Date();
    filter.createdAt = { $gte: getFullDate(now), $lte: getTomorrow(now) };
  }

  if (params.isLast) filter.state = { $ne: "inactive" };

  return filter;
};

// -----------------------------
// Sorting
// -----------------------------
export const sortBuilder = (params: any) => {
  const { sortField, sortDirection = 0 } = params;
  return sortField ? { [sortField]: sortDirection } : { createdAt: 1 };
};

// Duplicated filter generator
const genDuplicatedFilter = (params: any) => {
  const { startDate, endDate, billType } = params;

  if (!startDate || !endDate) {
    throw new Error("Please, Must choose date filters");
  }

  const csd = new Date(startDate);
  const ced = new Date(endDate);
  if ((ced.getTime() - csd.getTime()) / (1000 * 60 * 60 * 24) > 32) {
    throw new Error("The date range exceeds one month");
  }

  const filter: any = {
    createdAt: { $gte: csd, $lte: ced },
  };
  if (billType) filter.type = billType;

  return filter;
};

// Helper function to parse action strings into MessageProps
const parseAction = (actionString: string): { pluginName: string; module: string; action: string } => {
  const parts = actionString.split('.');
  const pluginName = parts[0];
  const action = parts.pop();
  if (!action) throw new Error(`Invalid action string: ${actionString}`);
  const module = parts.slice(1).join('.');

  return { pluginName, module, action };
};

// Queries
const queries = {
  putResponses: async (_root: any, params: any, { models }: IContext) => {
    const filter = await generateFilter(params);
    return await cursorPaginate({
    model: models.PutResponses,    // ✅ Pass the Model
    params: params,                // ✅ Pass Pagination params (limit, cursor, orderBy...)
    query: filter,
  });
  },

  putResponsesCount: async (_root: any, params: any, { models }: IContext) => {
    const filter = await generateFilter(params);
    return models.PutResponses.countDocuments(filter);
  },

  putResponseDetail: async (
    _root: any,
    { contentType, contentId, stageId, isTemp }: { contentType: string; contentId: string; stageId?: string; isTemp: boolean },
    { models }: IContext
  ) => {
    const putHistory = await models.PutResponses.putHistory({ contentType, contentId });
    if (putHistory) return putHistory;

    if (!isTemp) throw new Error("has not ebarimt");

    if (contentType === "deal") {
      const { pluginName, module, action } = parseAction("sales.deals.findOne");
      const deal = await sendTRPCMessage({
        pluginName,
        module,
        action,
        input: { _id: contentId },
      });
      stageId = stageId || (deal as any).stageId;

      if (!(deal as any)?._id || !stageId) throw new Error("Deal not found");

      const configs = await getConfig("stageInEbarimt");
      if (!Object.keys(configs).includes(stageId)) throw new Error("Ebarimt config not found");

      const config = {
        ...(await getConfig("EBARIMT")),
        ...configs[stageId],
      };

      const { pluginName: pipelinePlugin, module: pipelineModule, action: pipelineAction } = parseAction("sales.pipelines.findOne");
      const pipeline = await sendTRPCMessage({
        pluginName: pipelinePlugin,
        module: pipelineModule,
        action: pipelineAction,
        input: { stageId },
      });
      const ebarimtData: IDoc = await getPostData(models, config, deal, (pipeline as any).paymentTypes);
      const { status, msg, data, innerData } = await getEbarimtData({ config, doc: ebarimtData });

      if (status !== "ok" || (!data && !innerData)) {
        return { _id: nanoid(), id: "Error", status: "ERROR", message: msg };
      }

      const base = {
        id: "Түр баримт",
        status: "SUCCESS",
        date: moment().format("YYYY-MM-DD HH:mm:ss"),
        registerNo: config.companyRD || "",
      };

      return data ? { _id: nanoid(), ...data, ...base } : { ...innerData, ...base };
    }

    return null;
  },

  putResponsesAmount: async (_root: any, params: any, { models }: IContext) => {
    const filter = await generateFilter(params);
    const res = await models.PutResponses.aggregate([
      { $match: filter },
      { $group: { _id: null, amount: { $sum: { $toDecimal: "$totalAmount" } } } },
    ]);
    return res?.[0]?.amount ? Number(res[0].amount) : 0;
  },

  putResponsesByDate: async (_root: any, params: any, { models }: IContext) => {
    const filter = await generateFilter(params);
    const responses = await models.PutResponses.find(filter);
    const result: Record<string, any> = {};

    for (const res of responses) {
      if (!res.date) continue;
      const dateStr = res.date.substring(0, 10);
      if (!result[dateStr])
        result[dateStr] = { counter: 0, cityTax: 0, vat: 0, amount: 0 };

      result[dateStr].counter++;
      result[dateStr].vat += Number(res.totalVAT) || 0;
      result[dateStr].cityTax += Number(res.totalCityTax) || 0;
      result[dateStr].amount += Number(res.totalAmount) || 0;
    }

    return Object.keys(result)
      .reverse()
      .map((date) => ({ date, values: result[date] }));
  },

  getDealLink: async (_root: any, param: any) => {
    const { pluginName, module, action } = parseAction("sales.getLink");
    return await sendTRPCMessage({
      pluginName,
      module,
      action,
      input: { _id: param._id, type: "deal" },
    });
  },

  ebarimtGetCompany: async (_root: any, { companyRD }: { companyRD: string }) => {
  const config = await getConfig("EBARIMT");
  
  return getCompanyInfo({
    checkTaxpayerUrl: config.checkTaxpayerUrl,
    no: companyRD,
  });
  },

  putResponsesDuplicated: async (_root: any, params: any, { models }: IContext) => {
    const filter = genDuplicatedFilter(params);
    const { perPage = 20, page = 1 } = params;

    return models.PutResponses.aggregate([
      {
        $match: {
          ...filter,
          status: "SUCCESS",
          $or: [{ inactiveId: { $exists: false } }, { inactiveId: "" }],
          state: { $ne: "inactive" },
        },
      },
      {
        $group: {
          _id: { contentId: "$contentId", taxType: "$taxType" },
          count: { $sum: 1 },
          number: { $first: "$number" },
          date: { $first: { $substr: ["$date", 0, 10] } },
        },
      },
      { $match: { count: { $gt: 1 } } },
      { $skip: perPage * (page - 1) },
      { $limit: perPage },
    ]);
  },

  putResponsesDuplicatedCount: async (_root: any, params: any, { models }: IContext) => {
    const filter = genDuplicatedFilter(params);
    const res = await models.PutResponses.aggregate([
      {
        $match: {
          ...filter,
          status: "SUCCESS",
          $or: [{ inactiveId: { $exists: false } }, { inactiveId: "" }],
          state: { $ne: "inactive" },
        },
      },
      {
        $group: {
          _id: { contentId: "$contentId", taxType: "$taxType" },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gt: 1 } } },
      { $count: "count" },
    ]);

    return res?.[0]?.count || 0;
  },

  putResponsesDuplicatedDetail: async (_root: any, { contentId, taxType }: { contentId: string; taxType: string }, { models }: IContext) => {
    return models.PutResponses.find({ contentId, taxType }).lean();
  },
};

export default queries;
