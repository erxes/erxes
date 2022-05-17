import * as moment from 'moment';
import * as _ from 'underscore';
import { IModels } from '../connectionResolver';
import { sendFormsMessage, sendInboxMessage } from '../messageBroker';
import { CommonBuilder } from './utils';

interface ISortParams {
  [index: string]: number;
}

const findIntegrations = (subdomain: string, query, options?) =>
  sendInboxMessage({
    subdomain,
    action: 'integrations.find',
    data: { query, options },
    isRPC: true,
    defaultValue: []
  });

export interface IConformityQueryParams {
  conformityMainType?: string;
  conformityMainTypeId?: string;
  conformityRelType?: string;
  conformityIsRelated?: boolean;
  conformityIsSaved?: boolean;
}

export const sortBuilder = (params: IListArgs): ISortParams => {
  const sortField = params.sortField;
  const sortDirection = params.sortDirection || 0;

  let sortParams: ISortParams = { createdAt: -1 };

  if (sortField) {
    sortParams = { [sortField]: sortDirection };
  }

  return sortParams;
};

export interface IListArgs extends IConformityQueryParams {
  segment?: string;
  tag?: string;
  ids?: string[];
  excludeIds?: boolean;
  searchValue?: string;
  brand?: string;
  form?: string;
  startDate?: string;
  endDate?: string;
  leadStatus?: string;
  type?: string;
  integrationType?: string;
  integration?: string;
  sortField?: string;
  sortDirection?: number;
  popupData?: string;
}

export class Builder extends CommonBuilder<IListArgs> {
  constructor(models: IModels, subdomain: string, params: IListArgs, context) {
    super(models, subdomain, 'customers', params, context);

    this.addStateFilter();
  }

  public addStateFilter() {
    if (this.params.type) {
      this.positiveList.push({
        term: {
          state: this.params.type
        }
      });
    }
  }

  public resetPositiveList() {
    this.positiveList = [];

    this.addStateFilter();

    if (this.context.commonQuerySelectorElk) {
      this.positiveList.push(this.context.commonQuerySelectorElk);
    }
  }

  // filter by brand
  public async brandFilter(brandId: string): Promise<void> {
    const integrations = await findIntegrations(this.subdomain, { brandId });

    this.positiveList.push({
      terms: {
        relatedIntegrationIds: integrations.map(i => i._id)
      }
    });
  }

  // filter by integration
  public async integrationFilter(integration: string): Promise<void> {
    const integrations = await findIntegrations(this.subdomain, {
      kind: integration
    });

    /**
     * Since both of brand and integration filters use a same integrationId field
     * we need to intersect two arrays of integration ids.
     */
    this.positiveList.push({
      terms: {
        relatedIntegrationIds: integrations.map(i => i._id)
      }
    });
  }

  // filter by integration kind
  public async integrationTypeFilter(kind: string): Promise<void> {
    const integrations = await findIntegrations(this.subdomain, { kind });

    this.positiveList.push({
      terms: {
        relatedIntegrationIds: integrations.map(i => i._id)
      }
    });
  }

  // filter by form
  public async formFilter(
    subdomain: string,
    formId: string,
    startDate?: string,
    endDate?: string
  ): Promise<void> {
    const submissions = await sendFormsMessage({
      subdomain,
      action: 'submissions.find',
      data: {
        query: {
          formId
        }
      },
      isRPC: true,
      defaultValue: []
    });

    const ids: string[] = [];

    for (const submission of submissions) {
      const { customerId, submittedAt } = submission;

      if (customerId) {
        // Collecting customerIds inbetween dates only
        if (startDate && endDate && !ids.includes(customerId)) {
          if (moment(submittedAt).isBetween(startDate, endDate)) {
            ids.push(customerId);
          }

          // If date is not specified collecting all customers
        } else {
          ids.push(customerId);
        }
      }
    }

    this.positiveList.push({
      terms: {
        _id: ids
      }
    });
  }

  public async findAllMongo(limit: number) {
    const activeIntegrations = await findIntegrations(
      this.subdomain,
      {},
      {
        _id: 1
      }
    );

    const selector = {
      ...this.context.commonQuerySelector,
      status: { $ne: 'deleted' },
      state: this.params.type || 'customer',
      $or: [
        {
          integrationId: { $in: [null, undefined, ''] }
        },
        {
          integrationId: {
            $in: activeIntegrations.map(integration => integration._id)
          }
        }
      ]
    };

    const customers = await this.models.Customers.find(selector)
      .sort({ createdAt: -1 })
      .limit(limit);

    const count = await this.models.Customers.find(selector).countDocuments();

    return {
      list: customers,
      totalCount: count
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

    // filter by integration kind
    if (this.params.integrationType) {
      await this.integrationTypeFilter(this.params.integrationType);
    }

    // filter by integration
    if (this.params.integration) {
      await this.integrationFilter(this.params.integration);
    }

    // filter by form
    if (this.params.form) {
      if (this.params.startDate && this.params.endDate) {
        await this.formFilter(
          this.subdomain,
          this.params.form,
          this.params.startDate,
          this.params.endDate
        );
      } else {
        await this.formFilter(this.subdomain, this.params.form);
      }
    }
  }
}
