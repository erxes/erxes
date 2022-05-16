import { paginate } from 'erxes-api-utils';
import { getCloseInfo } from '../../../models/utils/closeUtils';
import { getFullDate } from '../../../models/utils/utils';
import { checkPermission } from '@erxes/api-utils/src';

const generateFilter = async (models, params, commonQuerySelector) => {
  const filter: any = commonQuerySelector;

  filter.status = { $ne: 'Deleted' };

  if (params.searchValue) {
    filter.number = { $in: [new RegExp(`.*${params.searchValue}.*`, 'i')] };
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
    { commonQuerySelector, models, checkPermission, user }
  ) => {
    await checkPermission('showContracts', user);

    return paginate(
      models.LoanContracts.find(
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

  contractsMain: async (
    _root,
    params,
    { commonQuerySelector, models, checkPermission, user }
  ) => {
    await checkPermission('showContracts', user);
    const filter = await generateFilter(models, params, commonQuerySelector);

    return {
      list: paginate(
        models.LoanContracts.find(filter).sort(sortBuilder(params)),
        {
          page: params.page,
          perPage: params.perPage
        }
      ),
      totalCount: models.LoanContracts.find(filter).count()
    };
  },

  /**
   * Get one contract
   */

  contractDetail: async (_root, { _id }, { models, checkPermission, user }) => {
    await checkPermission('showContracts', user);
    return models.LoanContracts.getContract(models, { _id });
  },
  cpContracts: async (_root, params, { models }) => {
    const mainType = params.cpUserType || 'customer';
    if (mainType === 'customer') {
      const customer = await models.Customers.getWidgetCustomer({
        email: params.cpUserEmail,
        phone: params.cpUserPhone
      });

      const contractIds = await models.Conformities.savedConformity({
        mainType,
        mainTypeId: customer._id,
        relTypes: ['contract']
      });

      return models.LoanContracts.find({ _id: { $in: contractIds } }).sort({
        createdAt: -1
      });
    }

    let company = await models.Companies.findOne({
      $or: [
        { emails: { $in: [params.cpUserEmail] } },
        { primaryEmail: params.cpUserEmail }
      ]
    }).lean();

    if (!company) {
      company = await models.Companies.findOne({
        $or: [
          { phones: { $in: [params.cpUserPhone] } },
          { primaryPhone: params.cpUserPhone }
        ]
      }).lean();
    }

    if (!company) {
      return [];
    }

    const contractIds = await models.Conformities.savedConformity({
      mainType,
      mainTypeId: company._id,
      relTypes: ['contract']
    });

    return models.LoanContracts.find({ _id: { $in: contractIds } }).sort({
      createdAt: -1
    });
  },

  cpContractDetail: async (_root, { _id }, { models }) => {
    return models.LoanContracts.getContract(models, { _id });
  },

  closeInfo: async (_root, { contractId, date }, { models, memoryStorage }) => {
    const contract = await models.LoanContracts.getContract(models, {
      _id: contractId
    });
    return getCloseInfo(models, memoryStorage, contract, date);
  }
};

checkPermission(contractQueries, 'contractsMain', 'showContracts');
checkPermission(contractQueries, 'contractDetail', 'showContracts');

export default contractQueries;
