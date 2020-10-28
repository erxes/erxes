import { Companies } from '../../../db/models';
import { TAG_TYPES } from '../../../db/models/definitions/constants';
import { Builder, IListArgs } from '../../modules/coc/companies';
import {
  countByBrand,
  countBySegment,
  countByTag
} from '../../modules/coc/utils';
import { checkPermission, requireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';

interface ICountArgs extends IListArgs {
  only?: string;
}

const companyQueries = {
  /**
   * Companies list
   */
  async companies(
    _root,
    params: IListArgs,
    { commonQuerySelector, commonQuerySelectorElk }: IContext
  ) {
    const qb = new Builder(params, {
      commonQuerySelector,
      commonQuerySelectorElk
    });

    await qb.buildAllQueries();

    const { list } = await qb.runQueries();

    return list;
  },

  /**
   * Companies for only main list
   */
  async companiesMain(
    _root,
    params: IListArgs,
    { commonQuerySelector, commonQuerySelectorElk }: IContext
  ) {
    const qb = new Builder(params, {
      commonQuerySelector,
      commonQuerySelectorElk
    });

    await qb.buildAllQueries();

    const { list, totalCount } = await qb.runQueries();

    return { list, totalCount };
  },

  /**
   * Group company counts by segments
   */
  async companyCounts(
    _root,
    args: ICountArgs,
    { commonQuerySelector, commonQuerySelectorElk }: IContext
  ) {
    const counts = {
      bySegment: {},
      byTag: {},
      byBrand: {},
      byLeadStatus: {}
    };

    const { only } = args;

    const qb = new Builder(args, {
      commonQuerySelector,
      commonQuerySelectorElk
    });

    switch (only) {
      case 'byTag':
        counts.byTag = await countByTag(TAG_TYPES.COMPANY, qb);
        break;

      case 'bySegment':
        counts.bySegment = await countBySegment('company', qb);
        break;
      case 'byBrand':
        counts.byBrand = await countByBrand(qb);
        break;
    }

    return counts;
  },

  /**
   * Get one company
   */
  companyDetail(_root, { _id }: { _id: string }) {
    return Companies.findOne({ _id });
  }
};

requireLogin(companyQueries, 'companiesMain');
requireLogin(companyQueries, 'companyCounts');
requireLogin(companyQueries, 'companyDetail');

checkPermission(companyQueries, 'companies', 'showCompanies', []);
checkPermission(companyQueries, 'companiesMain', 'showCompanies', {
  list: [],
  totalCount: 0
});

export default companyQueries;
