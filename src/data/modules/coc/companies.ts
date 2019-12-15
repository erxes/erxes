import { IConformityQueryParams } from '../../../data/modules/conformities/types';
import { Conformities, Customers, Integrations, Segments } from '../../../db/models';
import { STATUSES } from '../../../db/models/definitions/constants';
import { regexSearchText } from '../../utils';
import QueryBuilder from '../segments/queryBuilder';
import { conformityFilterUtils } from './utils';

export interface IListArgs extends IConformityQueryParams {
  page?: number;
  perPage?: number;
  segment?: string;
  tag?: string;
  ids?: string[];
  searchValue?: string;
  lifecycleState?: string;
  leadStatus?: string;
  sortField?: string;
  sortDirection?: number;
  brand?: string;
}

interface IIn {
  $in: string[];
}

interface IBrandFilter {
  _id: IIn;
}

type TSortBuilder = { primaryName: number } | { [index: string]: number };

export const sortBuilder = (params: IListArgs): TSortBuilder => {
  const sortField = params.sortField;
  const sortDirection = params.sortDirection || 0;

  let sortParams: TSortBuilder = { primaryName: -1 };

  if (sortField) {
    sortParams = { [sortField]: sortDirection };
  }

  return sortParams;
};

/*
 * Brand filter
 */
export const brandFilter = async (brandId: string): Promise<IBrandFilter> => {
  const integrations = await Integrations.findIntegrations({ brandId }, { _id: 1 });
  const integrationIds = integrations.map(i => i._id);

  const customers = await Customers.find({ integrationId: { $in: integrationIds } }, { companyIds: 1 });

  const customerIds = await customers.map(customer => customer._id);
  const companyIds = await Conformities.filterConformity({
    mainType: 'customer',
    mainTypeIds: customerIds,
    relType: 'company',
  });

  return { _id: { $in: companyIds || [] } };
};

export const filter = async (params: IListArgs) => {
  let selector: any = {
    status: { $ne: STATUSES.DELETED },
  };

  // Filter by segments
  if (params.segment) {
    const segment = await Segments.findOne({ _id: params.segment });
    const query = await QueryBuilder.segments(segment);

    Object.assign(selector, query);
  }

  if (params.searchValue) {
    Object.assign(selector, regexSearchText(params.searchValue));
  }

  // Filter by related and saved Conformity
  selector = await conformityFilterUtils(selector, params, 'company');

  // Filter by tag
  if (params.tag) {
    selector.tagIds = params.tag;
  }

  // filter directly using ids
  if (params.ids) {
    selector = { _id: { $in: params.ids } };
  }

  // filter by lead status
  if (params.leadStatus) {
    selector.leadStatus = params.leadStatus;
  }

  // filter by life cycle state
  if (params.lifecycleState) {
    selector.lifecycleState = params.lifecycleState;
  }

  // filter by brandId
  if (params.brand) {
    selector = { ...selector, ...(await brandFilter(params.brand)) };
  }

  return selector;
};
