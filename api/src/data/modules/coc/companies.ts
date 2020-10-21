import * as _ from 'underscore';
import { Companies, Conformities, Customers, Integrations } from '../../../db/models';
import { IConformityQueryParams } from '../../resolvers/queries/types';
import { CommonBuilder } from './utils';

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

export interface IListArgs extends IConformityQueryParams {
  segment?: string;
  tag?: string;
  ids?: string[];
  searchValue?: string;
  brand?: string;
  sortField?: string;
  sortDirection?: number;
}

export class Builder extends CommonBuilder<IListArgs> {
  constructor(params: IListArgs, context) {
    super('companies', params, context);
  }

  // filter by brand
  public async brandFilter(brandId: string): Promise<void> {
    const integrations = await Integrations.findIntegrations({ brandId }, { _id: 1 });
    const integrationIds = integrations.map(i => i._id);

    const customers = await Customers.find({ integrationId: { $in: integrationIds } }, { companyIds: 1 });

    const customerIds = await customers.map(customer => customer._id);
    const companyIds = await Conformities.filterConformity({
      mainType: 'customer',
      mainTypeIds: customerIds,
      relType: 'company',
    });

    this.positiveList.push({
      terms: {
        _id: companyIds || [],
      },
    });
  }

  public async findAllMongo(limit: number) {
    const selector = {
      ...this.context.commonQuerySelector,
      status: { $ne: 'deleted' },
    };

    const companies = await Companies.find(selector)
      .sort({ createdAt: -1 })
      .limit(limit);

    const count = await Companies.find(selector).countDocuments();

    return {
      list: companies,
      totalCount: count,
    };
  }

  /*
   * prepare all queries. do not do any action
   */
  public async buildAllQueries(): Promise<void> {
    await super.buildAllQueries();

    // filter by brand
    if (this.params.brand) {
      await this.brandFilter(this.params.brand);
    }
  }
}
