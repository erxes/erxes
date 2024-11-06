import { getCloseInfo } from "../../../models/utils/closeUtils";
import { getFullDate } from "../../../models/utils/utils";
import { checkPermission, paginate } from "@erxes/api-utils/src";
import { IContext } from "../../../connectionResolver";
import { sendMessageBroker } from "../../../messageBroker";
import { customFieldToObject } from "../utils";

const generateFilter = async (params, commonQuerySelector) => {
  let filter: any = commonQuerySelector;

  filter.status = { $ne: "Deleted" };

  const {
    page,
    perPage,
    ids,
    excludeIds,
    searchValue,
    sortField,
    sortDirection,
    closeDate,
    isExpired,
    closeDateType,
    repaymentDate,
    startStartDate,
    endStartDate,
    leaseTypes,
    dealIds,
    ...otherFilter
  } = params;

  if (ids?.length) {
    filter._id = { [excludeIds ? "$nin" : "$in"]: ids };
  }

  if (dealIds?.length) {
    filter.dealId = { $in: dealIds };
  }

  if (searchValue) {
    filter.number = { $in: [new RegExp(`.*${searchValue}.*`, "i")] };
  }

  if (isExpired === "true") {
    filter.isExpired = !!isExpired;
  }

  if (repaymentDate === "today") {
    const date = getFullDate(new Date());
    filter.repaymentDate = {
      $gte: date,
      $lte: new Date(date.getTime() + 1000 * 3600 * 24)
    };
  }

  if (closeDate) {
    const date = getFullDate(closeDate);
    filter.closeDate = {
      $gte: date,
      $lte: new Date(date.getTime() + 1000 * 3600 * 24)
    };
  }

  if (leaseTypes) {
    otherFilter.leaseType = leaseTypes;
  }

  if (closeDateType) {
    let currentDate = new Date();
    switch (closeDateType) {
      case "today":
        const date = getFullDate(currentDate);
        filter.closeDate = {
          $gte: date,
          $lte: new Date(date.getTime() + 1000 * 3600 * 24)
        };
        break;
      case "thisWeek":
        let firstDayOfWeek = new Date(
          currentDate.setDate(currentDate.getDate() - currentDate.getDay())
        );
        let lastDayOfWeek = new Date(
          currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 6)
        );
        filter.closeDate = {
          $gte: firstDayOfWeek,
          $lte: lastDayOfWeek
        };
        break;
      case "thisMonth":
        let firstDayOfMonth = new Date(
          currentDate.setDate(currentDate.getDate() - currentDate.getDay())
        );
        let lastDayOfMonth = new Date(
          currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 6)
        );
        filter.closeDate = {
          $gte: firstDayOfMonth,
          $lte: lastDayOfMonth
        };
        break;

      default:
        break;
    }

    if (startStartDate || endStartDate) {
      switch (`${!!startStartDate}-${!!endStartDate}`) {
        case "true-true":
          filter.closeDate = {
            $gte: getFullDate(startStartDate),
            $lte: getFullDate(endStartDate)
          };
          break;
        case "false-true":
          filter.closeDate = {
            $lte: getFullDate(endStartDate)
          };
          break;
        case "true-false":
          filter.closeDate = {
            $gte: getFullDate(startStartDate)
          };
          break;
        default:
          break;
      }
    }
  }

  filter = { ...filter, ...(otherFilter || {}) };

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

const contractQueries = {
  /**
   * Contracts list
   */

  contracts: async (
    _root,
    params,
    { commonQuerySelector, models }: IContext
  ) => {
    return await paginate(
      models.Contracts.find(await generateFilter(params, commonQuerySelector)),
      {
        page: params.page,
        perPage: params.perPage
      }
    );
  },

  clientLoansContracts: async (
    _root,
    params,
    { commonQuerySelector, models }: IContext
  ) => {
    if (!params.customerId) throw new Error("Customer not found");
    return await paginate(
      models.Contracts.find(await generateFilter(params, commonQuerySelector)),
      {
        page: params.page,
        perPage: params.perPage
      }
    );
  },

  /**
   * Contracts for only main list
   */

  contractsMain: async (
    _root,
    params,
    { commonQuerySelector, models }: IContext
  ) => {
    const filter = await generateFilter(params, commonQuerySelector);

    return {
      list: await paginate(
        models.Contracts.find(filter).sort(sortBuilder(params)),
        {
          page: params.page,
          perPage: params.perPage
        }
      ),
      totalCount: await models.Contracts.find(filter).countDocuments()
    };
  },

  /**
   * Get one contract
   */

  contractDetail: async (_root, { _id }, { models }: IContext) => {
    return models.Contracts.getContract({ _id });
  },

  closeInfo: async (
    _root,
    { contractId, date },
    { models, subdomain }: IContext
  ) => {
    const contract = await models.Contracts.getContract({
      _id: contractId
    });
    return getCloseInfo(models, subdomain, contract, date);
  },

  contractsAlert: async (_root, { date }, { models }: IContext) => {
    var alerts: { name: string; count: number; filter: any }[] = [];
    const filterDate = getFullDate(new Date(date));
    //expired contracts
    const expiredContracts = await models.Contracts.find({
      endDate: { $lt: filterDate }
    })
      .select({ _id: 1 })
      .lean();

    if (expiredContracts.length > 0) {
      alerts.push({
        name: "Expired contracts",
        count: expiredContracts.length,
        filter: expiredContracts.map(a => a._id)
      });
    }

    return alerts;
  },

  convertToContract: async (_root, params: { contentType: string; id: string }, { models, subdomain }: IContext) => {
    const { contentType, id } = params;
    const mappings = {
      deal: {
        action: "deals.findOne",
        data: { _id: id },
        name: "sales",
        customFieldType: "sales:deal"
      },
      customer: {
        action: "customers.findOne",
        data: { _id: id },
        name: "core",
        customFieldType: "core:customer"
      },
      company: {
        action: "companies.findOne",
        data: { _id: id },
        name: "core",
        customFieldType: "core:company"
      }
    };
    const mapping = mappings[contentType] || mappings.deal;
    const object = await sendMessageBroker(
      {
        subdomain,
        action: mapping.action,
        data: mapping.data,
        isRPC: true,
      },
      mapping.name
    );

    return await customFieldToObject(models, subdomain, mapping.customFieldType, object)
  }
};

checkPermission(contractQueries, "contractsMain", "showContracts");
checkPermission(contractQueries, "contractDetail", "showContracts");
checkPermission(contractQueries, "contracts", "showContracts");

export default contractQueries;
