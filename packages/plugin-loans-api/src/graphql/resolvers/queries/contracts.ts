import { getFullDate } from '../../../models/utils/utils';
import { checkPermission, paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { sendMessageBroker, sendSalesMessage } from '../../../messageBroker';
import { customFieldToObject } from '../utils';
import { getCloseInfo } from '../../../models/utils/closeUtils';
import { generateSchedules } from '../../../models/utils/scheduleUtils';
import { IContractDocument } from '../../../models/definitions/contracts';
import * as moment from 'moment';
import { REPAYMENT } from '../../../models/definitions/constants';

const generateFilter = async (params, commonQuerySelector) => {
  let filter: any = commonQuerySelector;

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
    statuses,
    ...otherFilter
  } = params;

  filter.status = { $ne: 'Deleted' };
  if (statuses?.length) {
    filter.status = { $in: statuses };
  }

  if (ids?.length) {
    filter._id = { [excludeIds ? '$nin' : '$in']: ids };
  }

  if (dealIds?.length) {
    filter.dealId = { $in: dealIds };
  }

  if (searchValue) {
    filter.number = { $in: [new RegExp(`.*${searchValue}.*`, 'i')] };
  }

  if (isExpired === 'true') {
    filter.isExpired = !!isExpired;
  }

  if (repaymentDate === 'today') {
    const date = getFullDate(new Date());
    filter.repaymentDate = {
      $gte: date,
      $lte: new Date(date.getTime() + 1000 * 3600 * 24),
    };
  }

  if (closeDate) {
    const date = getFullDate(closeDate);
    filter.closeDate = {
      $gte: date,
      $lte: new Date(date.getTime() + 1000 * 3600 * 24),
    };
  }

  if (leaseTypes) {
    otherFilter.leaseType = leaseTypes;
  }

  if (closeDateType) {
    let currentDate = new Date();
    switch (closeDateType) {
      case 'today':
        const date = getFullDate(currentDate);
        filter.closeDate = {
          $gte: date,
          $lte: new Date(date.getTime() + 1000 * 3600 * 24),
        };
        break;
      case 'thisWeek':
        let firstDayOfWeek = new Date(
          currentDate.setDate(currentDate.getDate() - currentDate.getDay())
        );
        let lastDayOfWeek = new Date(
          currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 6)
        );
        filter.closeDate = {
          $gte: firstDayOfWeek,
          $lte: lastDayOfWeek,
        };
        break;
      case 'thisMonth':
        let firstDayOfMonth = new Date(
          currentDate.setDate(currentDate.getDate() - currentDate.getDay())
        );
        let lastDayOfMonth = new Date(
          currentDate.setDate(currentDate.getDate() - currentDate.getDay() + 6)
        );
        filter.closeDate = {
          $gte: firstDayOfMonth,
          $lte: lastDayOfMonth,
        };
        break;

      default:
        break;
    }

    if (startStartDate || endStartDate) {
      switch (`${!!startStartDate}-${!!endStartDate}`) {
        case 'true-true':
          filter.closeDate = {
            $gte: getFullDate(startStartDate),
            $lte: getFullDate(endStartDate),
          };
          break;
        case 'false-true':
          filter.closeDate = {
            $lte: getFullDate(endStartDate),
          };
          break;
        case 'true-false':
          filter.closeDate = {
            $gte: getFullDate(startStartDate),
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

export const sortBuilder = (params) => {
  const { sortField, sortDirection } = params;
  let sortOptions: any = { createdAt: -1 }; // Default sort by newest date as secondary

  if (sortField) {
    sortOptions[sortField] = sortDirection || 1;
  }

  return sortOptions;
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
        perPage: params.perPage,
      }
    );
  },

  clientLoansContracts: async (
    _root,
    params,
    { commonQuerySelector, models }: IContext
  ) => {
    if (!params.customerId) throw new Error('Customer not found');
    return await paginate(
      models.Contracts.find(await generateFilter(params, commonQuerySelector)),
      {
        page: params.page,
        perPage: params.perPage,
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
          perPage: params.perPage,
        }
      ),
      totalCount: await models.Contracts.find(filter).countDocuments(),
    };
  },

  /**
   * Get one contract
   */

  contractDetail: async (_root, { _id }, { models }: IContext) => {
    return models.Contracts.getContract({ _id });
  },

  closeInfo: async (_root, { contractId, date }, { models }: IContext) => {
    const contract = await models.Contracts.getContract({
      _id: contractId,
    });
    return await getCloseInfo(models, contract, date);
  },

  contractsAlert: async (_root, { date }, { models }: IContext) => {
    var alerts: { name: string; count: number; filter: any }[] = [];
    const filterDate = getFullDate(new Date(date));
    //expired contracts
    const expiredContracts = await models.Contracts.find({
      endDate: { $lt: filterDate },
    })
      .select({ _id: 1 })
      .lean();

    if (expiredContracts.length > 0) {
      alerts.push({
        name: 'Expired contracts',
        count: expiredContracts.length,
        filter: expiredContracts.map((a) => a._id),
      });
    }

    return alerts;
  },

  convertToContract: async (
    _root,
    params: { contentType: string; id: string },
    { models, subdomain }: IContext
  ) => {
    const { contentType, id } = params;
    const mappings = {
      deal: {
        action: 'deals.findOne',
        data: { _id: id },
        name: 'sales',
        customFieldType: 'sales:deal',
      },
      customer: {
        action: 'customers.findOne',
        data: { _id: id },
        name: 'core',
        customFieldType: 'core:customer',
      },
      company: {
        action: 'companies.findOne',
        data: { _id: id },
        name: 'core',
        customFieldType: 'core:company',
      },
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

    return await customFieldToObject(
      models,
      subdomain,
      mapping.customFieldType,
      object
    );
  },

  dealLoanContract: async (
    _root,
    params: {
      dealId?: string;
      args?: any;
    },
    { subdomain, models }: IContext
  ) => {
    const { dealId, args } = params;

    let fakeContract: IContractDocument = {
      _id: 'tempFakeContract',
      contractDate: new Date(),
      startDate: new Date(),
      endDate: new Date(
        moment(new Date())
          .add(args?.tenor || 1, 'M')
          .format('YYYY-MM-DD')
      ),
      tenor: 1,
      scheduleDays: [new Date().getDate()],
      interestRate: 0,
      repayment: REPAYMENT.FIXED,
      ...(args || {}),
    };

    if (dealId) {
      const contract = await models.Contracts.findOne({ dealId }).lean();
      if (contract?._id) {
        return {
          contract,
          schedules: await models.Schedules.find({ contractId: contract._id }),
          firstSchedules: await models.FirstSchedules.find({
            contractId: contract._id,
          }),
        };
      }

      const deal = await sendSalesMessage({
        subdomain,
        action: 'deals.findOne',
        data: { _id: dealId },
        isRPC: true,
      });

      if (!deal?._id) {
        throw new Error('deal not found');
      }

      const contractData = await customFieldToObject(
        models,
        subdomain,
        'sales:deal',
        deal
      );

      fakeContract = {
        ...fakeContract,
        endDate: moment(new Date()).add(contractData.tenor || 1, 'M'),
        ...contractData,
      };
    }
    const bulkEntries = await generateSchedules(
      subdomain,
      models,
      fakeContract
    );

    return {
      contract: { ...fakeContract },
      schedules: [],
      firstSchedules: bulkEntries,
    };
  },
};

checkPermission(contractQueries, 'contractsMain', 'showContracts');
checkPermission(contractQueries, 'contractDetail', 'showContracts');
checkPermission(contractQueries, 'contracts', 'showContracts');

export default contractQueries;
