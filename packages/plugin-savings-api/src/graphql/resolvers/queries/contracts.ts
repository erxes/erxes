import { getCloseInfo } from '../../../models/utils/closeUtils';
import { getFullDate } from '../../../models/utils/utils';
import { checkPermission, paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';

const generateFilter = async (models, params, commonQuerySelector) => {
  const filter: any = commonQuerySelector;

  filter.status = { $ne: 'Deleted' };

  if (params.searchValue) {
    filter.number = { $in: [new RegExp(`.*${params.searchValue}.*`, 'i')] };
  }

  if (params.status) {
    filter.status = params.status;
  }

  // if (params.ids) {
  //   filter._id = { $in: params.ids };
  // }

  if (params.closeDate) {
    const date = getFullDate(params.closeDate);
    filter.closeDate = {
      $gte: date,
      $lte: new Date(date.getTime() + 1000 * 3600 * 24)
    };
  }

  if (
    params.conformityMainTypeId &&
    params.conformityMainType &&
    params.conformityIsSaved
  ) {
    filter._id = {
      $in: await models.Conformities.savedConformity({
        mainType: params.conformityMainType,
        mainTypeId: params.conformityMainTypeId,
        relTypes: ['contract', 'contractSub']
      })
    };
  }
  if (
    params.conformityMainTypeId &&
    params.conformityMainType &&
    params.conformityIsRelated
  ) {
    let ids = [];
    ids = ids.concat(
      await models.Conformities.relatedConformity({
        mainType: params.conformityMainType,
        mainTypeId: params.conformityMainTypeId,
        relType: 'contract'
      })
    );
    ids = ids.concat(
      await models.Conformities.relatedConformity({
        mainType: params.conformityMainType,
        mainTypeId: params.conformityMainTypeId,
        relType: 'contractSub'
      })
    );
    filter._id = { $in: ids };
  }

  if (params.contractTypeId) {
    filter.contractTypeId = params.contractTypeId;
  }

  if (params.isExpired === 'true') {
    filter.isExpired = !!params.isExpired;
  }

  if (params.repaymentDate === 'today') {
    const date = getFullDate(new Date());
    filter.repaymentDate = {
      $gte: date,
      $lte: new Date(date.getTime() + 1000 * 3600 * 24)
    };
  }

  if (!!params.closeDateType) {
    let currentDate = new Date();
    switch (params.closeDateType) {
      case 'today':
        const date = getFullDate(currentDate);
        filter.closeDate = {
          $gte: date,
          $lte: new Date(date.getTime() + 1000 * 3600 * 24)
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
          $lte: lastDayOfWeek
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
          $lte: lastDayOfMonth
        };
        break;

      default:
        break;
    }
  }

  if (params.startStartDate || params.endStartDate) {
    switch (`${!!params.startStartDate}-${!!params.endStartDate}`) {
      case 'true-true':
        filter.closeDate = {
          $gte: getFullDate(params.startStartDate),
          $lte: getFullDate(params.endStartDate)
        };
        break;
      case 'false-true':
        filter.closeDate = {
          $lte: getFullDate(params.endStartDate)
        };
        break;
      case 'true-false':
        filter.closeDate = {
          $gte: getFullDate(params.startStartDate)
        };
        break;
      default:
        break;
    }
  }

  if (params.startCloseDate || params.endCloseDate) {
    switch (`${!!params.startCloseDate}-${!!params.endCloseDate}`) {
      case 'true-true':
        filter.closeDate = {
          $gte: getFullDate(params.startCloseDate),
          $lte: getFullDate(params.endCloseDate)
        };
        break;
      case 'false-true':
        filter.closeDate = {
          $lte: getFullDate(params.endCloseDate)
        };
        break;
      case 'true-false':
        filter.closeDate = {
          $gte: getFullDate(params.startCloseDate)
        };
        break;
      default:
        break;
    }
  }

  if (params.customerId) {
    filter.customerId = params.customerId;
  }
  if (params.branchId) {
    filter.branchId = params.branchId;
  }

  if (params.savingAmount) {
    filter.savingAmount = params.savingAmount;
  }

  if (params.interestRate) {
    filter.interestRate = params.interestRate;
  }

  if (params.dealId) {
    filter.dealId = params.dealId;
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

const contractQueries = {
  /**
   * Contracts list
   */

  savingsContracts: async (
    _root,
    params,
    { commonQuerySelector, models }: IContext
  ) => {
    return paginate(
      models.Contracts.find(
        await generateFilter(models, params, commonQuerySelector)
      ),
      {
        page: params.page,
        perPage: params.perPage
      }
    );
  },

  /**
   * Contracts for only main list
   */

  savingsContractsMain: async (
    _root,
    params,
    { commonQuerySelector, models }: IContext
  ) => {
    const filter = await generateFilter(models, params, commonQuerySelector);

    return {
      list: paginate(models.Contracts.find(filter).sort(sortBuilder(params)), {
        page: params.page,
        perPage: params.perPage
      }),
      totalCount: models.Contracts.find(filter).count()
    };
  },

  /**
   * Get one contract
   */

  savingsContractDetail: async (_root, { _id }, { models }: IContext) => {
    return models.Contracts.getContract({ _id });
  },

  /**
   */
  savingsCloseInfo: async (
    _root,
    { contractId, date },
    { models, subdomain }: IContext
  ) => {
    const contract = await models.Contracts.getContract({
      _id: contractId
    });
    return getCloseInfo(models, subdomain, contract, date);
  },

  savingsContractsAlert: async (_root, {}, { models }: IContext) => {
    const contracts = await models.Contracts.getContractAlert();

    return contracts;
  }
};

checkPermission(
  contractQueries,
  'savingsContractsMain',
  'savingsShowContracts'
);
checkPermission(
  contractQueries,
  'savingsContractDetail',
  'savingsShowContracts'
);
checkPermission(contractQueries, 'savingsContracts', 'savingsShowContracts');

export default contractQueries;
