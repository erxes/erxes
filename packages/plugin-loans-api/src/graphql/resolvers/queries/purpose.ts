import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';

const generateFilter = async (params, commonQuerySelector) => {
  const filter: any = commonQuerySelector;

  if (params.number) {
    filter.number = { $in: [new RegExp(`.*${params.number}.*`, 'i')] };
  }

  if (params.ids) {
    filter._id = { $in: params.ids };
  }

  if (params.contractId) {
    filter.contractId = params.contractId;
  }

  if (params.companyId) {
    filter.companyId = params.companyId;
  }

  if (params.customerId) {
    filter.customerId = params.customerId;
  }

  return filter;
};

const purposeQueries = {
  /**
   * Purpose for only list
   */

  purposes: async (
    _root,
    params,
    { commonQuerySelector, models }: IContext
  ) => {
    const filter = await generateFilter(params, commonQuerySelector);
    return await paginate(models.LoanPurpose.find(filter), {
      page: params.page,
      perPage: params.perPage,
    });
  },
};

moduleRequireLogin(purposeQueries);

export default purposeQueries;
