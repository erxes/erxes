import { Brands, Companies, Segments, Tags } from '../../../db/models';
import { ACTIVITY_CONTENT_TYPES, TAG_TYPES } from '../../../db/models/definitions/constants';
import { COC_LEAD_STATUS_TYPES, COC_LIFECYCLE_STATE_TYPES } from '../../constants';
import { brandFilter, filter, IListArgs, sortBuilder } from '../../modules/coc/companies';
import QueryBuilder from '../../modules/segments/queryBuilder';
import { checkPermission, requireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { paginate } from '../../utils';

interface ICountArgs extends IListArgs {
  only?: string;
  byFakeSegment: any;
}

interface ICountBy {
  [index: string]: number;
}

const count = async (query: any, args: ICountArgs) => {
  const selector = await filter(args);

  const findQuery = { ...selector, ...query };

  return Companies.find(findQuery).countDocuments();
};

const countBySegment = async (commonSelector, args: ICountArgs): Promise<ICountBy> => {
  const counts = {};

  // Count companies by segments =========
  const segments = await Segments.find({
    contentType: ACTIVITY_CONTENT_TYPES.COMPANY,
  });

  for (const s of segments) {
    try {
      counts[s._id] = await count({ ...commonSelector, ...(await QueryBuilder.segments(s)) }, args);
    } catch (e) {
      // catch mongo error
      if (e.name === 'CastError') {
        counts[s._id] = 0;
      } else {
        throw new Error(e);
      }
    }
  }

  return counts;
};

const countByTags = async (commonSelector, args: ICountArgs): Promise<ICountBy> => {
  const counts = {};

  // Count companies by tag =========
  const tags = await Tags.find({ type: TAG_TYPES.COMPANY });

  for (const tag of tags) {
    counts[tag._id] = await count({ ...commonSelector, tagIds: tag._id }, args);
  }

  return counts;
};

const countByBrands = async (commonSelector, args: ICountArgs): Promise<ICountBy> => {
  const counts = {};

  // Count companies by brand =========
  const brands = await Brands.find({});

  for (const brand of brands) {
    counts[brand._id] = await count({ ...commonSelector, ...(await brandFilter(brand._id)) }, args);
  }

  return counts;
};

const companyQueries = {
  /**
   * Companies list
   */
  async companies(_root, params: IListArgs, { commonQuerySelector }: IContext) {
    const selector = { ...commonQuerySelector, ...(await filter(params)) };
    const sort = sortBuilder(params);

    return paginate(Companies.find(selector), params).sort(sort);
  },

  /**
   * Companies for only main list
   */
  async companiesMain(_root, params: IListArgs, { commonQuerySelector }: IContext) {
    const selector = { ...commonQuerySelector, ...(await filter(params)) };
    const sort = sortBuilder(params);

    const list = await paginate(Companies.find(selector).sort(sort), params);
    const totalCount = await Companies.find(selector).countDocuments();

    return { list, totalCount };
  },

  /**
   * Group company counts by segments
   */
  async companyCounts(_root, args: ICountArgs, { commonQuerySelector }: IContext) {
    const counts = {
      bySegment: {},
      byFakeSegment: 0,
      byTag: {},
      byBrand: {},
      byLeadStatus: {},
      byLifecycleState: {},
    };

    const { only } = args;

    switch (only) {
      case 'byTag':
        counts.byTag = await countByTags(commonQuerySelector, args);
        break;
      case 'bySegment':
        counts.bySegment = await countBySegment(commonQuerySelector, args);
        break;
      case 'byBrand':
        counts.byBrand = await countByBrands(commonQuerySelector, args);
        break;
      case 'byLeadStatus':
        {
          // Count companies by lead status ======
          for (const status of COC_LEAD_STATUS_TYPES) {
            counts.byLeadStatus[status] = await count({ ...commonQuerySelector, leadStatus: status }, args);
          }
        }
        break;
      case 'byLifecycleState':
        {
          // Count companies by life cycle state =======
          for (const state of COC_LIFECYCLE_STATE_TYPES) {
            counts.byLifecycleState[state] = await count({ ...commonQuerySelector, lifecycleState: state }, args);
          }
        }
        break;
    }

    // Count companies by fake segment
    if (args.byFakeSegment) {
      counts.byFakeSegment = await count(
        { ...commonQuerySelector, ...(await QueryBuilder.segments(args.byFakeSegment)) },
        args,
      );
    }

    return counts;
  },

  /**
   * Get one company
   */
  companyDetail(_root, { _id }: { _id: string }) {
    return Companies.findOne({ _id });
  },
};

requireLogin(companyQueries, 'companiesMain');
requireLogin(companyQueries, 'companyCounts');
requireLogin(companyQueries, 'companyDetail');

checkPermission(companyQueries, 'companies', 'showCompanies', []);
checkPermission(companyQueries, 'companiesMain', 'showCompanies', { list: [], totalCount: 0 });

export default companyQueries;
