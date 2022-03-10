import { KIND_CHOICES, TAG_TYPES } from '../../models/definitions/constants';
import { Builder as BuildQuery, IListArgs } from '../../coc/customers';
import {
  countByBrand,
  countByLeadStatus,
  countBySegment,
  countByTag,
  ICountBy
} from '../../coc/utils';
import {
  checkPermission,
  moduleRequireLogin
} from '@erxes/api-utils/src/permissions';
import { IContext, ICoreIModels } from '../../connectionResolver';
interface ICountParams extends IListArgs {
  only: string;
  source: string;
}

const countByIntegrationType = async (qb): Promise<ICountBy> => {
  const counts: ICountBy = {};

  for (const type of KIND_CHOICES.ALL) {
    await qb.buildAllQueries();
    await qb.integrationTypeFilter(type);

    counts[type] = await qb.runQueries('count');
  }

  return counts;
};

const countByForm = async ({ Forms }:ICoreIModels ,qb: any, params: any): Promise<ICountBy> => {
  const counts: ICountBy = {};

  // Count customers by submitted form
  const forms = await Forms.find({}).toArray();

  for (const form of forms) {
    await qb.buildAllQueries();
    await qb.formFilter(form._id, params);

    counts[form._id] = await qb.runQueries('count');
  }

  return counts;
};

const customerQueries = {
  /**
   * Customers list
   */
  async customers(
    _root,
    params: IListArgs,
    { commonQuerySelector, commonQuerySelectorElk, models, coreModels }: IContext
  ) {
    const qb = new BuildQuery(models, coreModels, params, {
      commonQuerySelector,
      commonQuerySelectorElk
    });

    await qb.buildAllQueries();

    const { list } = await qb.runQueries();

    return list;
  },

  /**
   * Customers for only main list
   */
  async customersMain(
    _root,
    params: IListArgs,
    { commonQuerySelector, commonQuerySelectorElk, models, coreModels }: IContext
  ) {
    const qb = new BuildQuery(models, coreModels, params, {
      commonQuerySelector,
      commonQuerySelectorElk
    });

    await qb.buildAllQueries();

    const { list, totalCount } = await qb.runQueries();

    return { list, totalCount };
  },

  /**
   * Group customer counts by brands, segments, integrations, tags
   */
  async customerCounts(
    _root,
    params: ICountParams,
    { commonQuerySelector, commonQuerySelectorElk, models, coreModels }: IContext
  ) {
    const { only, type, source } = params;

    const counts = {
      bySegment: {},
      byBrand: {},
      byIntegrationType: {},
      byTag: {},
      byForm: {},
      byLeadStatus: {}
    };

    const qb = new BuildQuery(models, coreModels, params, {
      commonQuerySelector,
      commonQuerySelectorElk
    });

    switch (only) {
      case 'bySegment':
        counts.bySegment = await countBySegment(type || 'customer', qb, source);
        break;

      case 'byBrand':
        counts.byBrand = await countByBrand(coreModels, qb);
        break;

      case 'byTag':
        counts.byTag = await countByTag(TAG_TYPES.CUSTOMER, qb);
        break;

      case 'byForm':
        counts.byForm = await countByForm(coreModels, qb, params);
        break;

      case 'byLeadStatus':
        counts.byLeadStatus = await countByLeadStatus(qb);
        break;

      case 'byIntegrationType':
        counts.byIntegrationType = await countByIntegrationType(qb);
        break;
    }

    return counts;
  },

  /**
   * Get one customer
   */
  customerDetail(_root, { _id }: { _id: string }, { models : { Customers }}: IContext) {
    return Customers.findOne({ _id });
  }
};

moduleRequireLogin(customerQueries);

checkPermission(customerQueries, 'customers', 'showCustomers', []);
checkPermission(customerQueries, 'customersMain', 'showCustomers', {
  list: [],
  totalCount: 0
});

export default customerQueries;
